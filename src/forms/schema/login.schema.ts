import type { UseFormRegister } from "react-hook-form";
import * as z from "zod";
import type { IButtonProps } from "../../components/common/Button";

export const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().nonempty({ message: "Password is required" }),
});


export type LoginFormValues = z.infer<typeof loginSchema>;

export const defaultLoginValues: LoginFormValues = {
  email: "",
  password: "",
};

export const loginFormFields = (register: UseFormRegister<{
    email: string;
    password: string;
}>) => [
  {
    label: "Email",
    name: "email",
    variant: "outlined",
    type: "email",
    register,
    styles: {
      borderRadius: 'xs',
      width: '100%',
    }
  },
  {
    label: "Password",
    name: "password",
    variant: "outlined",
    type: "password",
    register,
    styles: {
      borderRadius: 'xs',
      width: '100%',
    }
  },
]




export const loginButtonProps = (isSubmitting: boolean): IButtonProps => ({
  label: "Login",
  variant: "contained",
  type: "submit",
  color: "primary",
  disabled: isSubmitting,
  styles: {
    width: '100%',
    borderRadius: 'xs',
    justifyContent: 'center',

  }
});
