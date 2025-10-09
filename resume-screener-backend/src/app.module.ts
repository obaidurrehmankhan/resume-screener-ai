import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const dbUrl = config.get<string>('DATABASE_URL');

        if (dbUrl) {
          return {
            type: 'postgres',
            url: dbUrl,
            entities: [__dirname + '/**/*.entity{.ts,.js}'],
            migrations: ['dist/migrations/*.js'],
            migrationsRun: true,
            synchronize: false,
            ssl: false, // for local development
            namingStrategy: new SnakeNamingStrategy(),
            timezone: 'Z', // UTC
          };
        }

        return {
          type: 'postgres',
          host: config.get<string>('DB_HOST'),
          port: config.get<number>('DB_PORT'),
          username: config.get<string>('DB_USERNAME'),
          password: config.get<string>('DB_PASSWORD'),
          database: config.get<string>('DB_NAME'),
          entities: [__dirname + '/database/entities/*.entity{.ts,.js}'],
          migrations: [__dirname + '/database/migrations/*{.ts,.js}'],
          migrationsRun: true,
          synchronize: false,
          ssl: false,
          namingStrategy: new SnakeNamingStrategy(),
          timezone: 'Z',
        };
      },
    }),
    AuthModule,
    UserModule,
    HealthModule
  ],
})
export class AppModule { }
