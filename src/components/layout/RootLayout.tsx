import { Box } from '@mui/material'
import React from 'react'
import { Outlet } from 'react-router-dom'

const RootLayout = () => {
  return (
     <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh", // 💡 essential
      }}
    >
      <Outlet />
    </Box>
  )
}

export default RootLayout