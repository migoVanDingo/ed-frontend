import React, { useState } from "react"
import { Alert, Box, Button, Stack, TextField, Typography } from "@mui/material"
import { useTheme } from "@mui/material/styles"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation } from "@apollo/client"
import { useAppDispatch, useAppSelector } from "../../../hooks/reduxHook"
import {
  defaultDatasetValues,
  datasetSchema,
  type DatasetFormValues,
} from "../../../forms/schema/dataset.schema"
import { CREATE_DATASET_MUTATION } from "../../../graphql/query/datasetQuery"
import { useNavigate } from "react-router-dom"
import { set } from "zod"
import { setCurrentDataset } from "../../../store/slices/workspaceSlice"

interface CreateDatasetFormProps {
  onClose: () => void
  onSuccess?: () => void
}

const CreateDatasetForm: React.FC<CreateDatasetFormProps> = ({
  onClose,
  onSuccess,
}) => {
  const nav = useNavigate()
  const dispatch = useAppDispatch()
  const theme = useTheme()
  const accent = theme.palette["accent1"] as any

  const currentDatastoreId = useAppSelector(
    (state) => state.workspace.currentDatastoreId
  ) as string | null

  const currentProjectId = useAppSelector(
    (state) => state.workspace.currentProjectId
  ) as string | null

  const [error, setError] = useState<string | null>(null)

  const methods = useForm<DatasetFormValues>({
    defaultValues: defaultDatasetValues,
    resolver: zodResolver(datasetSchema),
  })

  const [createDataset, { loading }] = useMutation(CREATE_DATASET_MUTATION)

  const handleSubmit = methods.handleSubmit(async (data) => {
    setError(null)

    if (!currentDatastoreId) {
      setError("No active datastore selected. Please choose a datastore first.")
      return
    }

    try {
      const response = await createDataset({
        variables: {
          input: {
            datastoreId: currentDatastoreId,
            projectId: currentProjectId ?? undefined,
            name: data.name.trim(),
            description: data.description?.trim() || null,
          },
        },
      })

      onSuccess?.()
      onClose()
      const { createDataset: responseData } = response.data as any
      const newDatasetId = responseData.id
      dispatch(setCurrentDataset(newDatasetId))
      nav(`/dashboard/dataset/${newDatasetId}/edit`)
    } catch (err) {
      console.error(err)
      setError("Something went wrong while creating the dataset.")
    }
  })

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{ mt: 1, display: "flex", flexDirection: "column", gap: 2 }}
    >
      <Typography variant="body2" color="text.secondary">
        Create a new dataset in your current datastore. You can attach files
        after creation.
      </Typography>

      {error && (
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <TextField
        label="Dataset name"
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
        <Button onClick={onClose} disabled={loading} variant="outlined">
          Cancel
        </Button>
        <Button
          type="submit"
          variant="contained"
          disabled={loading}
          sx={{
            backgroundColor: accent?.vibrant,
            color: theme.palette.getContrastText(accent?.vibrant),
            "&:hover": {
              backgroundColor: accent?.dim,
            },
          }}
        >
          {loading ? "Creating..." : "Create dataset"}
        </Button>
      </Stack>
    </Box>
  )
}

export default CreateDatasetForm
