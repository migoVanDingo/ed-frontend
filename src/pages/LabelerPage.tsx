import React from "react"
import { Box, Button, Stack } from "@mui/material"
import { useTheme } from "@mui/material/styles"
import { useNavigate, useParams } from "react-router-dom"

const LabelerPage = () => {
  const theme = useTheme()
  const navigate = useNavigate()
  const { datasetId } = useParams()

  const labelStudioUrl = "http://localhost:8080"
  const contentHeight = `calc(100vh - ${theme.custom.component.header.height}px)`

  return (
    <Box
      sx={{
        height: contentHeight,
        padding: theme.custom.spacing.xs,
        backgroundColor: theme.palette.background.paper,
        display: "flex",
        flexDirection: "column",
        gap: 1,
      }}
    >
      <Stack direction="row" spacing={1} sx={{ flexShrink: 0 }}>
        <Button
          variant="outlined"
          onClick={() => navigate(`/dashboard/dataset/${datasetId}`)}
          sx={{
            borderRadius: theme.custom.radii.xs,
            fontSize: theme.custom.font.size.sm,
            color: theme.palette.accent1.vibrant,
            borderColor: theme.palette.accent1.vibrant,
            "&:hover": { backgroundColor: theme.palette.accent1.dim },
            whiteSpace: "nowrap",
          }}
        >
          Back to Dataset
        </Button>
        <Button
          variant="outlined"
          onClick={() => window.open(labelStudioUrl, "_blank", "noopener")}
          sx={{
            borderRadius: theme.custom.radii.xs,
            fontSize: theme.custom.font.size.sm,
            color: theme.palette.accent1.vibrant,
            borderColor: theme.palette.accent1.vibrant,
            "&:hover": { backgroundColor: theme.palette.accent1.dim },
            whiteSpace: "nowrap",
          }}
        >
          Open in new tab
        </Button>
      </Stack>

      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          borderRadius: theme.custom.radii.xs,
          overflow: "hidden",
          border: `1px solid ${theme.palette.divider}`,
        }}
      >
        <iframe
          title="Label Studio"
          src={labelStudioUrl}
          style={{ border: 0, width: "100%", height: "100%" }}
          allow="fullscreen"
        />
      </Box>
    </Box>
  )
}

export default LabelerPage
