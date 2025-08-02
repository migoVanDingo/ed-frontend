// components/common/StyledButton.tsx
import { styled } from "@mui/material/styles";
import Button, { type ButtonProps } from "@mui/material/Button";
import { shouldForwardProp as muiShouldForwardProp } from "@mui/system";

// 1. Define the radius keys (sync with your theme.custom.radii)
type RadiusSize = "xs" | "sm" | "md" | "lg" | "xl";

// 2. Custom props for sizing & shape
interface CustomProps {
  radius?: RadiusSize;
  width?: number | string;
  height?: number | string;
  m?: number | string;  // margin
  p?: number | string;  // padding
  backGroundColor?: 'primary' | 'secondary' | 'default'; // optional color prop
}

// 3. Build the final props type
//    Omit any naming collisions so TextFieldProps stay intact
type StyledButtonProps = Omit<ButtonProps, keyof CustomProps> & CustomProps;

// 4. Filter out our custom props *and* still let MUI’s defaults run
const shouldForward = (prop: PropertyKey) =>
  muiShouldForwardProp(prop) &&
  !["radius", "width", "height", "m", "p", "backGroundColor"].includes(prop as string);

// 5. Create the styled component
const SButton = styled(Button, { shouldForwardProp: shouldForward })<StyledButtonProps>(
  ({ theme, radius = "md", width, height, m, p, backGroundColor }) => {
    // resolve theme.spacing for numbers, leave strings as-is
    const space = (val?: number | string) =>
      val == null
        ? undefined
        : typeof val === "number"
        ? theme.spacing(val)
        : val;

    return {
      // root-level sizing
      width: space(width),
      height: space(height),
      margin: space(m),
      padding: space(p),

      // uniform border-radius
      borderRadius: theme.custom.radii[radius],

      // optional: reset text transform & add a smooth hover shadow
      textTransform: "none",
      backgroundColor: backGroundColor === 'primary' ? theme.palette.accent1.vibrant : backGroundColor === 'secondary' ? theme.palette.accent2.vibrant : theme.palette.background.default,
      fontWeight: "bold",
      color: theme.palette.getContrastText(
        backGroundColor === 'primary' ? theme.palette.accent1.vibrant : backGroundColor === 'secondary' ? theme.palette.accent2.vibrant : theme.palette.background.default
      ),
      transition: theme.transitions.create(["box-shadow", "background-color"], {
        duration: theme.transitions.duration.short,
      }),

      "&:hover": {
        boxShadow: theme.shadows[2],
      },
    };
  }
);

export default SButton;
