import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, NotFoundException } from '@nestjs/common';
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
  ): Promise<{ jobId: string }> {
    const draft = await this.draftRepository.findOne({ where: { id: draftId } });

    if (!draft) {
      throw new NotFoundException('Draft not found');
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
      },
      'analysis job queued',
    );

    return { jobId: job.id };
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
}
