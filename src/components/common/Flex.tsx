import { Box, type BoxProps, useTheme } from "@mui/material";
import { type Theme } from "@mui/material/styles";
import React, { type ReactNode } from "react";

interface FlexProps extends Omit<BoxProps, "gap"> {
  children?: ReactNode;
  direction?: "row" | "column";
  gap?: keyof Theme['custom']['spacing']; // 'xs' | 'sm' | etc.
  align?: BoxProps["alignItems"];
  justify?: BoxProps["justifyContent"];
  wrap?: BoxProps["flexWrap"];
}

export function Flex({
  direction = "row",
  gap,
  align = "stretch",
  justify = "flex-start",
  wrap = "nowrap",
  sx,
  children,
  ...rest
}: FlexProps) {
  const theme = useTheme();

  return (
    <Box
      display="flex"
      flexDirection={direction}
      alignItems={align}
      justifyContent={justify}
      flexWrap={wrap}
      gap={gap ? `${theme.custom.spacing[gap]}px` : undefined}
      sx={sx}
      {...rest}
    >
      {children}
    </Box>
  );
}

export const Row = (props: Omit<FlexProps, "direction">) => (
  <Flex direction="row" {...props} />
);

export const Column = (props: Omit<FlexProps, "direction">) => (
  <Flex direction="column" {...props} />
);
