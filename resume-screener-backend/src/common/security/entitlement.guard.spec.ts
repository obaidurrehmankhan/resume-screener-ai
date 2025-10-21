import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { appLogger } from '../logger/app.logger';
import { Entitlement } from '../types/entitlements';
import { EntitlementsService } from './entitlements.service';
import { EntitlementGuard } from './entitlement.guard';
import { UserRole } from '../enums/user-role.enum';

describe('EntitlementGuard', () => {
  it('denies when required entitlements are missing', () => {
    const reflector = {
      getAllAndOverride: jest.fn().mockReturnValue([Entitlement.EXPORT]),
    } as unknown as Reflector;
    const service = new EntitlementsService();
    jest.spyOn(appLogger, 'warn').mockImplementation(() => undefined as never);
    const guard = new EntitlementGuard(reflector, service);

    const context = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: () => ({
        getRequest: () => ({
          user: { role: UserRole.USER },
          cookies: {},
          requestId: 'req-1',
        }),
      }),
    } as unknown as ExecutionContext;

    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });
});
