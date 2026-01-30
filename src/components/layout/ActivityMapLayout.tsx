import React, { useEffect } from "react"
import { Box, Stack } from "@mui/material"
import { Outlet, useRouteLoaderData } from "react-router-dom"
import Header from "../functional/header/Header"
import LeftNavRail from "../functional/header/LeftNavRail"
import { useAppDispatch, useAppSelector } from "../../hooks/reduxHook"
import type { DashboardLoaderData } from "../../types/dashboard"
import { setCurrentDatastore } from "../../store/slices/workspaceSlice"
import WorkspaceModalRoot from "../functional/modals/WorkspaceModalRoot"

const ActivityMapLayout = () => {
  const dispatch = useAppDispatch()
  const currentDatastoreId = useAppSelector(
    (state) => state.workspace.currentDatastoreId
  ) as string | null

  const data = useRouteLoaderData("dashboard-layout") as
    | DashboardLoaderData
    | undefined

  useEffect(() => {
    if (!data) return
    const firstDatastore = data?.datastores[0]
    if (!currentDatastoreId && firstDatastore) {
      dispatch(setCurrentDatastore(firstDatastore.id))
    }
  }, [data, currentDatastoreId, dispatch])

  const handleSignOut = () => {
    // TODO: clear tokens, call logout endpoint, redirect, etc.
  }

  return (
    <Stack
      direction="column"
      minHeight="100dvh"
      sx={{ bgcolor: "background.default" }}
    >
      <Header username={""} />

      <Stack direction="row" flex={1} minHeight={0}>
        <LeftNavRail onSignOut={handleSignOut} />

        <Box
          component="main"
          flex={1}
          minWidth={0}
          sx={{ p: 0, overflow: "auto" }}
        >
          <Outlet />
        </Box>
      </Stack>

      <WorkspaceModalRoot />
    </Stack>
  )
}

export default ActivityMapLayout
