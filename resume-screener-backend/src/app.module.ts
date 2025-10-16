import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { HealthModule } from './health/health.module';
import { GuestModule } from './guest/guest.module';
import { dataSourceOptions } from './database/data-source';
import { LoggerModule } from './common/logger/logger.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
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
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule { }
