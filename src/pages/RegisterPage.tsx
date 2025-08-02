import { Box, Divider, Stack, Typography, useTheme } from "@mui/material"
import React from "react"
import Button from "../components/common/Button"
import {
  defaultRegistrationValues,
  registrationButtonProps,
  registrationFormFields,
  registrationSchema,
} from "../forms/schema/register.schema"
import { zodResolver } from "@hookform/resolvers/zod/dist/zod.js"
import { useForm } from "react-hook-form"
import { Column } from "../components/common/Flex"
import DynamicForm from "../forms/component/DynamicForm"
import { FcGoogle } from "react-icons/fc"
import { FaGithub } from "react-icons/fa"
import type { IUserAuth } from "../interface/auth"
import {
  handleEmailRegister,
  handleGithubLogin,
  handleGoogleLogin,
} from "../utility/auth/authProviders"
import { useNavigate, useOutletContext } from "react-router-dom"
import { runTaskSequence } from "../utility/callback/runTaskSequence"


const RegisterPage = () => {
  const nav = useNavigate()
  const theme = useTheme()
  const { setLoading, setModalText } = useOutletContext<any>()
  const methods = useForm({
    defaultValues: defaultRegistrationValues,
    resolver: zodResolver(registrationSchema),
  })

  const handleNavigate = () => {
    setLoading(false)
    nav("/verify-email")
  }
  const formSubmitHandler = async (data: any) => {
    const payload: IUserAuth = {
      email: data.email,
      password: data.password,
    }

    const response = await handleEmailRegister(payload)
    if (!response || !response.success) {
      console.error("Registration failed")
      return
    }
    const { cancel } = runTaskSequence([
      {
        name: "step1",
        duration: 0,
        tasks: [
          { name: "SET_LOADING", callback: () => setModalText("Registering") },
          { name: "bar", callback: () => setLoading(true) },
        ],
      },
      {
        name: "step2",
        duration: 2000,
        tasks: [
          { name: "baz", callback: () => setModalText("Sending Email") },],
      },
      {
        name: "step3",
        duration: 2000,
        tasks: [
          { name: "navigate", callback: () => handleNavigate() },
        ],
      },
    ])

    // If you need to abort before everything fires:
    // cancel();

    
  }

  const handleSocialLogin = async (provider: "google" | "github") => {
    let response: any
    if (provider === "google") {
      response = await handleGoogleLogin()
    } else if (provider === "github") {
      response = await handleGithubLogin()
    }

    console.log("Social login response:", response)

    if (!response || !response.success) {
      console.error("Social login failed")
      return
    }

    nav("/dashboard")
  }

  const socialLoginButtons = [
    {
      icon: <FcGoogle />,
      label: "Register with Google",
      onClick: () => handleSocialLogin("google"),
    },
    {
      icon: <FaGithub />,
      label: "Register with GitHub",
      onClick: () => handleSocialLogin("github"),
    },
  ]

  return (
    <Box display="flex" justifyContent="center" pt={theme.custom.spacing.xl} sx={{ width: 380 }}>
      <Column
        alignItems="center"
        gap="lg"
        borderRadius={(theme) => theme.custom.radii.sm}
        border="1px solid"
        borderColor={(theme) =>
          theme.palette.mode === "light"
            ? theme.palette.primary.dark
            : theme.palette.secondary.dark
        }
        padding="32px"
        width="100%"
        maxWidth="600px"
      >
        <Typography
          variant="h5"
          component="h1"
          color="textPrimary"
          sx={{ color: theme.palette.text.primary }}
        >
          Create Account
        </Typography>

        <DynamicForm
          fields={registrationFormFields(methods.register)}
          formSubmitHandler={formSubmitHandler}
          styles={{ gap: theme.custom.spacing.md, fontWeight: "bold" }}
          methods={methods}
          buttonProps={registrationButtonProps(methods.formState.isSubmitting)}
        />

        <Divider
          sx={{
            width: "100%",
            my: 2,
            borderColor: (theme) =>
              theme.palette.mode === "light"
                ? theme.palette.primary.dark
                : theme.palette.text.secondary,
          }}
        />

        <Stack direction="column" spacing={1} width="100%">
          {socialLoginButtons.map(({ icon, label, onClick }) => (
            <Button
              type="button"
              label={label}
              key={label}
              variant="outlined"
              fullWidth
              startIcon={icon}
              onClick={onClick}
              styles={(theme: any) => ({
                borderRadius: theme.custom.radii.xs,
                border: `1px solid ${theme.palette.text.secondary}`,
                textTransform: "none",
                justifyContent: "center",
                color: theme.palette.text.secondary,
                gap: 1.5,
              })}
            >
              {label}
            </Button>
          ))}
        </Stack>
      </Column>
    </Box>
  )
}

export default RegisterPage
