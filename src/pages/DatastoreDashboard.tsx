import React from "react"
import { Box, useTheme } from "@mui/material"
import FileExplorerWidget from "../components/functional/dashboard/datastore-widget/FileExplorerWidget"
// import RecentActivityWidget from ...
// import UsageHealthWidget from ...
// import CollaboratorsWidget from ...

const DatastoreDashboard = () => {
  const theme = useTheme()

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
          gridTemplateColumns: "3fr 1fr", // 3/4 + 1/4
          gridTemplateRows: "1fr 1fr",   // two rows
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
        {/* <RecentActivityWidget /> */}
      </Box>

      {/* Row 2 */}
      <Box gridArea="usageHealth">
        {/* <UsageHealthWidget /> */}
      </Box>

      <Box gridArea="collaborators">
        {/* <CollaboratorsWidget /> */}
      </Box>
    </Box>
  )
}

export default DatastoreDashboard
