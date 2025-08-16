import React from "react";
import Grid from "@mui/material/Grid";
import { useTheme } from "@mui/material/styles";

// Import datastore modules (we'll implement them next)
/* import DatastoreOverview from "../components/functional/datastore-dashboard/DatastoreOverview";
import DatasetList from "../components/functional/datastore-dashboard/DatasetList";
import DataSources from "../components/functional/datastore-dashboard/DataSources";
import QueryExplorer from "../components/functional/datastore-dashboard/QueryExplorer";
import AccessPermissions from "../components/functional/datastore-dashboard/AccessPermissions";
import MonitoringHealth from "../components/functional/datastore-dashboard/MonitoringHealth";
import DatastoreSettings from "../components/functional/datastore-dashboard/DatastoreSettings"; */

const DatastoreDashboard = () => {
  const theme = useTheme();

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
        {/* <DatastoreOverview /> */}
        {/* <DatasetList /> */}
      </Grid>

      {/* Column 2: Queries + Data Sources */}
      <Grid
        size={{ xs: 12, md: 6 }}
        sx={{ display: "flex", flexDirection: "column", gap: 1, height: "100%" }}
      >
        {/* <QueryExplorer /> */}
        {/* <DataSources /> */}
      </Grid>

      {/* Column 3: Access, Monitoring, Settings */}
      <Grid
        size={{ xs: 12, md: 3 }}
        sx={{ display: "flex", flexDirection: "column", gap: 1 }}
      >
        {/* <AccessPermissions /> */}
        {/* <MonitoringHealth /> */}
        {/* <DatastoreSettings /> */}
      </Grid>
    </Grid>
  );
};

export default DatastoreDashboard;
