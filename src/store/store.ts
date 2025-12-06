// src/app/store.ts
import {
  configureStore,
  combineReducers,
} from '@reduxjs/toolkit';

import sessionReducer from '../store/slices/sessionSlice';
import preferencesReducer from '../store/slices/preferencesSlice';
import workspaceReducer from '../store/slices/workspaceSlice';
import uiReducer from '../store/slices/uiSlice';

import { loadPersistedState, savePersistedState } from '../utility/state/statePersistence';

// 1️⃣ Build a proper rootReducer function
const rootReducer = combineReducers({
  session: sessionReducer,
  preferences: preferencesReducer,
  workspace: workspaceReducer,
  ui: uiReducer,
});

// 2️⃣ RootState is derived from rootReducer
export type RootState = ReturnType<typeof rootReducer>;

// Optional: if you ever reuse this (tests etc.)
export type AppStore = ReturnType<typeof setupStore>;
export type AppDispatch = AppStore['dispatch'];

// 3️⃣ You can wrap store creation if you want to reuse in tests
// 3️⃣ You can wrap store creation if you want to reuse in tests
export const setupStore = (preloadedState?: Partial<RootState>) =>
  configureStore({
    reducer: rootReducer,
    preloadedState,
  });
// 4️⃣ Load persisted state and create the real store
// 4️⃣ Load persisted state and create the real store
const persisted = loadPersistedState();
// Cast once at the boundary so TS stops complaining
export const store = setupStore(persisted as Partial<RootState> | undefined);
// 5️⃣ Subscribe to persist only the slices we care about
store.subscribe(() => {
  const state = store.getState();

  savePersistedState({
    preferences: state.preferences,
    ui: state.ui,
  });
});
