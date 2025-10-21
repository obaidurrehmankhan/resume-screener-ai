import { Injectable } from '@nestjs/common';
import { UserRole } from '../enums/user-role.enum';
import { Entitlement, PLAN_ENTITLEMENTS, Plan, PANEL_ENTITLEMENTS } from '../types/entitlements';

interface EntitlementInput {
  user?: { role?: UserRole; plan?: Plan | string | null };
  hasGuestSession?: boolean;
}

@Injectable()
export class EntitlementsService {
  getEntitlements(input: EntitlementInput = {}) {
    const plan = this.resolvePlan(input);
    return {
      plan,
      entitlements: new Set(PLAN_ENTITLEMENTS[plan]),
    };
  }

  panelsAllowed(entitlements: Set<Entitlement>) {
    return Object.entries(PANEL_ENTITLEMENTS)
      .filter(([, entitlement]) => entitlements.has(entitlement))
      .map(([panel]) => panel);
  }

  private resolvePlan({ user, hasGuestSession }: EntitlementInput): Plan {
    if (user) {
      const explicit = this.parsePlan(user.plan);
      if (explicit) {
        return explicit;
      }
      if (user.role === UserRole.ADMIN) {
        return Plan.ADMIN;
      }
      return Plan.FREE;
    }
    return hasGuestSession ? Plan.VISITOR : Plan.VISITOR;
  }

  private parsePlan(plan?: Plan | string | null): Plan | undefined {
    if (!plan) {
      return undefined;
    }
    const candidate = plan.toUpperCase() as Plan;
    return PLAN_ENTITLEMENTS[candidate] ? candidate : undefined;
  }
}
