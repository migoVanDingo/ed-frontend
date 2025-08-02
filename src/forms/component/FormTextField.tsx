import React from "react"
import STextField from "../../components/styled/STextField"
import { Controller } from "react-hook-form"

type TextFieldVariant = "outlined" | "filled" | "standard"
export interface FormField {
  label: string
  name: string
  variant: TextFieldVariant
  type: string
  register: any
  errors?: any
  control: any
  helperText?: string
  styles?: {
    borderRadius?: string
    width?: string | number
    height?: string | number
    m?: string | number
    p?: string | number
  }
}

const FormTextField = ({
  label,
  name,
  variant,
  type,
  errors,
  helperText,
  control,
  styles = {},
}: FormField) => {
  return (
 
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <STextField
            {...field}
            type={type}
            label={label}
            variant={variant}
            error={!!errors[name]}
            helperText={errors[name]?.message || helperText}
            {...styles}
          />
        )}

      />


  )
}

export default FormTextField
