import React from "react"
import { Box, useTheme } from "@mui/material"
import FileExplorerWidget from "../components/functional/dashboard/datastore/FileExplorerWidget"
import UsageHealthWidget from "../components/functional/dashboard/datastore/UsageHealthWidget"
import RecentActivity from "../components/functional/dashboard/recent-activity/RecentActivity"
import ContributorsWidget from "../components/functional/dashboard/datastore/ContributorsWidget"
import { useLoaderData, useRouteLoaderData } from "react-router-dom"
import type { DashboardLoaderData } from "../types/dashboard"
// import RecentActivityWidget from ...
// import UsageHealthWidget from ...
// import CollaboratorsWidget from ...

const activities = [
  {
    user: "Alice",
    action: "uploaded to",
    entity: "Datastore",
    type: "datastore",
    date: "2025-08-12T10:00:00Z",
  },
  {
    user: "Bob",
    action: "ran pipeline in",
    entity: "Climate Project",
    type: "project",
    date: "2025-08-15T01:00:00Z",
  },
  {
    user: "Eve",
    action: "created dataset",
    entity: "Brain Imaging",
    type: "dataset",
    date: "2025-08-14T18:30:00Z",
  },
  {
    user: "Alice",
    action: "uploaded to",
    entity: "Datastore",
    type: "datastore",
    date: "2025-08-12T10:00:00Z",
  },
  {
    user: "Bob",
    action: "ran pipeline in",
    entity: "Climate Project",
    type: "project",
    date: "2025-08-15T01:00:00Z",
  },
  {
    user: "Eve",
    action: "created dataset",
    entity: "Brain Imaging",
    type: "dataset",
    date: "2025-08-14T18:30:00Z",
  },
]

const DatastoreDashboard = () => {
  const theme = useTheme()

  const { user } =
    useRouteLoaderData("dashboard-layout") as DashboardLoaderData;

  const {
    datastoreId,
    datastoreName,
    metrics,
    initialFilesPage,
  } = useLoaderData() as any;


  console.log('route loader: ', user)
  console.log('loader: ', datastoreId, datastoreName, initialFilesPage)


  return (
    <Box
      sx={{
        display: "grid",
        height: `calc(100vh - ${theme.custom.component.header.height}px)`,
        padding: theme.custom.spacing.xs,
        gap: theme.custom.spacing.xs,
        backgroundColor: theme.palette.background.paper,

        // Default mobile layout: stack everything
        gridTemplateColumns: "1fr",
        gridTemplateRows: "auto auto auto auto",
        gridTemplateAreas: `
          "fileExplorer"
          "recentActivity"
          "usageHealth"
          "collaborators"
        `,

        // Tablet / desktop layout (md and up)
        [theme.breakpoints.up("md")]: {
          gridTemplateColumns: "2fr 1fr", // 3/4 + 1/4
          gridTemplateRows: "1fr 1fr", // two rows
          gridTemplateAreas: `
            "fileExplorer recentActivity"
            "usageHealth collaborators"
          `,
        },
      }}
    >
      {/* Row 1 */}
      <Box gridArea="fileExplorer">
        <FileExplorerWidget />
      </Box>

      <Box gridArea="recentActivity">
        <RecentActivity activities={activities} />
      </Box>

      {/* Row 2 */}
      <Box gridArea="usageHealth">
        <UsageHealthWidget />
      </Box>

      <Box gridArea="collaborators">
        <ContributorsWidget />
      </Box>
    </Box>
  )
}

export default DatastoreDashboard
