import { Controller, Post, Get, Param, UseGuards, Req, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiCookieAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { GuestService } from './guest.service';
import { GuestSessionGuard } from './guest-session.guard';
import { Request } from 'express';

@ApiTags('Guest')
@Controller('guest')
@UseGuards(GuestSessionGuard)
@ApiCookieAuth('guest_session')
export class GuestController {
    constructor(private readonly guestService: GuestService) { }

    @Post('drafts')
    @ApiOperation({ summary: 'Create a new guest draft' })
    @ApiResponse({ status: 201, description: 'Draft created successfully' })
    async createDraft(@Req() req: Request) {
        return this.guestService.createDraft(req['guestSessionId']);
    }

    @Get('drafts/:id')
    @ApiOperation({ summary: 'Get a guest draft by ID' })
    @ApiResponse({ status: 200, description: 'Draft found' })
    @ApiResponse({ status: 404, description: 'Draft not found' })
    async getDraft(@Param('id') id: string, @Req() req: Request) {
        return this.guestService.getDraft(id, req['guestSessionId']);
    }

    @Post('analyses')
    @Throttle({ default: { limit: 2, ttl: 60000 } })
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Create analysis for a draft' })
    @ApiResponse({ status: 201, description: 'Analysis created successfully' })
    @ApiResponse({
        status: 429, description: 'Too Many Requests', schema: {
            properties: {
                cooldownSec: { type: 'number' }
            }
        }
    })
    async createAnalysis(@Req() req: Request) {
        return this.guestService.createAnalysis(req.body.draftId, req['guestSessionId']);
    }
}