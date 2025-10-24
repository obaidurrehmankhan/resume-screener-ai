import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Analysis } from '../../database/entities/analysis.entity';
import { Draft } from '../../database/entities/draft.entity';
import { Job } from '../../database/entities/job.entity';
import { AnalysisQueueRegistration } from '../jobs/queues/analysis.queue';
import { AnalysisProcessor } from '../jobs/processors/analysis.processor';
import { AnalysesService } from './analyses.service';
import { AnalysisScoringService } from './analysis-scoring.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Analysis, Draft, Job]),
    AnalysisQueueRegistration,
  ],
  providers: [AnalysesService, AnalysisProcessor, AnalysisScoringService],
  exports: [AnalysesService],
})
export class AnalysesModule {}
