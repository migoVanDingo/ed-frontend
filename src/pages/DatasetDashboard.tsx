import React from "react"
import Grid from "@mui/material/Grid"
import { useTheme, type Theme } from "@mui/material/styles"

// Import datastore modules (we'll implement them next)
import DatastoreOverview from "../components/functional/dashboard/datastore-widget/DatastoreOverview"
import DatasetInsights from "../components/functional/dashboard/dataset-widget/DatasetInsights"
import DatasetList from "../components/functional/dashboard/dataset-widget/DatasetList"

const DatasetDashboard = () => {
  const theme = useTheme()

  return (
    <Grid
      container
      spacing={1}
      sx={{
        height: `calc(100vh - ${theme.custom.component.header.height}px)`,
        padding: theme.custom.spacing.xs,
        backgroundColor: theme.palette.background.paper,
      }}
    >
      {/* Column 1: Overview + Datasets */}
      <Grid
        size={{ xs: 12, md: 3 }}
        sx={{ display: "flex", flexDirection: "column", gap: 1 }}
      >
        <DatastoreOverview
          actionButtons={[
            {
              label: "Add Dataset",
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
            },
            {
              label: "Connections",
              variant: "outlined",
              style: (theme: Theme) => ({
                borderRadius: theme.custom?.radii?.xs,
                fontSize: theme.custom.font.size.sm,
                color: theme.palette.accent1.vibrant,
                borderColor: theme.palette.accent1.vibrant,
                "&:hover": { backgroundColor: theme.palette.accent1.dim },
              }),
            },
          ]}
        />
        <DatasetInsights />
      </Grid>

      {/* Column 2: Queries + Data Sources */}
      <Grid
        size={{ xs: 12, md: 9 }}
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 1,
          height: "100%",
        }}
      >
        <DatasetList />
        {/* <DataSources /> */}
      </Grid>
    </Grid>
  )
}

export default DatasetDashboard
