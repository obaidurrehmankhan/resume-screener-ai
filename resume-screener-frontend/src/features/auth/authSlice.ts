import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: string;
};

export interface AuthState {
  user: SessionUser | null;
  plan: string | null;
  entitlements: string[];
  hydrated: boolean;
}

const initialState: AuthState = {
  user: null,
  plan: null,
  entitlements: [],
  hydrated: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setSession(
      state,
      action: PayloadAction<{
        user: SessionUser | null;
        plan: string | null;
        entitlements: string[] | undefined;
      }>,
    ) {
      state.user = action.payload.user;
      state.plan = action.payload.plan;
      state.entitlements = action.payload.entitlements ?? [];
      state.hydrated = true;
    },
    clearSession(state) {
      state.user = null;
      state.plan = null;
      state.entitlements = [];
      state.hydrated = true;
    },
    setHydrated(state, action: PayloadAction<boolean>) {
      state.hydrated = action.payload;
    },
  },
});

export const { setSession, clearSession, setHydrated } = authSlice.actions;
export default authSlice.reducer;
