// CreateProjectForm.tsx
import React, { useState } from "react"
import { Box, Button, Stack, TextField, Typography, Alert } from "@mui/material"
import { useTheme } from "@mui/material/styles"
import { useAppSelector } from "../../../hooks/reduxHook"
import { buildCreateProjectPayload } from "../../../utility/payload/projectPayload"
import { ProjectAPI } from "../../../api/ProjectApi"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  defaultProjectValues,
  projectSchema,
  type ProjectFormValues,
} from "../../../forms/schema/project.schema"
import { useRevalidator } from "react-router-dom"   // 🔹 add this

interface CreateProjectFormProps {
  onClose: () => void
  onSuccess?: () => void     // optional, keep for future (toasts, etc.)
}

const CreateProjectForm: React.FC<CreateProjectFormProps> = ({
  onClose,
  onSuccess,
}) => {
  const theme = useTheme()
  const accent = theme.palette["accent1"] as any

  const revalidator = useRevalidator()  // 🔹 get revalidator for current route branch

  const currentDatastoreId = useAppSelector(
    (state) => state.workspace.currentDatastoreId
  ) as string | null

  const currentOrgId = useAppSelector(
    (state) => state.workspace?.currentOrganizationId
  ) as string | undefined

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const methods = useForm<ProjectFormValues>({
    defaultValues: defaultProjectValues,
    resolver: zodResolver(projectSchema),
  })

  const handleSubmit = methods.handleSubmit(async (data) => {
    setError(null)

    if (!currentDatastoreId) {
      setError("No active datastore selected. Please choose a datastore first.")
      return
    }

    setSubmitting(true)
    try {
      const payload = buildCreateProjectPayload(
        { ...data, status: "active" },
        {
          datastore_id: currentDatastoreId,
          organization_id: currentOrgId,
        }
      )

      const response = await ProjectAPI.create(payload)

      if (!response.success) {
        throw new Error(response.message || "Failed to create project.")
      }
      console.log("Create project payload:", payload)

      // 🔁 Re-run loaders for the current route branch (includes dashboard-layout)
      revalidator.revalidate()

      // optional callback back up to layout if you want
      onSuccess?.()

      // then close modal
      onClose()
    } catch (err: any) {
      console.error(err)
      setError("Something went wrong while creating the project.")
    } finally {
      setSubmitting(false)
    }
  })

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{ mt: 1, display: "flex", flexDirection: "column", gap: 2 }}
    >
      <Typography variant="body2" color="text.secondary">
        Create a new project in your current datastore. You can attach datasets
        later.
      </Typography>

      {error && (
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <TextField
        label="Project name"
        {...methods.register("name")}
        required
        autoFocus
        fullWidth
        error={Boolean(methods.formState.errors.name)}
        helperText={methods.formState.errors.name?.message}
      />

      <TextField
        label="Description"
        {...methods.register("description")}
        fullWidth
        multiline
        minRows={3}
        error={Boolean(methods.formState.errors.description)}
        helperText={methods.formState.errors.description?.message}
      />

      <Stack
        direction="row"
        justifyContent="flex-end"
        spacing={1}
        sx={{ mt: 2 }}
      >
        <Button onClick={onClose} disabled={submitting} variant="outlined">
          Cancel
        </Button>
        <Button
          type="submit"
          variant="contained"
          disabled={submitting}
          sx={{
            backgroundColor: accent?.vibrant,
            color: theme.palette.getContrastText(accent?.vibrant),
            "&:hover": {
              backgroundColor: accent?.dim,
            },
          }}
        >
          {submitting ? "Creating..." : "Create project"}
        </Button>
      </Stack>
    </Box>
  )
}

export default CreateProjectForm
