import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';

import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { User } from '../user/user.entity';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Module({
    imports: [
        TypeOrmModule.forFeature([User]), // Inject User repo
        JwtModule.register({
            secret: process.env.JWT_SECRET || 'supersecretkey',
            signOptions: { expiresIn: '1h' },
        })
    ],
    controllers: [AuthController],
    providers: [AuthService, JwtStrategy, JwtAuthGuard],
    exports: [JwtAuthGuard], // if used in other modules

})
export class AuthModule { }
