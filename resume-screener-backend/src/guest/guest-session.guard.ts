import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Request, Response } from 'express';
import { randomUUID } from 'crypto';

@Injectable()
export class GuestSessionGuard implements CanActivate {
    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest<Request>();
        const response = context.switchToHttp().getResponse<Response>();

        let sessionId = request.cookies['guest_session'];

        // Create new session if none exists
        if (!sessionId) {
            sessionId = randomUUID();
            response.cookie('guest_session', sessionId, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 24 * 60 * 60 * 1000 // 24 hours
            });
        }

        // Attach session ID to request for use in controller
        request['guestSessionId'] = sessionId;
        return true;
    }
}
