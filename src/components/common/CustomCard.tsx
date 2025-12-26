import React from "react"
import Card from "@mui/material/Card"
import CardContent from "@mui/material/CardContent"
import CardActions from "@mui/material/CardActions"
import Button from "@mui/material/Button"
import Chip from "@mui/material/Chip"
import Typography from "@mui/material/Typography"
import IconButton from "@mui/material/IconButton"
import MoreVertIcon from "@mui/icons-material/MoreVert"
import Stack from "@mui/material/Stack"
import { useTheme } from "@mui/material/styles"
import type { Theme } from "@mui/material/styles"

interface CustomCardProps {
  title: string
  orgName: string
  description: string
  statusLabel: string
  statusColor?:
    | "default"
    | "primary"
    | "secondary"
    | "error"
    | "info"
    | "success"
    | "warning"
  datasetsCount: number
  lastUpdated: string
  onOpen?: () => void
  onSettings?: () => void
  onMenuClick?: () => void
  onTitleClick?: () => void
  accentColor?: keyof Theme["palette"] // e.g. "accent1" | "accent2" | "primary"
  borderRadius?: keyof Theme["custom"]["radii"]
  disableShadow?: boolean
  height?: number
  width?: number
}

const CustomCard: React.FC<CustomCardProps> = ({
  title,
  orgName,
  description,
  statusLabel,
  statusColor = "default",
  datasetsCount,
  lastUpdated,
  height,
  width,
  onOpen,
  onSettings,
  onMenuClick,
  onTitleClick,
  accentColor = "accent1",
  borderRadius = "xs",
  disableShadow = false,
}) => {
  const theme = useTheme()

  const accent = theme.palette[accentColor] as any // to access .vibrant and .dim

  return (
    <Card
      sx={{
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: theme.custom?.radii?.[borderRadius],
        backgroundColor: theme.palette.background.paper,
        boxShadow: disableShadow ? "none" : theme.palette.boxShadow?.light,
        display: "flex",
        flexDirection: "column",
        paddingBottom: theme.custom?.spacing?.xs,
        height: height ? height : "auto",
        minHeight: 200,
        width: width || "100%",
      }}
    >
      <CardContent sx={{ flexGrow: 1 }}>
        {/* Top Row: Chip + Datasets + Updated + Menu */}
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ mb: 1 }}
        >
          <Stack direction="row" spacing={1} alignItems="center">
            <Chip label={statusLabel} color={statusColor} size="small" />
            <Typography variant="body2" color="text.secondary">
              Datasets: {datasetsCount}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Updated {lastUpdated}
            </Typography>
          </Stack>
          <IconButton size="small" onClick={onMenuClick}>
            <MoreVertIcon fontSize="small" />
          </IconButton>
        </Stack>

        {/* Project Title */}
        <Typography
          variant="h6"
          gutterBottom
          sx={{
            cursor: onTitleClick ? "pointer" : "default",
            color: onTitleClick ? accent?.vibrant : "inherit",
            "&:hover": onTitleClick
              ? { color: accent?.dim }
              : undefined,
          }}
          onClick={onTitleClick}
        >
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {orgName}
        </Typography>

        {/* Project description */}
        <Typography variant="body2" color="text.primary">
          {description}
        </Typography>
      </CardContent>

      {/* Bottom buttons */}
      <CardActions sx={{ pt: 0, ml: "auto", pr: theme.custom?.spacing?.xs }}>
        <Button
          size="small"
          variant="contained"
          onClick={onOpen}
          sx={{
            backgroundColor: accent?.vibrant,
            color: theme.palette.getContrastText(accent?.vibrant),
            "&:hover": {
              backgroundColor: accent?.dim,
            },
          }}
        >
          Open
        </Button>
        <Button
          size="small"
          variant="outlined"
          onClick={onSettings}
          sx={{
            color: accent?.vibrant,
            borderColor: accent?.vibrant,
            "&:hover": {
              backgroundColor: accent?.dim,
              borderColor: accent?.vibrant,
            },
          }}
        >
          Settings
        </Button>
      </CardActions>
    </Card>
  )
}

export default CustomCard
