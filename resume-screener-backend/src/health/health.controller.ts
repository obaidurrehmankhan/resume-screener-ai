import { Controller, Get, HttpException, HttpStatus } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { SkipThrottle } from '@nestjs/throttler';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Health')
@Controller('healthz')
export class HealthController {
    constructor(
        @InjectDataSource()
        private dataSource: DataSource,
    ) { }

    @SkipThrottle()
    @Get()
    @ApiOperation({ summary: 'Health check endpoint' })
    @ApiResponse({ status: 200, description: 'Service and database are available.' })
    @ApiResponse({ status: 503, description: 'Database is not reachable.' })
    async check() {
        try {
            await this.dataSource.query('SELECT 1');
            return { ok: true, db: 'up' };
        } catch (error) {
            throw new HttpException(
                { ok: false, db: 'down' },
                HttpStatus.SERVICE_UNAVAILABLE,
                { cause: error },
            );
        }
    }
}
