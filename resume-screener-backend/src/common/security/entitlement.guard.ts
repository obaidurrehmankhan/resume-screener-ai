import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { appLogger } from '../logger/app.logger';
import { Entitlement } from '../types/entitlements';
import { EntitlementsService } from './entitlements.service';
import { REQUIRED_ENTITLEMENTS_KEY } from './entitlement.decorator';

type RequestUser = { id?: string; role?: string; plan?: string | null };

@Injectable()
export class EntitlementGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly entitlementsService: EntitlementsService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<Entitlement[]>(
      REQUIRED_ENTITLEMENTS_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!required?.length) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request & { user?: RequestUser }>();
    const { plan, entitlements } = this.entitlementsService.getEntitlements({
      user: request.user,
      hasGuestSession: Boolean(request.cookies?.guest_session),
    });

    const hasAll = required.every((entitlement) => entitlements.has(entitlement));
    if (hasAll) {
      return true;
    }

    const requestId =
      (request as unknown as Record<string, unknown>).requestId ??
      (request.headers?.['x-request-id'] as string | undefined);

    appLogger.warn({
      requestId,
      userId: request.user?.id,
      plan,
      requiredEntitlements: required,
    }, 'Entitlement check failed');

    throw new ForbiddenException('Missing required entitlements');
  }
}
