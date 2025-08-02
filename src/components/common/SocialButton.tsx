// src/components/common/SocialButton.tsx
import React from "react"
import { Button, type ButtonProps } from "@mui/material"
import { useTheme } from "@mui/material/styles"

export interface SocialButtonProps extends ButtonProps {
  startIcon: React.ReactNode
}

export const SocialButton: React.FC<SocialButtonProps> = ({
  children,
  ...props
}) => {
  const theme = useTheme()

  return (
    <Button
      variant="outlined"
      fullWidth
      sx={{
        borderRadius: theme.custom.radii.xs,
        border: `1px solid ${theme.palette.text.primary}`,
        color: theme.palette.text.primary,
        textTransform: "none",
        justifyContent: "center",

        gap: theme.spacing(1.5),
        ...(props.sx as object),
      }}
      {...props}
    >
      {children}
    </Button>
  )
}
