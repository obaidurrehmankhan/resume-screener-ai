import { Controller, Get, HttpException, HttpStatus } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { SkipThrottle } from '@nestjs/throttler';

@Controller('healthz')
export class HealthController {
    constructor(
        @InjectDataSource()
        private dataSource: DataSource,
    ) { }

    @SkipThrottle()
    @Get()
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
