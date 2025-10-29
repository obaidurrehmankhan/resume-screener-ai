import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Queue } from 'bullmq';
import { Repository } from 'typeorm';
import { appLogger } from '../../common/logger/app.logger';
import { Analysis } from '../../database/entities/analysis.entity';
import { Draft, DraftStatus } from '../../database/entities/draft.entity';
import { Job as JobEntity, JobStatus, JobType } from '../../database/entities/job.entity';
import { AnalysisQueuePayload, ANALYSIS_QUEUE_NAME } from '../jobs/queues/analysis.queue';
import { AnalysisScoringService, AnalysisScoringResult } from './analysis-scoring.service';

export interface RunAnalysisJobPayload {
  userId?: string;
  guestSessionId?: string;
  resumeText?: string;
  jobDescription?: string;
}

interface RunAnalysisJobOptions {
  idempotencyKey?: string;
}

@Injectable()
export class AnalysesService {
  constructor(
    @InjectRepository(Analysis)
    private readonly analysisRepository: Repository<Analysis>,
    @InjectRepository(Draft)
    private readonly draftRepository: Repository<Draft>,
    @InjectRepository(JobEntity)
    private readonly jobRepository: Repository<JobEntity>,
    private readonly analysisScoringService: AnalysisScoringService,
    @InjectQueue(ANALYSIS_QUEUE_NAME)
    private readonly analysisQueue: Queue<AnalysisQueuePayload>,
  ) {}

  async runAnalysisJob(
    draftId: string,
    payload: RunAnalysisJobPayload,
    options: RunAnalysisJobOptions = {},
  ): Promise<{ jobId: string; reused?: boolean }> {
    const draft = await this.draftRepository.findOne({ where: { id: draftId } });

    if (!draft) {
      throw new NotFoundException('Draft not found');
    }

    this.ensureDraftOwnership(draft, payload);

    const { idempotencyKey } = options;

    if (idempotencyKey) {
      const existingJob = await this.findJobByIdempotencyKey(
        draft.id,
        idempotencyKey,
      );

      if (existingJob) {
        appLogger.info(
          {
            event: 'job_idempotent_hit',
            queue: ANALYSIS_QUEUE_NAME,
            jobId: existingJob.id,
            draftId,
            userId: payload.userId,
            idempotencyKey,
          },
          'analysis job idempotency key hit',
        );

        return { jobId: existingJob.id, reused: true };
      }
    }

    draft.status = DraftStatus.IN_REVIEW;
    await this.draftRepository.save(draft);

    const jobRecord = this.jobRepository.create({
      draftId,
      userId: payload.userId,
      type: JobType.ANALYSIS,
      status: JobStatus.QUEUED,
      meta: {
        queue: ANALYSIS_QUEUE_NAME,
        ...(payload.guestSessionId ? { guestSessionId: payload.guestSessionId } : {}),
        ...(idempotencyKey ? { idempotencyKey } : {}),
      },
    });

    const job = await this.jobRepository.save(jobRecord);

    const jobData: AnalysisQueuePayload = {
      jobEntityId: job.id,
      draftId,
      userId: payload.userId,
      guestSessionId: payload.guestSessionId,
      resumeText: payload.resumeText,
      jobDescription: payload.jobDescription,
    };

    try {
      await this.analysisQueue.add('run', jobData, {
        jobId: job.id,
      });
    } catch (error) {
      await this.jobRepository.update(job.id, {
        status: JobStatus.FAILED,
        finishedAt: new Date(),
        error: {
          name: error instanceof Error ? error.name : 'Error',
          message: error instanceof Error ? error.message : 'Queue enqueue failed',
        },
      });

      throw error;
    }

    appLogger.info(
      {
        event: 'job_queued',
        queue: ANALYSIS_QUEUE_NAME,
        jobId: job.id,
        draftId,
        userId: payload.userId,
        idempotencyKey,
      },
      'analysis job queued',
    );

    return { jobId: job.id, reused: false };
  }

  async processAnalysisJob(data: AnalysisQueuePayload): Promise<Analysis> {
    const draft = await this.draftRepository.findOne({ where: { id: data.draftId } });

    if (!draft) {
      throw new NotFoundException('Draft not found for analysis job');
    }

    const scoringResult: AnalysisScoringResult = await this.analysisScoringService.scoreDraft({
      draftId: data.draftId,
      resumeText: data.resumeText,
      jobDescription: data.jobDescription,
      userId: data.userId,
      guestSessionId: data.guestSessionId,
    });

    const analysis = this.analysisRepository.create({
      draftId: draft.id,
      jobId: data.jobEntityId,
      atsScore: scoringResult.atsScore,
      matchScore: scoringResult.matchScore,
      missingSkills: scoringResult.missingSkills,
      panelsAllowed: scoringResult.panelsAllowed,
      parsingMeta: scoringResult.parsingMeta,
      keywordHits: scoringResult.keywordHits,
    });

    const savedAnalysis = await this.analysisRepository.save(analysis);

    draft.status = DraftStatus.READY;
    draft.latestAnalysisId = savedAnalysis.id;
    await this.draftRepository.save(draft);

    return savedAnalysis;
  }

  private ensureDraftOwnership(
    draft: Draft,
    payload: RunAnalysisJobPayload,
  ): void {
    if (draft.userId) {
      if (!payload.userId || payload.userId !== draft.userId) {
        throw new ForbiddenException('Draft not accessible');
      }

      return;
    }

    if (draft.guestSessionId) {
      if (!payload.guestSessionId || payload.guestSessionId !== draft.guestSessionId) {
        throw new ForbiddenException('Draft not accessible');
      }
    }
  }

  private async findJobByIdempotencyKey(
    draftId: string,
    idempotencyKey: string,
  ): Promise<JobEntity | null> {
    const recentJobs = await this.jobRepository.find({
      where: {
        draftId,
        type: JobType.ANALYSIS,
      },
      order: {
        createdAt: 'DESC',
      },
      take: 10,
    });

    return (
      recentJobs.find((job) => {
        const meta = job.meta ?? {};
        if (typeof meta !== 'object' || meta === null) {
          return false;
        }

        return (
          (meta as Record<string, unknown>).idempotencyKey === idempotencyKey ||
          (meta as Record<string, unknown>).idemKey === idempotencyKey
        );
      }) ?? null
    );
  }
}
