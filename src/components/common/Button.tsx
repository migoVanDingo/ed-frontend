import React from "react"
import SButton from "../styled/SButton"

export interface IButtonProps {
  onClick?: () => void
  disabled?: boolean
  variant?: "text" | "outlined" | "contained"
  type: "button" | "submit" | "reset"
  startIcon?: React.ReactNode
  endIcon?: React.ReactNode
  label: string
  color?: "primary" | "secondary" | "default"
  styles?: object
  children?: any
  fullWidth?: boolean
}

const Button = ({ onClick, disabled, variant, type, startIcon, endIcon, label, styles, color, fullWidth }: IButtonProps) => {

  return (
    <>
      <SButton
        {...onClick && { onClick }}
        disabled={disabled}
        variant={variant}
        type={type}
        startIcon={startIcon}
        endIcon={endIcon}
        backGroundColor={color}
        fullWidth={fullWidth}
        sx={styles}
      >
        {label}
      </SButton>
    </>
  )
}

export default Button
