import React from 'react';
import Grid from '@mui/material/Grid';
import { useTheme } from '@emotion/react';
import DatastoreWidget from '../components/functional/user-dashboard/datastore-widget/DatastoreWidget';
import DatasetWidget from '../components/functional/user-dashboard/DatasetWidget';
import ProjectList from '../components/functional/user-dashboard/ProjectList';
import LLMWidget from '../components/functional/user-dashboard/LLMWidget';
import RecentActivityFeed from '../components/functional/user-dashboard/RecentActivityFeed';
import NotificationWidget from '../components/functional/user-dashboard/NotificationWidget';


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
        <DatastoreWidget />
        <DatasetWidget />
      </Grid>

      {/* Column 2 */}
      <Grid size={{ xs: 12, md: 6 }} sx={{ display: 'flex', flexDirection: 'column', gap: 1, height: '100%' }}>
        <ProjectList />
      </Grid>

      {/* Column 3 */}
      <Grid size={{ xs: 12, md: 3 }} sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <LLMWidget />
        <RecentActivityFeed />
        <NotificationWidget />
      </Grid>
    </Grid>
  );
};

export default DashboardPage;
