import { Controller, Get } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Controller('healthz')
export class HealthController {
    constructor(
        @InjectDataSource()
        private dataSource: DataSource,
    ) { }

    @Get()
    async check() {
        try {
            await this.dataSource.query('SELECT 1');
            return { ok: true, db: 'up' };
        } catch (error) {
            return { ok: true, db: 'down' };
        }
    }
}