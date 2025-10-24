import { Processor, WorkerHost } from '@nestjs/bullmq';
import { InjectRepository } from '@nestjs/typeorm';
import { Job } from 'bullmq';
import { Repository } from 'typeorm';
import { appLogger } from '../../../common/logger/app.logger';
import { Analysis } from '../../../database/entities/analysis.entity';
import { Job as JobEntity, JobStatus } from '../../../database/entities/job.entity';
import { AnalysesService } from '../../analyses/analyses.service';
import { AnalysisQueuePayload, ANALYSIS_QUEUE_NAME } from '../queues/analysis.queue';

const WORKER_CONCURRENCY = Number(process.env.ANALYSIS_WORKER_CONCURRENCY ?? '2') || 2;

@Processor(ANALYSIS_QUEUE_NAME, {
  concurrency: WORKER_CONCURRENCY,
})
export class AnalysisProcessor extends WorkerHost {
  constructor(
    private readonly analysesService: AnalysesService,
    @InjectRepository(JobEntity)
    private readonly jobRepository: Repository<JobEntity>,
  ) {
    super();
  }

  async process(job: Job<AnalysisQueuePayload>): Promise<{ analysisId: string }> {
    const jobId = job.data.jobEntityId;
    const draftId = job.data.draftId;
    const userId = job.data.userId;
    const startedAt = new Date();

    await this.jobRepository.update(jobId, {
      status: JobStatus.RUNNING,
      startedAt,
    });

    appLogger.info(
      {
        event: 'job_started',
        queue: ANALYSIS_QUEUE_NAME,
        jobId,
        draftId,
        userId,
      },
      'analysis job started',
    );

    try {
      const analysis: Analysis = await this.analysesService.processAnalysisJob(job.data);

      await this.jobRepository.update(jobId, {
        status: JobStatus.COMPLETED,
        finishedAt: new Date(),
        meta: {
          analysisId: analysis.id,
        },
      });

      appLogger.info(
        {
          event: 'job_completed',
          queue: ANALYSIS_QUEUE_NAME,
          jobId,
          draftId,
          userId,
        },
        'analysis job completed',
      );

      return { analysisId: analysis.id };
    } catch (error) {
      await this.jobRepository.update(jobId, {
        status: JobStatus.FAILED,
        finishedAt: new Date(),
        error: {
          name: error instanceof Error ? error.name : 'Error',
          message: error instanceof Error ? error.message : 'Analysis job failed',
        },
      });

      appLogger.error(
        {
          event: 'job_failed',
          queue: ANALYSIS_QUEUE_NAME,
          jobId,
          draftId,
          userId,
          code: error instanceof Error ? error.name : 'Error',
          message: error instanceof Error ? error.message : 'Analysis job failed',
        },
        'analysis job failed',
      );

      throw error;
    }
  }
}
