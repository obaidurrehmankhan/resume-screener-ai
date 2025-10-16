import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../src/auth/auth.module';
import { UserModule } from '../src/user/user.module';
import { dataSourceOptions } from '../src/database/data-source';
import { AppController } from '../src/app.controller';
import { AppService } from '../src/app.service';

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        TypeOrmModule.forRoot({
            ...dataSourceOptions,
            synchronize: true,
            dropSchema: true,
            migrationsRun: false,
            logging: false,
        }),
        AuthModule,
        UserModule,
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class TestModule { }
