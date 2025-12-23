import * as z from "zod"

const noSpecialChars = /^[^<>\\/]*$/

export const datasetSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, { message: "Dataset name is required" })
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
})

export type DatasetFormValues = z.infer<typeof datasetSchema>

export const defaultDatasetValues: DatasetFormValues = {
  name: "",
  description: "",
}
