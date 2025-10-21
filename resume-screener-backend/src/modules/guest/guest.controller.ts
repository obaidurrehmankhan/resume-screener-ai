import { Controller, Post, Get, Param, UseGuards, HttpCode, HttpStatus, Body } from '@nestjs/common';
import { ApiTags, ApiCookieAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { GuestService } from './guest.service';
import { GuestSessionGuard } from './guest-session.guard';
import { GuestSession } from './decorators/guest-session.decorator';
import { CreateAnalysisDto } from './dto/create-analysis.dto';

@ApiTags('Guest')
@Controller('guest')
@UseGuards(GuestSessionGuard)
@ApiCookieAuth('guest_session')
export class GuestController {
    constructor(private readonly guestService: GuestService) { }

    // @Post('drafts')
    // @ApiOperation({ summary: 'Create a new guest draft' })
    // @ApiResponse({ status: 201, description: 'Draft created successfully' })
    // async createDraft(@GuestSession() guestSessionId: string) {
    //     return this.guestService.createDraft(guestSessionId);
    // }

    // @Get('drafts/:id')
    // @ApiOperation({ summary: 'Get a guest draft by ID' })
    // @ApiResponse({ status: 200, description: 'Draft found' })
    // @ApiResponse({ status: 404, description: 'Draft not found' })
    // async getDraft(@Param('id') id: string, @GuestSession() guestSessionId: string) {
    //     return this.guestService.getDraft(id, guestSessionId);
    // }

    // @Post('analyses')
    // @Throttle({ default: { limit: 2, ttl: 60000 } })
    // @HttpCode(HttpStatus.CREATED)
    // @ApiOperation({ summary: 'Create analysis for a draft' })
    // @ApiResponse({ status: 201, description: 'Analysis created successfully' })
    // @ApiResponse({
    //     status: 429, description: 'Too Many Requests', schema: {
    //         properties: {
    //             cooldownSec: { type: 'number' }
    //         }
    //     }
    // })
    // async createAnalysis(
    //     @Body() dto: CreateAnalysisDto,
    //     @GuestSession() guestSessionId: string,
    // ) {
    //     return this.guestService.createAnalysis(dto.draftId, guestSessionId);
    // }
}
