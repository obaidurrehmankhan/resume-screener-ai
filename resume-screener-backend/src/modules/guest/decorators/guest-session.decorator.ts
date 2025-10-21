import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const GuestSession = createParamDecorator(
  (_data: unknown, context: ExecutionContext): string | undefined => {
    const request = context.switchToHttp().getRequest<{ guestSessionId?: string }>();
    return request.guestSessionId;
  },
);
