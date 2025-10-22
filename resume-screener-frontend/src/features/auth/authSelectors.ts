import type { RootState } from '@/app/store';

export const selectIsLoggedIn = (state: RootState) => Boolean(state.auth.user);
export const selectEntitlements = (state: RootState) => state.auth.entitlements;
export const selectPlan = (state: RootState) => state.auth.plan;
export const selectHasEntitlement = (state: RootState, entitlement: string) =>
    state.auth.entitlements.includes(entitlement);
export const selectAuthHydrated = (state: RootState) => state.auth.hydrated;
