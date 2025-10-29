import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Job, JobType } from '../../database/entities/job.entity';
import { Draft } from '../../database/entities/draft.entity';
import { Analysis } from '../../database/entities/analysis.entity';

export interface JobViewerContext {
  userId?: string;
  guestSessionId?: string;
}

export interface JobWithResult {
  job: Job;
  analysis?: Analysis;
}

@Injectable()
export class JobsService {
  constructor(
    @InjectRepository(Job)
    private readonly jobRepository: Repository<Job>,
    @InjectRepository(Draft)
    private readonly draftRepository: Repository<Draft>,
    @InjectRepository(Analysis)
    private readonly analysisRepository: Repository<Analysis>,
  ) {}

  async getJobWithResult(
    jobId: string,
    context: JobViewerContext,
  ): Promise<JobWithResult> {
    const job = await this.jobRepository.findOne({ where: { id: jobId } });

    if (!job) {
      throw new NotFoundException('Job not found');
    }

    if (!job.draftId) {
      throw new NotFoundException('Draft not found for job');
    }

    const draft = await this.draftRepository.findOne({
      where: { id: job.draftId },
    });

    if (!draft) {
      throw new NotFoundException('Draft not found for job');
    }

    this.ensureDraftOwnership(draft, context);

    if (job.type !== JobType.ANALYSIS) {
      return { job };
    }

    const analysisId =
      (job.meta as Record<string, unknown> | null)?.analysisId ??
      draft.latestAnalysisId;

    if (!analysisId || typeof analysisId !== 'string') {
      return { job };
    }

    const analysis = await this.analysisRepository.findOne({
      where: { id: analysisId },
    });

    if (!analysis) {
      return { job };
    }

    return {
      job,
      analysis,
    };
  }

  private ensureDraftOwnership(
    draft: Draft,
    context: JobViewerContext,
  ): void {
    if (draft.userId) {
      if (!context.userId || draft.userId !== context.userId) {
        throw new ForbiddenException('Draft not accessible');
      }

      return;
    }

    if (draft.guestSessionId) {
      if (
        !context.guestSessionId ||
        context.guestSessionId !== draft.guestSessionId
      ) {
        throw new ForbiddenException('Draft not accessible');
      }
    }
  }
}
