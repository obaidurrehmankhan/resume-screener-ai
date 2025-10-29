import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';

@Injectable()
export class OptionalJwtAuthGuard
  extends AuthGuard('jwt')
  implements CanActivate
{
  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      await super.canActivate(context);
    } catch (error) {
      // If the underlying guard throws because no token was provided, swallow it.
      // Other errors (malformed/expired tokens) will surface in handleRequest below.
    }

    return true;
  }

  handleRequest<TUser = any>(
    err: unknown,
    user: TUser,
    info?: unknown,
    context?: ExecutionContext,
    status?: unknown,
  ): TUser {
    if (err) {
      throw err;
    }

    if (info && info instanceof Error) {
      const message = info.message ?? 'Unauthorized';

      if (message !== 'No auth token') {
        throw new UnauthorizedException(message);
      }

      const request = context?.switchToHttp().getRequest<Request>();
      if (request) {
        request.user = undefined as never;
      }

      return null as unknown as TUser;
    }

    return (user ?? null) as TUser;
  }
}
