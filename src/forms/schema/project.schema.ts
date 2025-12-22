import * as z from "zod";

const noSpecialChars = /^[^<>\\/]*$/;

export const projectSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, { message: "Project name is required" })
    .refine((val) => noSpecialChars.test(val), {
      message: "Name cannot include <, >, /, or \\",
    }),
  description: z
    .string()
    .trim()
    .optional()
    .refine((val) => !val || noSpecialChars.test(val), {
      message: "Description cannot include <, >, /, or \\",
    }),
});

export type ProjectFormValues = z.infer<typeof projectSchema>;

export const defaultProjectValues: ProjectFormValues = {
  name: "",
  description: "",
};
