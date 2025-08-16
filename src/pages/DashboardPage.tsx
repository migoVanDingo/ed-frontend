import React from 'react';
import Grid from '@mui/material/Grid';
import { useTheme } from '@emotion/react';
import ProjectList from '../components/functional/user-dashboard/ProjectList';
import LLMWidget from '../components/functional/user-dashboard/llm-widget/LLMWidget';
import DatastoreOverview from '../components/functional/user-dashboard/datastore-widget/DatastoreOverview';
import DatasetOverview from '../components/functional/user-dashboard/dataset-widget/DatasetOverview';
import RecentActivity from '../components/functional/user-dashboard/recent-activity-widget/RecentActivity';
import ConnectionsWidget from '../components/functional/user-dashboard/connections-widget/ConnectionsWidget';


const DashboardPage = () => {
  const theme = useTheme();
  return (
    <Grid container spacing={1} sx={(theme) => ({
    height: `calc(100vh - ${theme.custom.component.header.height}px)`,
    padding: theme.custom.spacing.xs,
    backgroundColor: theme.palette.background.paper,
  })}>
      {/* Column 1 */}
      <Grid size={{ xs: 12, md: 3}} sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <DatastoreOverview />
        <DatasetOverview />
      </Grid>

      {/* Column 2 */}
      <Grid size={{ xs: 12, md: 6 }} sx={{ display: 'flex', flexDirection: 'column', gap: 1, height: '100%' }}>
        <ProjectList />
      </Grid>

      {/* Column 3 */}
      <Grid size={{ xs: 12, md: 3 }} sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <LLMWidget />
        <RecentActivity />
        <ConnectionsWidget />
      </Grid>
    </Grid>
  );
};

export default DashboardPage;
