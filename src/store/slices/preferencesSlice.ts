// src/features/preferences/preferencesSlice.ts
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export type ThemeMode = 'light' | 'dark' | 'custom';

export interface PreferencesState {
  themeMode: ThemeMode;
  density: 'comfortable' | 'compact';
}

const initialState: PreferencesState = {
  themeMode: 'light',
  density: 'comfortable',
};

const preferencesSlice = createSlice({
  name: 'preferences',
  initialState,
  reducers: {
    setThemeMode(state, action: PayloadAction<ThemeMode>) {
      state.themeMode = action.payload;
    },
    toggleThemeMode(state) {
      if (state.themeMode === 'dark') {
        state.themeMode = 'light';
      } else {
        state.themeMode = 'dark';
      }
    },
    setDensity(state, action: PayloadAction<PreferencesState['density']>) {
      state.density = action.payload;
    },
  },
});

export const { setThemeMode, toggleThemeMode, setDensity } =
  preferencesSlice.actions;

export default preferencesSlice.reducer;
