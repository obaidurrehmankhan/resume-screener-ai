import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { UserPayload } from '../types/user-payload';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(private readonly configService: ConfigService) {
        const cookieExtractor = (req: Request) => req?.cookies?.access_token ?? null;
        super({
            jwtFromRequest: ExtractJwt.fromExtractors([
                cookieExtractor,
                ExtractJwt.fromAuthHeaderAsBearerToken(),
            ]),
            secretOrKey:
                configService.get<string>('JWT_ACCESS_SECRET') ||
                configService.get<string>('JWT_SECRET') ||
                'supersecretkey',
            ignoreExpiration: false,
        });
    }

    async validate(payload: UserPayload): Promise<UserPayload> {
        return payload;
    }
}
