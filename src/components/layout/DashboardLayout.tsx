import React from 'react';
import { Box, Stack } from '@mui/material';
import { Outlet } from 'react-router-dom';
import Header from '../functional/header/Header';
import LeftNavRail from '../functional/header/LeftNavRail';

const DashboardLayout = () => {
  const handleSignOut = () => {
    // TODO: clear tokens, call logout endpoint, redirect, etc.
  };

  return (
    <Stack direction="column" minHeight="100dvh" sx={{ bgcolor: 'background.default' }}>
      {/* Header always spans the full width */}
      <Header username={''} />

      {/* Below header: row layout with nav rail + main content */}
      <Stack direction="row" flex={1} minHeight={0}>
        <LeftNavRail onSignOut={handleSignOut} />

        <Box
          component="main"
          flex={1}
          minWidth={0}
          sx={{ p: 0, overflow: 'auto' }}
        >
          <Outlet />
        </Box>
      </Stack>
    </Stack>
  );
};

export default DashboardLayout;
