import { styled } from "@mui/material/styles";
import Stack, { type StackProps } from "@mui/material/Stack";
import type { Theme } from "@mui/material/styles";

interface CustomStackProps extends StackProps {
  radius?: keyof Theme["custom"]["radii"];
  bgColor?: string[];
  paddingSize?: keyof Theme["custom"]["spacing"];
  marginSize?: keyof Theme["custom"]["spacing"];
  expand?: boolean;
  noShadow?: boolean; // NEW: disable box shadow
}

export const SStack = styled(Stack, {
  shouldForwardProp: (prop) =>
    prop !== "radius" &&
    prop !== "bgColor" &&
    prop !== "paddingSize" &&
    prop !== "marginSize" &&
    prop !== "expand" &&
    prop !== "noShadow",
})<CustomStackProps>(
  ({ theme, radius, bgColor, paddingSize, marginSize, expand, noShadow }) => ({
    borderRadius: radius ? theme.custom.radii[radius] : theme.shape.borderRadius,
    boxShadow: noShadow
      ? "none"
      : theme.palette.mode === "dark"
        ? theme.palette.boxShadow.light
        : theme.palette.boxShadow.light,
    backgroundColor: bgColor && bgColor[0] === 'transparent'
      ? 'transparent'
      : bgColor && theme.palette[bgColor[0] as keyof typeof theme.palette]
        ? (theme.palette[bgColor[0] as keyof typeof theme.palette] as any)?.[bgColor[1]]
        : theme.palette.background.paper,
    padding: paddingSize ? theme.custom.spacing[paddingSize] : undefined,
    margin: marginSize ? theme.custom.spacing[marginSize] : undefined,
    ...(expand && {
      flex: 1,
      minWidth: 0,
      minHeight: 0,
    }),
  })
);
