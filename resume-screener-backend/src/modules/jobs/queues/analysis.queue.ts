import { BullModule } from '@nestjs/bullmq';

export const ANALYSIS_QUEUE_NAME = 'analysis.run';

export const AnalysisQueueRegistration = BullModule.registerQueue({
  name: ANALYSIS_QUEUE_NAME,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000,
    },
    removeOnComplete: true,
  },
});

export interface AnalysisQueuePayload {
  jobEntityId: string;
  draftId: string;
  userId?: string;
  guestSessionId?: string;
  resumeText?: string;
  jobDescription?: string;
}
