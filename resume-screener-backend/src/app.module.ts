import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { BullModule } from '@nestjs/bullmq';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { HealthModule } from './health/health.module';
import { GuestModule } from './modules/guest/guest.module';
import { dataSourceOptions } from './database/data-source';
import { LoggerModule } from './common/logger/logger.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AnalysesModule } from './modules/analyses/analyses.module';
import { JobsModule } from './modules/jobs/jobs.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const redisUrl = config.get<string>('REDIS_URL') ?? 'redis://127.0.0.1:6379';

        return {
          connection: {
            url: redisUrl,
          },
        };
      },
    }),
    TypeOrmModule.forRoot({
      ...dataSourceOptions,
      autoLoadEntities: false,
    }),
    ThrottlerModule.forRoot([{
      ttl: 60,
      limit: 2,
    }]),
    AuthModule,
    UserModule,
    HealthModule,
    LoggerModule,
    GuestModule,
    AnalysesModule,
    JobsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule { }
