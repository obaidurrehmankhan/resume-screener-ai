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
}

const initialState: AuthState = {
  user: null,
  plan: null,
  entitlements: [],
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
    },
    clearSession(state) {
      state.user = null;
      state.plan = null;
      state.entitlements = [];
    },
  },
});

export const { setSession, clearSession } = authSlice.actions;
export default authSlice.reducer;
