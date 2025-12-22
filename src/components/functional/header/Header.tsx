import { useState, type MouseEvent } from "react"
import AddIcon from "@mui/icons-material/Add"
import DarkModeIcon from "@mui/icons-material/DarkMode"
import LightModeIcon from "@mui/icons-material/LightMode"
import NotificationsIcon from "@mui/icons-material/Notifications"
import {
  Box,
  IconButton,
  Typography,
  useTheme,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material"
import WorkOutlineIcon from "@mui/icons-material/WorkOutline"
import DatasetOutlinedIcon from "@mui/icons-material/DatasetOutlined"
import BusinessOutlinedIcon from "@mui/icons-material/BusinessOutlined"

import Avatar from "@mui/material/Avatar"
import { useNavigate } from "react-router-dom"
import { useColorMode } from "../../../theme/ThemeProvider"
import { useDispatch } from "react-redux";
import { openModal } from "../../../store/slices/modalSlice"

interface HeaderProps {
  username: string
}

const Header = ({ username }: HeaderProps) => {
  const navigate = useNavigate()
  const theme = useTheme()
  const { mode, toggleMode } = useColorMode()
  const dispatch = useDispatch();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const isMenuOpen = Boolean(anchorEl)

  const handleOpenMenu = (event: MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleCloseMenu = () => {
    setAnchorEl(null)
  }

  const handleCreateProject = () => {
    dispatch(openModal({ type: "createProject" }));
    handleCloseMenu()
  }

  const handleCreateDataset = () => {
    dispatch(openModal({ type: "createDataset" }));
    handleCloseMenu()
  }

  const handleCreateOrganization = () => {
    dispatch(openModal({ type: "createOrg" }));
    handleCloseMenu()
  }

  const icon = mode === "light" ? <DarkModeIcon /> : <LightModeIcon />

  return (
    <Box
      component="header"
      sx={{
        width: "100%",
        height: theme.custom.component.header.height,
        bgcolor: theme.palette.background.paper,
        borderBottom: `1px solid ${theme.palette.divider}`,
        px: theme.custom.spacing.sm,
        py: theme.custom.spacing.xs,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 2,
      }}
    >
      {/* Left Side */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <Typography
          variant="h6"
          onClick={() => navigate("/profile")}
          sx={{
            fontWeight: "bold",
            color: theme.palette.text.primary,
            cursor: "pointer",
          }}
        >
          {username}
        </Typography>
      </Box>

      {/* Right Side */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        {/* Create New Dropdown Trigger */}
        <IconButton
          aria-label="create-new"
          aria-controls={isMenuOpen ? "create-new-menu" : undefined}
          aria-haspopup="true"
          aria-expanded={isMenuOpen ? "true" : undefined}
          onClick={handleOpenMenu}
        >
          <AddIcon />
        </IconButton>

        <Menu
          id="create-new-menu"
          anchorEl={anchorEl}
          open={isMenuOpen}
          onClose={handleCloseMenu}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          transformOrigin={{ vertical: "top", horizontal: "right" }}
        >
          <MenuItem onClick={handleCreateProject}>
            <ListItemIcon>
              <WorkOutlineIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Create project" />
          </MenuItem>

          <MenuItem onClick={handleCreateDataset}>
            <ListItemIcon>
              <DatasetOutlinedIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Create dataset" />
          </MenuItem>

          <MenuItem onClick={handleCreateOrganization}>
            <ListItemIcon>
              <BusinessOutlinedIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Create organization" />
          </MenuItem>
        </Menu>

        <IconButton aria-label="notifications">
          <NotificationsIcon />
        </IconButton>

        <Avatar alt={username} src="" sx={{ width: 32, height: 32 }} />

        <IconButton
          aria-label="theme-toggle"
          onClick={toggleMode}
          title={`Switch theme (${mode})`}
        >
          {icon}
        </IconButton>
      </Box>
    </Box>
  )
}

export default Header
