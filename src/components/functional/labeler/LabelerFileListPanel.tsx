import React from "react"
import { Box, TextField, Typography } from "@mui/material"
import { useTheme } from "@mui/material/styles"
import type { DatasetLabelerFile } from "../../../types/labeler/labelerTypes"

type LabelerFileListPanelProps = {
  files: DatasetLabelerFile[]
  selectedFileId: string | null
  onSelectFile: (id: string) => void
}

const statusDisplay = (status: string) => {
  if (status === "new") {
    return { color: "#e53935", symbol: "!" }
  }
  if (status === "review") {
    return { color: "#f9a825", symbol: "?" }
  }
  return { color: "#43a047", symbol: "✓" }
}

const LabelerFileListPanel = ({
  files,
  selectedFileId,
  onSelectFile,
}: LabelerFileListPanelProps) => {
  const theme = useTheme()

  return (
    <Box
      sx={{
        borderRight: `1px solid ${theme.palette.divider}`,
        display: "flex",
        flexDirection: "column",
        minHeight: 0,
      }}
    >
      <Box sx={{ px: 2, pt: 2 }}>
        <Typography
          variant="subtitle1"
          sx={{ fontWeight: theme.custom.font.weight.medium, mb: 1 }}
        >
          Files
        </Typography>
        <TextField placeholder="Search files" size="small" fullWidth sx={{ mb: 2 }} />
      </Box>
      <Box sx={{ overflow: "auto", minHeight: 0, flex: 1 }}>
        {files.map((file, index) => {
          const status = statusDisplay(file.status)
          const isActive = file.id === selectedFileId
          return (
            <Box
              key={file.id}
              onClick={() => onSelectFile(file.id)}
              sx={{
                display: "grid",
                gridTemplateColumns: "24px 1fr",
                alignItems: "center",
                gap: 1,
                p: 1.5,
                cursor: "pointer",
                backgroundColor: isActive
                  ? theme.palette.action.selected
                  : "transparent",
                borderBottom:
                  index < files.length - 1
                    ? `1px solid ${theme.palette.divider}`
                    : "none",
              }}
            >
              <Box
                sx={{
                  width: 20,
                  height: 20,
                  borderRadius: "50%",
                  backgroundColor: status.color,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: theme.custom.font.size.xs,
                }}
              >
                {status.symbol}
              </Box>
              <Typography
                variant="body2"
                sx={{ fontWeight: theme.custom.font.weight.medium }}
              >
                {file.name}
              </Typography>
            </Box>
          )
        })}
      </Box>
    </Box>
  )
}

export default LabelerFileListPanel
