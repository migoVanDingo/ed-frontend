import React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  Box,
  Button,
  Divider,
  Stack,
  Typography,
  useTheme
} from "@mui/material"
import { useForm } from "react-hook-form"
import { FaGithub } from "react-icons/fa"
import { FcGoogle } from "react-icons/fc"
import { Column } from "../components/common/Flex"
import DynamicForm from "../forms/component/DynamicForm"
import { defaultLoginValues, loginButtonProps, loginFormFields, loginSchema, type LoginFormValues } from "../forms/schema/login.schema"
import { handleEmailLogin, handleGithubLogin, handleGoogleLogin } from "../utility/auth/authProviders"
import { useNavigate, useOutletContext } from "react-router-dom"
import { runTaskSequence } from "../utility/callback/runTaskSequence"

const LoginPage = () => {
  const nav = useNavigate()
  const theme = useTheme()
  const { setLoading, setModalText } = useOutletContext<any>()
  const methods = useForm<LoginFormValues>({
    defaultValues: defaultLoginValues,
    resolver: zodResolver(loginSchema),
  })

  const formSubmitHandler = async (data: any) => {
    
    const response = await handleEmailLogin({ email: data.email, password: data.password })
    if (!response || !response.success) {
      console.error("Login failed")
      nav("/error")
      return
    }

    console.log("Login successful:", response.data)
    const navigateToDashboard = () => {
      setLoading(false)
      //nav("/dashboard")
    }
    const { cancel } = runTaskSequence([
      {
        name: "step1",
        duration: 0,
        tasks: [
          { name: "SET_LOADING", callback: () => setModalText("Logging In") },
          { name: "bar", callback: () => setLoading(true) },
        ],
      },
      {
        name: "step2",
        duration: 2000,
        tasks: [
          {
            name: "REDIRECTING",
            callback: () => setModalText("Login Successful! Redirecting to Dashboard"),
          },
          { name: "NAVIGATE", callback: () => navigateToDashboard() },
        ],
      },
    ])
  }
  

 const handleSocialLogin = async (provider: "google" | "github") => {
    let response: any
    if (provider === "google") {
      response = await handleGoogleLogin()
    } else if (provider === "github") {
      response = await handleGithubLogin()
    }

    if (!response || !response.success) {
      console.error("Social login failed")
      return
    }

    console.log("Social login successful:", response.data)

    nav("/dashboard")
  }

  const socialLoginButtons = [
    {
      icon: <FcGoogle />,
      label: "Login with Google",
      onClick: () => handleSocialLogin("google"),
    },
    {
      icon: <FaGithub />,
      label: "Login with GitHub",
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
            : theme.palette.text.primary
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
          Login
        </Typography>

        <DynamicForm
          fields={loginFormFields(methods.register)}
          formSubmitHandler={formSubmitHandler}
          styles={{ gap: theme.custom.spacing.md, fontWeight: "bold" }}
          methods={methods}
          buttonProps={loginButtonProps(methods.formState.isSubmitting)}
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
              key={label}
              variant="outlined"
              fullWidth
              startIcon={icon}
              onClick={onClick}
              sx={(theme) => ({
                borderRadius: theme.custom.radii.xs,
                border: `1px solid ${
                  theme.palette.text.primary
                }`,
                textTransform: "none",
                justifyContent: "center",
                color:
                  theme.palette.text.primary,
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

export default LoginPage
