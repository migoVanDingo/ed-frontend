import type { UseFormRegister } from "react-hook-form";
import z from "zod";
import type { IButtonProps } from "../../components/common/Button";

export const registrationSchema = z
  .object({
    email: z.string().email({ message: "Invalid email address" }),
    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters" })
      .refine((val) => /[a-z]/.test(val), { message: "Must include a lowercase letter" })
      .refine((val) => /[A-Z]/.test(val), { message: "Must include an uppercase letter" })
      .refine((val) => /\d/.test(val), { message: "Must include a number" })
      .refine((val) => /[^A-Za-z0-9]/.test(val), { message: "Must include a special character" }),
    verifyPassword: z.string(),
  })
  .refine((data) => data.password === data.verifyPassword, {
    path: ["verifyPassword"],     // attach the error to the “verifyPassword” field
    message: "Passwords must match",
  });

  export type RegistrationFormValues = z.infer<typeof registrationSchema>;

  export const defaultRegistrationValues: RegistrationFormValues = {
    email: "",
    password: "",
    verifyPassword: "",
  };

export const registrationFormFields = (register: UseFormRegister<RegistrationFormValues>) => [
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
  {
    label: "Verify Password",
    name: "verifyPassword",
    variant: "outlined",
    type: "password",
    register,
    styles: {
      borderRadius: 'xs',
      width: '100%',
    }
  },
];

export const registrationButtonProps = (isSubmitting: boolean): IButtonProps => ({
  label: "Submit",
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