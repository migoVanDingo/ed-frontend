import React from "react";
import { useTheme } from "@mui/material/styles";
import { Button } from "@mui/material";
import { useColorMode } from "../../theme/ThemeProvider";

const ThemeSwitcher = () => {
  const theme = useTheme();
  const { mode, toggleMode } = useColorMode();

  return (
    <Button
      onClick={toggleMode}
      variant="contained"
      color="primary"
      sx={{
        borderRadius: theme.shape.borderRadius,
        mt: theme.spacing(2),
      }}
    >
      Switch to {mode === "light" ? "dark" : mode === "dark" ? "custom" : "light"} mode
    </Button>
  );
}

export default ThemeSwitcher