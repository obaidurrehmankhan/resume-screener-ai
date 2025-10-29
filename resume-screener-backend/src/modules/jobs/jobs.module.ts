import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JobsController } from './jobs.controller';
import { JobsService } from './jobs.service';
import { Job } from '../../database/entities/job.entity';
import { Draft } from '../../database/entities/draft.entity';
import { Analysis } from '../../database/entities/analysis.entity';
import { OptionalJwtAuthGuard } from '../../common/security/optional-jwt-auth.guard';
import { GuestSessionGuard } from '../guest/guest-session.guard';

@Module({
  imports: [TypeOrmModule.forFeature([Job, Draft, Analysis])],
  controllers: [JobsController],
  providers: [JobsService, OptionalJwtAuthGuard, GuestSessionGuard],
  exports: [JobsService],
})
export class JobsModule {}
