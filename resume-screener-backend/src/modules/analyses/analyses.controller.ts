import {
  Body,
  Controller,
  Headers,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiHeader, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { AnalysesService } from './analyses.service';
import { RunAnalysisDto } from './dto/run-analysis.dto';
import { GuestSessionGuard } from '../guest/guest-session.guard';
import { OptionalJwtAuthGuard } from '../../common/security/optional-jwt-auth.guard';
import { UserPayload } from '../auth/types/user-payload';

interface Envelope<T> {
  data: T;
  requestId?: string;
  meta: Record<string, unknown>;
}

@ApiTags('Analyses')
@Controller('drafts')
export class AnalysesController {
  constructor(private readonly analysesService: AnalysesService) {}

  @Post(':draftId/analysis')
  @UseGuards(OptionalJwtAuthGuard, GuestSessionGuard)
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({
    summary: 'Kick off an analysis job for the draft',
  })
  @ApiHeader({
    name: 'Idempotency-Key',
    required: false,
    description: 'Idempotency key to deduplicate identical analysis requests.',
  })
  @ApiResponse({
    status: 202,
    description: 'Analysis job enqueued',
  })
  @ApiResponse({ status: 401, description: 'Authentication required when accessing a user draft.' })
  @ApiResponse({ status: 403, description: 'Draft not accessible for current session.' })
  @ApiResponse({ status: 404, description: 'Draft not found.' })
  async enqueueAnalysis(
    @Param('draftId', ParseUUIDPipe) draftId: string,
    @Body() body: RunAnalysisDto,
    @Headers('idempotency-key') idempotencyKey: string | undefined,
    @Req() req: Request & { user?: UserPayload | null; guestSessionId?: string; requestId?: string },
  ): Promise<Envelope<{ jobId: string }>> {
    const userId = req.user?.sub;
    const guestSessionId = req.guestSessionId ?? req.cookies?.guest_session;

    const enqueueResult = await this.analysesService.runAnalysisJob(
      draftId,
      {
        userId,
        guestSessionId,
        resumeText: body.resumeText,
        jobDescription: body.jobDescription,
      },
      { idempotencyKey },
    );

    return this.wrapResponse(req, { jobId: enqueueResult.jobId }, {
      idempotentReused: enqueueResult.reused ?? false,
    });
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
