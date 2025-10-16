import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Draft } from '../database/entities/draft.entity';
import { Analysis } from '../database/entities/analysis.entity';
import { GuestController } from './guest.controller';
import { GuestService } from './guest.service';
import { GuestSessionGuard } from './guest-session.guard';


@Module({
    imports: [
        TypeOrmModule.forFeature([Draft, Analysis])
    ],
    controllers: [GuestController],
    providers: [GuestService, GuestSessionGuard],
})
export class GuestModule { }