// theme/ThemeProvider.tsx
import {
  createContext,
  useContext,
  useMemo,
  useState,
} from "react";
import type { ReactNode } from "react";
import { ThemeProvider as MuiThemeProvider, CssBaseline } from "@mui/material";
import { getTheme } from "./theme.ts";
import GlobalCssOverrides from "./GlobalCssOverrides.tsx";

type ThemeMode = "light" | "dark" | "custom";

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
    throw new Error("useColorMode must be used within ThemeProvider");
  }
  return context;
}

export function AppThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>("light");

  const toggleMode = () => {
    setMode((prev) =>
      prev === "light" ? "dark" : "light" 
    );
  };

  const theme = useMemo(() => getTheme(mode), [mode]);

  const value: ColorModeContextType = {
    mode,
    setMode,
    toggleMode,
  };

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
