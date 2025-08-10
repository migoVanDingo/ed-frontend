import { Stack } from '@mui/material'
import React from 'react'
import { Outlet } from 'react-router-dom'
import Header from '../functional/header/Header'

const DashboardLayout = () => {
  return (
    <Stack direction='column'>
      <Header username={''} />
      <Outlet />
    </Stack>
  )
}

export default DashboardLayout