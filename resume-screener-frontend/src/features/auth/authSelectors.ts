import type { RootState } from '@/app/store'

export const selectIsLoggedIn = (state: RootState) =>
    Boolean(state.auth.token && state.auth.user)