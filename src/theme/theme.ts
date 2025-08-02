// theme.ts
import { createTheme, type ThemeOptions } from "@mui/material/styles"
import { deepmerge } from "@mui/utils"

// Common (shared) theme values
const commonTheme: ThemeOptions = {
  spacing: 8, // MUI default spacing unit (8px)
  shape: {
    borderRadius: 8, // default
  },
  typography: {
    fontFamily: "'Inter', 'Roboto', 'Helvetica', 'Arial', sans-serif",
    h1: { fontFamily: "'Poppins', sans-serif" },
    h2: { fontFamily: "'Poppins', sans-serif" },
    h3: { fontFamily: "'Poppins', sans-serif" },
  },
  custom: {
    radii: {
      xs: 1,
      sm: 2,
      md: 4,
      lg: 8,
      xl: 12
    },
    spacing: {
      xs: 2,   // 0.5rem
      sm: 4,   // 1rem
      md: 8,  // 2rem
      lg: 16,  // 4rem
      xl: 24,  // 8rem
      xxl: 32, // 10rem 
    },
    component: {
        header: {
            height: 50, // default header height
        }
    }
  },
}

// Light theme specific values
const lightTheme: ThemeOptions = {
  palette: {
    mode: "light",
    primary: {
      light: "#f5f5f5", // very light gray
      main: "#e0e0e0",  // neutral UI background
      dark: "#919191",  // hover states or subtle contrast
    },
    secondary: {
      light: "#616161", // for subtext or icons
      main: "#424242",  // buttons or headings
      dark: "#212121",  // highest contrast
    },
    background: {
      default: "#fafafa",
      paper: "#ffffff",
    },
    text: {
      primary: "#212121",   // strong body text
      secondary: "#616161", // muted labels and placeholders
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
};


// Dark theme specific values
const darkTheme: ThemeOptions = {
  palette: {
    mode: "dark",
    primary: {
      light: "#2a2a2a",  // subtle surface hover
      main: "#1e1e1e",   // primary background / box
      dark: "#121212",   // deepest base
    },
    secondary: {
      light: "#cccccc",  // icons or borders
      main: "#e0e0e0",   // body text or UI highlights
      dark: "#ffffff",   // high-contrast (e.g. headings)
    },
    background: {
      default: "#242424", // app background
      paper: "#1a1a1a",   // cards and surfaces

    },
    text: {
      primary: "#ffffff",  // main content
      secondary: "#b0b0b0", // subtext, labels
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
};


// Extend MUI Theme to allow `custom` and `accent1/2` in palette
declare module '@mui/material/styles' {

  interface Theme {
    custom: {
      radii: {
        xs: number
        sm: number
        md: number
        lg: number
        xl: number
      }
      spacing: {
        xs: number
        sm: number
        md: number
        lg: number
        xl: number
        xxl: number
      }
      component: {
        header: {
          height: number
        }
      }
    }
  }

  interface ThemeOptions {
    custom?: {
      radii?: Partial<Theme['custom']['radii']>
      spacing?: Partial<Theme['custom']['spacing']>
      component?: {
        header?: {
          height?: number
        }
      }
    }
  }

  interface Palette {
    accent1: {
      dim: string
      vibrant: string
    },
    accent2: {
      dim: string
      vibrant: string
    },
  }

  interface PaletteOptions {
    accent1?: {
      dim: string
      vibrant: string
    },
    accent2?: {
      dim: string
      vibrant: string
    },
  }
}



// Factory functions
export const getTheme = (mode: "light" | "dark" | "custom") => {
  if (mode === "custom") {
    // Return a custom theme here or fallback
    return createTheme(
      deepmerge(commonTheme, lightTheme) // Or define a customTheme object
    );
  }
  return createTheme(
    deepmerge(commonTheme, mode === "light" ? lightTheme : darkTheme)
  );
};

