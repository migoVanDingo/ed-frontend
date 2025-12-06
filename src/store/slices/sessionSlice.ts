// src/features/session/sessionSlice.ts
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface UserSummary {
  id: string;
  email: string;
  displayName?: string;
  // maybe orgId, roles, etc.
}

interface SessionState {
  user: UserSummary | null;
  isAuthenticated: boolean;
  status: 'idle' | 'loading' | 'authenticated' | 'error';
  error?: string;
}

const initialState: SessionState = {
  user: null,
  isAuthenticated: false,
  status: 'idle',
};

const sessionSlice = createSlice({
  name: 'session',
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<UserSummary | null>) {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
      state.status = action.payload ? 'authenticated' : 'idle';
    },
    setSessionStatus(
      state,
      action: PayloadAction<SessionState['status']>
    ) {
      state.status = action.payload;
    },
    setSessionError(state, action: PayloadAction<string | undefined>) {
      state.error = action.payload;
      if (action.payload) state.status = 'error';
    },
    logout(state) {
      state.user = null;
      state.isAuthenticated = false;
      state.status = 'idle';
      state.error = undefined;
    },
  },
});

export const { setUser, setSessionStatus, setSessionError, logout } =
  sessionSlice.actions;

export default sessionSlice.reducer;
