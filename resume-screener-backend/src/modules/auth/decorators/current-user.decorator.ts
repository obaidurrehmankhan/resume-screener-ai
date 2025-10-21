import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserPayload } from '../types/user-payload';

export const CurrentUser = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): UserPayload | undefined => {
    const request = ctx.switchToHttp().getRequest<{ user?: UserPayload }>();
    return request.user;
  },
);
