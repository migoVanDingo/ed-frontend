import React from "react"

import FormTextField, { type FormField } from "./FormTextField"
import Button from "../../components/common/Button"
import { Column } from "../../components/common/Flex"
import type { UseFormReturn } from "react-hook-form"


interface DynamicFormProps {
  formSubmitHandler: any,
  fields: any
  styles: object
  methods: any
  buttonProps: {
    label: string
    variant?: "text" | "outlined" | "contained"
    type?: "button" | "submit" | "reset"
    styles?: object
    onClick?: () => void
    disabled?: boolean
    startIcon?: React.ReactNode
    endIcon?: React.ReactNode
  }
}

const DynamicForm = ({ formSubmitHandler, fields, styles, buttonProps, methods }: DynamicFormProps) => {
  const getField = (field: FormField, index: number) => {
    if (field.type === "email") {
      return <FormTextField 
        key={field.name + index} 
        {...field} 
        register={methods.register} 
        errors={methods.formState.errors} 
        control={methods.control}
        type="email"/>
    }

    if (field.type === "password") {
      return (
        <FormTextField 
            key={field.name + index} 
            {...field} 
            register={methods.register} 
            errors={methods.formState.errors} 
            control={methods.control}
            type="password" />
      )
    }
  }

  return (
    <Column component="form" onSubmit={methods.handleSubmit(formSubmitHandler)} style={{ width: "100%", ...styles }}>
      {fields.map((field: FormField, index: number) => getField(field, index))}
      <Button {...buttonProps} type={buttonProps.type!} />
    </Column>
  )
}

export default DynamicForm
