// theme.ts
import { createTheme, type ThemeOptions } from "@mui/material/styles"
import { deepmerge } from "@mui/utils"

// ✅ Import all Material palettes
import {
  red,
  pink,
  purple,
  deepPurple,
  indigo,
  blue,
  lightBlue,
  cyan,
  teal,
  green,
  lightGreen,
  lime,
  yellow,
  amber,
  orange,
  deepOrange,
  brown,
  grey,
  blueGrey,
} from "@mui/material/colors"

// ✅ Common base theme (shared)
const commonTheme: ThemeOptions = {
  spacing: 8,
  shape: { borderRadius: 8 },
  typography: {
    fontFamily: "'Inter', 'Roboto', 'Helvetica', 'Arial', sans-serif",
    h1: { fontFamily: "'Poppins', sans-serif" },
    h2: { fontFamily: "'Poppins', sans-serif" },
    h3: { fontFamily: "'Poppins', sans-serif" },
  },
  custom: {
    radii: { xs: 1, sm: 2, md: 4, lg: 8, xl: 12 },
    spacing: {
      min: 1,
      xs: 2,
      sm: 4,
      md: 8,
      lg: 16,
      xl: 24,
      xxl: 32,
    },
    component: { header: { height: 50 } },
    font: {
      weight: { regular: 200, medium: 400, bold: 600 },
      size: {
        xs: "0.5rem",
        sm: "0.7rem",
        md: "1rem",
        lg: "1.2rem",
        xl: "1.5rem",
      },
    },
  },
}

// ✅ Light theme
const lightTheme: ThemeOptions = {
  palette: {
    mode: "light",
    primary: {
      light: "#f5f5f5",
      main: "#e0e0e0",
      dark: "#919191",
    },
    secondary: {
      light: "#616161",
      main: "#424242",
      dark: "#212121",
    },
    background: {
      default: "#fafafa",
      paper: "#ffffff",
    },
    boxShadow: {
      light: "1px 2px 4px rgba(0, 0, 0, 0.3)",
      medium: "1px 4px 8px rgba(0, 0, 0, 0.3)",
      dark: "1px 8px 16px rgba(0, 0, 0, 0.3)",
    },
    text: {
      primary: "#212121",
      secondary: "#616161",
    },
    accent1: {
      dim: "#c0e4ff",
      vibrant: "#2196f3",
    },
    accent2: {
      dim: "#ffc0e4",
      vibrant: "#f32196",
    },
  },
}

// ✅ Dark theme
const darkTheme: ThemeOptions = {
  palette: {
    mode: "dark",
    primary: {
      light: "#2a2a2a",
      main: "#1e1e1e",
      dark: "#121212",
    },
    secondary: {
      light: "#cccccc",
      main: "#e0e0e0",
      dark: "#ffffff",
    },
    background: {
      default: "#242424",
      paper: "#1a1a1a",
    },
    boxShadow: {
      light: "2px 2px 4px rgba(0, 0, 0, 0.5)",
      medium: "2px 4px 8px rgba(0, 0, 0, 0.5)",
      dark: "2px 8px 16px rgba(0, 0, 0, 0.5)",
    },
    text: {
      primary: "#ffffff",
      secondary: "#b0b0b0",
    },
    accent1: {
      dim: "#1e3a4c",
      vibrant: "#2196f3",
    },
    accent2: {
      dim: "#4c1e38",
      vibrant: "#f32196",
    },
  },
}

// ✅ All Material palettes
const baseColors = {
  red,
  pink,
  purple,
  deepPurple,
  indigo,
  blue,
  lightBlue,
  cyan,
  teal,
  green,
  lightGreen,
  lime,
  yellow,
  amber,
  orange,
  deepOrange,
  brown,
  grey,
  blueGrey,
}

// ✅ Type extensions
declare module "@mui/material/styles" {
  interface Theme {
    custom: {
      radii: { xs: number; sm: number; md: number; lg: number; xl: number }
      spacing: {
        min: number
        xs: number
        sm: number
        md: number
        lg: number
        xl: number
        xxl: number
      }
      component: { header: { height: number } }
      font: {
        weight: { regular: number; medium: number; bold: number }
        size: { xs: string; sm: string; md: string; lg: string; xl: string }
      }
    }
  }

  interface ThemeOptions {
    custom?: Partial<Theme["custom"]>
  }

  interface Palette {
    accent1: { dim: string; vibrant: string }
    accent2: { dim: string; vibrant: string }
    boxShadow: { light: string; medium: string; dark: string }
    colors: typeof baseColors
  }

  interface PaletteOptions {
    accent1?: { dim: string; vibrant: string }
    accent2?: { dim: string; vibrant: string }
    boxShadow?: { light: string; medium: string; dark: string }
    colors?: typeof baseColors
  }
}

// ✅ Theme factory
export const getTheme = (mode: "light" | "dark" | "custom") => {
  const base = mode === "light" ? lightTheme : mode === "dark" ? darkTheme : lightTheme

  return createTheme(
    deepmerge(commonTheme, {
      ...base,
      palette: {
        ...base.palette,
        colors: baseColors, // inject full palette set
      },
    })
  )
}
