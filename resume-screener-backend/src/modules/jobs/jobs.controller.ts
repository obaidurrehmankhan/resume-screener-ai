import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { JobsService } from './jobs.service';
import { OptionalJwtAuthGuard } from '../../common/security/optional-jwt-auth.guard';
import { GuestSessionGuard } from '../guest/guest-session.guard';
import { UserPayload } from '../auth/types/user-payload';
import { Job } from '../../database/entities/job.entity';
import { Analysis } from '../../database/entities/analysis.entity';
import { appLogger } from '../../common/logger/app.logger';

interface Envelope<T> {
  data: T;
  requestId?: string;
  meta: Record<string, unknown>;
}

interface JobResponse {
  job: {
    id: string;
    type: string;
    status: string;
    draftId?: string;
    createdAt: Date;
    startedAt?: Date;
    finishedAt?: Date;
    meta?: Record<string, unknown> | null;
    error?: Record<string, unknown> | null;
  };
  result?: Record<string, unknown>;
}

@ApiTags('Jobs')
@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Get(':jobId')
  @UseGuards(OptionalJwtAuthGuard, GuestSessionGuard)
  @ApiOperation({
    summary: 'Get job status and result (if completed)',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns job status and optional result payload',
  })
  @ApiResponse({ status: 401, description: 'Authentication required when accessing a user job.' })
  @ApiResponse({ status: 403, description: 'Job/result not accessible for the current session.' })
  @ApiResponse({ status: 404, description: 'Job or related draft not found.' })
  async getJob(
    @Param('jobId', ParseUUIDPipe) jobId: string,
    @Req() req: Request & { user?: UserPayload | null; guestSessionId?: string; requestId?: string },
  ): Promise<Envelope<JobResponse>> {
    const userId = req.user?.sub;
    const guestSessionId = req.guestSessionId ?? req.cookies?.guest_session;

    const jobWithResult = await this.jobsService.getJobWithResult(jobId, {
      userId,
      guestSessionId,
    });

    appLogger.debug(
      {
        event: 'job_fetched',
        jobId,
        status: jobWithResult.job.status,
      },
      'job status retrieved',
    );

    return this.wrapResponse(req, this.mapJobResponse(jobWithResult));
  }

  private mapJobResponse(jobWithResult: { job: Job; analysis?: Analysis }): JobResponse {
    const { job, analysis } = jobWithResult;

    const response: JobResponse = {
      job: {
        id: job.id,
        type: job.type,
        status: job.status,
        draftId: job.draftId,
        createdAt: job.createdAt,
        startedAt: job.startedAt,
        finishedAt: job.finishedAt,
        meta: job.meta ?? null,
        error: job.error ?? null,
      },
    };

    if (analysis) {
      response.result = {
        analysis: {
          id: analysis.id,
          draftId: analysis.draftId,
          jobId: analysis.jobId,
          atsScore: analysis.atsScore,
          matchScore: analysis.matchScore,
          missingSkills: analysis.missingSkills,
          panelsAllowed: analysis.panelsAllowed,
          parsingMeta: analysis.parsingMeta,
          keywordHits: analysis.keywordHits,
          createdAt: analysis.createdAt,
        },
      };
    }

    return response;
  }

  private wrapResponse<T>(
    req: Request & { requestId?: string },
    data: T,
    meta: Record<string, unknown> = {},
  ): Envelope<T> {
    const requestId =
      req.requestId ??
      (typeof req.headers['x-request-id'] === 'string'
        ? req.headers['x-request-id']
        : undefined);

    return {
      data,
      ...(requestId ? { requestId } : {}),
      meta,
    };
  }
}
