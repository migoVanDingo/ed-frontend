// theme/ThemeProvider.tsx
import {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
} from 'react';
import { ThemeProvider as MuiThemeProvider, CssBaseline } from '@mui/material';

import { getTheme } from './theme.ts';
import GlobalCssOverrides from './GlobalCssOverrides.tsx';

import { useAppDispatch, useAppSelector } from '../hooks/reduxHook.ts';
import {
  setThemeMode,
  toggleThemeMode as toggleThemeModeAction,
  type ThemeMode,
} from '../store/slices/preferencesSlice.ts';

interface ColorModeContextType {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
}

const ColorModeContext = createContext<ColorModeContextType | undefined>(
  undefined
);

export function useColorMode() {
  const context = useContext(ColorModeContext);
  if (!context) {
    throw new Error('useColorMode must be used within ThemeProvider');
  }
  return context;
}

export function AppThemeProvider({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch();
  const mode = useAppSelector((state) => state.preferences.themeMode);

  const setMode = (newMode: ThemeMode) => {
    dispatch(setThemeMode(newMode));
  };

  const toggleMode = () => {
    dispatch(toggleThemeModeAction());
  };

  const theme = useMemo(() => getTheme(mode), [mode]);

  const value: ColorModeContextType = useMemo(
    () => ({
      mode,
      setMode,
      toggleMode,
    }),
    [mode]
  );

  return (
    <ColorModeContext.Provider value={value}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        <GlobalCssOverrides />
        {children}
      </MuiThemeProvider>
    </ColorModeContext.Provider>
  );
}
