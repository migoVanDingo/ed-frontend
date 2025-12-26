import React from "react"
import Grid from "@mui/material/Grid"
import { Box, Button, Typography } from "@mui/material"
import { useTheme } from "@mui/material/styles"
import { useLoaderData, useNavigate } from "react-router-dom"

import HeadingBlock from "../components/common/HeadingBlock"
import DatasetFileList, {
  type DatasetFileRow,
} from "../components/functional/dataset/DatasetFileList"
import { SStack } from "../components/styled/SStack"

type DatasetDetailLoaderData = {
  dataset: {
    id: string
    name: string
    description?: string | null
    datastoreId: string
  }
  datasetItems: Array<{
    id: string
    fileId: string
    createdAt?: string | null
    status?: string | null
  }>
  datastoreFiles: Array<{
    id: string
    filename: string
    contentType?: string | null
    size?: number | null
    created_at?: number | string | null
  }>
  datasetMetrics: unknown | null
}

const DatasetDetailPage = () => {
  const theme = useTheme()
  const navigate = useNavigate()
  const loaderData = useLoaderData() as DatasetDetailLoaderData
  const filesById = new Map(loaderData.datastoreFiles.map((file) => [file.id, file]))

  const datasetFiles: DatasetFileRow[] = loaderData.datasetItems.map((item) => {
    const file = filesById.get(item.fileId)
    return {
      id: item.fileId,
      name: file?.filename ?? item.fileId,
      type: file?.contentType ?? undefined,
      tags: [],
      sizeBytes: file?.size ?? undefined,
      uploadedAt: file?.created_at
        ? new Date(
            typeof file.created_at === "number"
              ? file.created_at * 1000
              : file.created_at
          ).toISOString()
        : item.createdAt ?? undefined,
      status: item.status ?? undefined,
    }
  })

  return (
    <Box
      sx={{
        height: `calc(100vh - ${theme.custom.component.header.height}px)`,
        padding: theme.custom.spacing.xs,
        backgroundColor: theme.palette.background.paper,
        display: "flex",
        flexDirection: "column",
        gap: 0.5,
      }}
    >
      <SStack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        padding={0}
        noBorder
        noShadow
        sx={{ flexShrink: 0 }}
      >
        <HeadingBlock
          heading={`Dataset: ${loaderData.dataset?.name ?? "Untitled"}`}
          headingWeight={200}
          headingSize="h4"
          subheading={
            loaderData.dataset?.description ?? "No description provided."
          }
          headingStyle={{ paddingLeft: 2, paddingTop: 1 }}
          subheadingStyle={{ paddingLeft: 2 }}
          padding={0}
        />
        <Button
          variant="outlined"
          onClick={() =>
            navigate(`/dashboard/dataset/${loaderData.dataset.id}/edit`)
          }
          sx={{
            borderRadius: theme.custom.radii.xs,
            fontSize: theme.custom.font.size.sm,
            color: theme.palette.accent1.vibrant,
            borderColor: theme.palette.accent1.vibrant,
            "&:hover": { backgroundColor: theme.palette.accent1.dim },
            whiteSpace: "nowrap",
            minWidth: 140,
          }}
        >
          Edit Dataset
        </Button>
      </SStack>

      <Grid
        container
        spacing={1}
        sx={{ flex: 1, minHeight: 0 }}
      >
        <Grid
          size={{ xs: 12, md: 9 }}
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 1,
            height: "100%",
          }}
        >
          <DatasetFileList files={datasetFiles} />
        </Grid>

        <Grid
          size={{ xs: 12, md: 3 }}
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 1,
            height: "100%",
          }}
        >
          <Box
            sx={{
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: theme.custom.radii.xs,
              backgroundColor: theme.palette.background.paper,
              boxShadow: theme.palette.boxShadow.light,
              p: 2,
              minHeight: 180,
            }}
          >
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: theme.custom.font.weight.medium }}
            >
              Dataset Metrics
            </Typography>
          </Box>
          <Box
            sx={{
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: theme.custom.radii.xs,
              backgroundColor: theme.palette.background.paper,
              boxShadow: theme.palette.boxShadow.light,
              p: 2,
              minHeight: 180,
            }}
          >
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: theme.custom.font.weight.medium }}
            >
              File Breakdown
            </Typography>
          </Box>
        </Grid>
      </Grid>
    </Box>
  )
}

export default DatasetDetailPage
