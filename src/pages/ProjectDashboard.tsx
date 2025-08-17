import React from "react"
import { Box, useTheme } from "@mui/material"
import ProjectExplorerWidget from "../components/functional/dashboard/project/ProjectExplorerWidget"
import ProjectView from "../components/functional/dashboard/project/ProjectView"
import ProjectOverviewWidget from "../components/functional/dashboard/project/ProjectOverviewWidget"
import ProjectDatasetsWidget from "../components/functional/dashboard/project/ProjectDatasetWidget"


const ProjectDashboard: React.FC = () => {
  const theme = useTheme()

  return (
    <Box
      sx={{
        display: "grid",
        height: `calc(100vh - ${theme.custom.component.header.height}px)`,
        padding: theme.custom.spacing.xs,
        gap: theme.custom.spacing.xs,
        backgroundColor: theme.palette.background.paper,

        // Mobile: stack everything
        gridTemplateColumns: "1fr",
        gridTemplateRows: "auto auto auto auto auto auto",
        gridTemplateAreas: `
          "explorer"
          "selected"
          "connected"
          "pipelines"
          "activity"
          "contributors"
        `,

        // md+: 2 rows × 4 columns
        [theme.breakpoints.up("md")]: {
          gridTemplateColumns: "1fr 1fr 1fr 1fr",
          gridTemplateRows: "minmax(0, 3fr) minmax(0, 2fr)",
          gridTemplateAreas: `
            "explorer selected selected selected"
            "connected pipelines activity contributors"
          `,
        },
      }}
    >
      {/* Row 1 */}
      <Box gridArea="explorer" sx={{ display: "flex", minHeight: 0 }}>
        <ProjectExplorerWidget />
      </Box>

      <Box gridArea="selected" sx={{ display: "flex", minHeight: 0 }}>
        {/* SelectedProjectPanel should internally allocate:
            - Metrics + buttons at top
            - Files DataGrid at ~60% of panel height (e.g., Box height="60%")
        */}
        <ProjectView />
      </Box>

      {/* Row 2 */}
      <Box gridArea="connected" sx={{ display: "flex", minHeight: 0 }}>
        {/* Heading: "Connected Datasets" + DataGrid + [View Dataset] [Add to Project] */}
        <ProjectOverviewWidget />
      </Box>

      <Box gridArea="pipelines" sx={{ display: "flex", minHeight: 0 }}>
        {/* Show ingress/egress/ML pipelines + active/inactive; [Add Pipeline] [View All] */}
        <ProjectDatasetsWidget />
      </Box>

      <Box gridArea="activity" sx={{ display: "flex", minHeight: 0 }}>
        {/* <RecentActivityWidget /> */}    
      </Box>

      <Box gridArea="contributors" sx={{ display: "flex", minHeight: 0 }}>
        {/* Reuse the Contributors widget style we just made */}
        {/* <ContributorsWidget /> */}
      </Box>
    </Box>
  )
}

export default ProjectDashboard
