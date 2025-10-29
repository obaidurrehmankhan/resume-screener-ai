import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Analysis } from '../../database/entities/analysis.entity';
import { Draft } from '../../database/entities/draft.entity';
import { Job } from '../../database/entities/job.entity';
import { AnalysisQueueRegistration } from '../jobs/queues/analysis.queue';
import { AnalysisProcessor } from '../jobs/processors/analysis.processor';
import { AnalysesService } from './analyses.service';
import { AnalysisScoringService } from './analysis-scoring.service';
import { AnalysesController } from './analyses.controller';
import { OptionalJwtAuthGuard } from '../../common/security/optional-jwt-auth.guard';
import { GuestSessionGuard } from '../guest/guest-session.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([Analysis, Draft, Job]),
    AnalysisQueueRegistration,
  ],
  controllers: [AnalysesController],
  providers: [
    AnalysesService,
    AnalysisProcessor,
    AnalysisScoringService,
    OptionalJwtAuthGuard,
    GuestSessionGuard,
  ],
  exports: [AnalysesService],
})
export class AnalysesModule {}
