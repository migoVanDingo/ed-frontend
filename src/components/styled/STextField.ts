// components/common/StyledTextField.tsx
import { styled } from "@mui/material/styles";
import TextField, { type TextFieldProps } from "@mui/material/TextField";

// radius keys in your theme
type RadiusSize = "xs" | "sm" | "md" | "lg" | "xl";

type CustomProps = {
  radius?: RadiusSize;
  width?: number | string;
  height?: number | string;
  m?: number | string;
  p?: number | string;
};

interface StyledTFProps extends Omit<TextFieldProps, keyof CustomProps>, CustomProps {}

const shouldForward = (prop: PropertyKey) =>
  !["radius", "width", "height", "m", "p"].includes(prop as string);

const STextField = styled(TextField, { shouldForwardProp: shouldForward })<StyledTFProps>(
  ({ theme, radius = "md", width, height, m, p }) => {
    const space = (val?: number | string) =>
      val == null ? undefined : typeof val === "number" ? theme.spacing(val) : val;

    const defaultBorder = theme.palette.mode === "light"
      ? theme.palette.primary.dark
      : theme.palette.text.primary;

    return {
      width: space(width),
      margin: space(m),

      "& .MuiOutlinedInput-root": {
        height: space(height),
        padding: space(p),
        borderRadius: theme.custom.radii[radius],
        backgroundColor: theme.palette.background.default,

        // TARGET the notchedOutline explicitly:
        "& .MuiOutlinedInput-notchedOutline": {
          borderColor: defaultBorder,
        },
        "&:hover .MuiOutlinedInput-notchedOutline": {
          borderColor: theme.palette.text.primary,
        },
        "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
          borderColor: theme.palette.accent1.vibrant,
        },
      },

      "& .MuiInputLabel-root": {
        color: theme.palette.text.secondary,
      },
      "& .MuiInputLabel-root.Mui-focused": {
        color: theme.palette.primary.main,
      },

      // helper text: use marginTop instead of marginLeft
      "& .MuiFormHelperText-root": {
        marginTop: theme.spacing(0.5),
      },
    };
  }
);

export default STextField;
