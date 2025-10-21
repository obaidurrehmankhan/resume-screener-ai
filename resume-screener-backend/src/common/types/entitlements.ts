export enum Plan {
  VISITOR = 'VISITOR',
  FREE = 'FREE',
  PRO = 'PRO',
  ADMIN = 'ADMIN',
}

export enum Entitlement {
  ATS_VIEW = 'ATS_VIEW',
  MATCH_VIEW = 'MATCH_VIEW',
  SUGGESTIONS_VIEW = 'SUGGESTIONS_VIEW',
  EXPORT = 'EXPORT',
  ADMIN_MANAGE_USERS = 'ADMIN_MANAGE_USERS',
}

export const PLAN_ENTITLEMENTS: Record<Plan, ReadonlyArray<Entitlement>> = {
  [Plan.VISITOR]: [Entitlement.ATS_VIEW],
  [Plan.FREE]: [Entitlement.ATS_VIEW],
  [Plan.PRO]: [
    Entitlement.ATS_VIEW,
    Entitlement.MATCH_VIEW,
    Entitlement.SUGGESTIONS_VIEW,
    Entitlement.EXPORT,
  ],
  [Plan.ADMIN]: [
    Entitlement.ATS_VIEW,
    Entitlement.MATCH_VIEW,
    Entitlement.SUGGESTIONS_VIEW,
    Entitlement.EXPORT,
    Entitlement.ADMIN_MANAGE_USERS,
  ],
};

export const PANEL_ENTITLEMENTS: Record<string, Entitlement> = {
  ATS: Entitlement.ATS_VIEW,
  MATCH: Entitlement.MATCH_VIEW,
  SUGGESTIONS: Entitlement.SUGGESTIONS_VIEW,
};
