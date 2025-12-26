import React from "react"
import { Box, Typography } from "@mui/material"
import { useTheme } from "@mui/material/styles"

const ProjectWorkspacePage = () => {
  const theme = useTheme()

  return (
    <Box
      sx={{
        height: `calc(100vh - ${theme.custom.component.header.height}px)`,
        padding: theme.custom.spacing.xs,
        backgroundColor: theme.palette.background.paper,
      }}
    >
      <Typography variant="h5">Project Workspace</Typography>
    </Box>
  )
}

export default ProjectWorkspacePage
