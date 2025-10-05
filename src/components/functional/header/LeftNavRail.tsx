import * as React from "react"
import { Box, Stack, IconButton, Tooltip, useTheme } from "@mui/material"
import { NavLink, useNavigate } from "react-router-dom"

// Icons
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined"
import ViewListOutlinedIcon from "@mui/icons-material/ViewListOutlined"
import StorageOutlinedIcon from "@mui/icons-material/StorageOutlined"
import DatasetOutlinedIcon from "@mui/icons-material/DatasetOutlined"
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined"
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined"

type LeftNavRailProps = {
  onSignOut?: () => void
}

const railWidth = 64

// A tiny helper so NavLink can toggle an "active" class, which we style via sx (&.active)
function RailLinkButton({
  to,
  label,
  icon,
}: {
  to: string
  label: string
  icon: React.ReactNode
}) {
  const theme = useTheme()
  return (
    <NavLink
      to={to}
      className={({ isActive }: { isActive: boolean }) =>
        isActive ? "active" : undefined
      }
      style={{ textDecoration: "none" }}
    >
      {({ isActive }: { isActive: boolean }) => (
        <Tooltip title={label} placement="right" enterDelay={300}>
          <IconButton
            sx={{
              position: "relative",
              width: 48,
              height: 48,
              my: 0.5,
              color: "text.secondary",
              "&:hover": { bgcolor: "action.hover" },
              "&.active": {
                color: theme.palette.colors.blue[500],
                "&::before": {
                  content: '""',
                  position: "absolute",
                  left: 0,
                  top: 8,
                  bottom: 8,
                  width: 3,
                  borderRadius: 1,
                  bgcolor: theme.palette.colors.blue[500],
                },
              },
            }}
            aria-label={label}
            className={isActive ? "active" : undefined}
          >
            {icon}
          </IconButton>
        </Tooltip>
      )}
    </NavLink>
  )
}

export default function LeftNavRail({ onSignOut }: LeftNavRailProps) {
  const navigate = useNavigate()

  const handleSignOut = () => {
    if (onSignOut) return onSignOut()
    // fallback: navigate to a sign-out route if you have one
    navigate("/sign-out")
  }

  return (
    <Box
      component="nav"
      sx={{
        position: "sticky",
        top: 0,
        height: "100dvh",
        width: railWidth,
        borderRight: 1,
        borderColor: "divider",
        bgcolor: "background.paper",
        zIndex: (t) => t.zIndex.appBar - 1, // stay under your Header if it’s fixed
      }}
    >
      <Stack
        alignItems="center"
        justifyContent="space-between"
        sx={{ height: "100%" }}
      >
        {/* Top cluster */}
        <Stack alignItems="center" sx={{ pt: 1 }}>
          <RailLinkButton
            to="/dashboard"
            label="Home"
            icon={<HomeOutlinedIcon />}
          />

          <RailLinkButton
            to={"/dashboard/datastore"}
            label="Datastore"
            icon={<StorageOutlinedIcon />}
          />
          <RailLinkButton
            to={"/dashboard/dataset"}
            label="Datasets"
            icon={<DatasetOutlinedIcon />}
          />
          <RailLinkButton
            to={"/dashboard/project"}
            label="Project list"
            icon={<ViewListOutlinedIcon />}
          />
        </Stack>

        {/* Bottom cluster */}
        <Stack alignItems="center" sx={{ pb: 1 }}>
          <RailLinkButton
            to="/settings"
            label="Settings"
            icon={<SettingsOutlinedIcon />}
          />

          <Tooltip title="Sign out" placement="right" enterDelay={300}>
            <IconButton
              onClick={handleSignOut}
              sx={{
                width: 48,
                height: 48,
                my: 0.5,
                color: "text.secondary",
                "&:hover": { bgcolor: "action.hover" },
              }}
              aria-label="Sign out"
            >
              <LogoutOutlinedIcon />
            </IconButton>
          </Tooltip>
        </Stack>
      </Stack>
    </Box>
  )
}
