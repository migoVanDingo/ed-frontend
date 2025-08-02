import React from "react";
import { Box, Typography, CircularProgress } from "@mui/material";
import { styled, useTheme } from "@mui/material/styles";

interface LoadingSpinnerProps {
  message: string;
  /** fill its parent container */
  fit?: boolean;
  /** use accent2.dim as background */
  variant?: "accent2Dim";
}

const LoadingContainer = styled(Box, {
  shouldForwardProp: (prop) => prop !== "fit" && prop !== "variant",
})<LoadingSpinnerProps>(({ theme, fit, variant }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",

  width: fit ? 500: "100%", // full width if fit, otherwise fixed width
  height: fit ? 350 : "auto", // full height if fit, otherwise auto

  borderRadius: theme.custom.radii.lg,          // 8px
  backgroundColor:
    variant === "accent2Dim"
      ? theme.palette.accent2.dim               // light: "#ffc0e4" / dark: "#4c1e38"
      : theme.palette.primary.light,             // light: "#e0e0e0" / dark: "#1e1e1e"

  boxShadow: theme.shadows[4],                  // moderate elevation
  paddingTop: fit ? 0 : theme.custom.spacing.lg, // 16px
  paddingBottom: fit ? theme.custom.spacing.xl : 2, // 32px
  boxSizing: "border-box",
}));


const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message,
  fit = true,
  variant,
}) => {
  const theme = useTheme();

  return (
    <LoadingContainer 
        fit={fit} 
        variant={variant} 
        message={message}
    >
      <Typography
        component="p"
        sx={{
          fontSize: "1.8rem",
          fontWeight: 200,
          fontFamily: theme.typography.fontFamily,
          color: theme.palette.text.primary,
          mb: theme.custom.spacing.sm,          // 4px
        }}
      >
        {message}
      </Typography>


      <CircularProgress
        size={80}
        thickness={8}
        sx={{ color: theme.palette.accent1.vibrant }}
      />


    </LoadingContainer>
  );
};

export default LoadingSpinner;
