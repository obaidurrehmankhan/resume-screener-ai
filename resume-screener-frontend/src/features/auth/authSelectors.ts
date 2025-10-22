import type { RootState } from '@/app/store';

export const selectIsLoggedIn = (state: RootState) => Boolean(state.auth.user);
export const selectEntitlements = (state: RootState) => state.auth.entitlements;
export const selectPlan = (state: RootState) => state.auth.plan;
