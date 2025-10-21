import { SetMetadata } from '@nestjs/common';
import { Entitlement } from '../types/entitlements';

export const REQUIRED_ENTITLEMENTS_KEY = 'requiredEntitlements';

export const RequiresEntitlements = (...entitlements: Entitlement[]) =>
  SetMetadata(REQUIRED_ENTITLEMENTS_KEY, entitlements);
