import AddIcon from "@mui/icons-material/Add";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import NotificationsIcon from "@mui/icons-material/Notifications";
import { Box, IconButton, Typography, useTheme } from "@mui/material";
import Avatar from "@mui/material/Avatar";
import { useNavigate } from "react-router-dom";
import { useColorMode } from "../../../theme/ThemeProvider";

interface HeaderProps {
  username: string;
}

const Header = ({ username }: HeaderProps) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const { mode, toggleMode } = useColorMode();

  const icon =
    mode === "light"
      ? <DarkModeIcon />
      : <LightModeIcon />;

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
        <IconButton aria-label="create-new">
          <AddIcon />
        </IconButton>

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
  );
};

export default Header;
