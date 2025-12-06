import React from "react"
import Grid from "@mui/material/Grid"
import ProjectList from "../components/functional/dashboard/ProjectList"
import LLMWidget from "../components/functional/dashboard/llm-widget/LLMWidget"
import DatastoreOverview from "../components/functional/dashboard/datastore/DatastoreOverview"
import DatasetOverview from "../components/functional/dashboard/dataset/DatasetOverview"
import RecentActivity from "../components/functional/dashboard/recent-activity/RecentActivity"
import ConnectionsWidget from "../components/functional/dashboard/connections/ConnectionsWidget"
import type { Theme } from "@mui/material"
import { useNavigate } from "react-router-dom"
import { useRouteLoaderData } from "react-router-dom"


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
]
const DashboardPage = () => {
  const loaderData = useRouteLoaderData("dashboard-layout") as any;
  console.log("Loader Data in DashboardPage:", loaderData);
  const nav = useNavigate()
  const handleNavDatastore = () => {
    nav('/dashboard/datastore')
  }
  const handleNavDatastoreSettings = () => {
    nav('/datastore/settings')
  }
  return (
    <Grid
      container
      spacing={1}
      sx={(theme) => ({
        height: `calc(100vh - ${theme.custom.component.header.height}px)`,
        padding: theme.custom.spacing.xs,
        backgroundColor: theme.palette.background.paper,
      })}
    >
      {/* Column 1 */}
      <Grid
        size={{ xs: 12, md: 3 }}
        sx={{ display: "flex", flexDirection: "column", gap: 1 }}
      >
        <DatastoreOverview
          actionButtons={[
            { 
              label: "View Datastore", 
              variant: "contained", 
              style: (theme: Theme) => ({
                color: theme.palette.getContrastText(
                  theme.palette.accent1.vibrant
                ),
                borderRadius: theme.custom?.radii?.xs,
                fontSize: theme.custom.font.size.sm,
                backgroundColor: theme.palette.accent1.vibrant,
                "&:hover": { backgroundColor: theme.palette.accent1.dim },
              }),
              onClick: handleNavDatastore
            },
            { 
              label: "Settings", 
              variant: "outlined", 
              style: (theme: Theme) => ({
                borderRadius: theme.custom?.radii?.xs,
                fontSize: theme.custom.font.size.sm,
                color: theme.palette.accent1.vibrant,
                borderColor: theme.palette.accent1.vibrant,
                "&:hover": { backgroundColor: theme.palette.accent1.dim },
              }),
              onClick: handleNavDatastoreSettings
            }
          ]}
        />
        <DatasetOverview />
      </Grid>

      {/* Column 2 */}
      <Grid
        size={{ xs: 12, md: 6 }}
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 1,
          height: "100%",
        }}
      >
        <ProjectList />
      </Grid>

      {/* Column 3 */}
      <Grid
        size={{ xs: 12, md: 3 }}
        sx={{ display: "flex", flexDirection: "column", gap: 1 }}
      >
        <LLMWidget />
        <RecentActivity activities={activities} />
        <ConnectionsWidget />
      </Grid>
    </Grid>
  )
}

export default DashboardPage
