import React from "react"
import { Box, Button, Stack, Typography } from "@mui/material"
import { useTheme, type Theme } from "@mui/material/styles"
import { PieChart } from "@mui/x-charts/PieChart"
import StarIcon from "@mui/icons-material/Star"
import ShareIcon from "@mui/icons-material/Share"
import HeadingBlock from "../../../common/HeadingBlock"
import { SStack } from "../../../styled/SStack"

type ActionButton = {
  label: string
  variant?: "text" | "outlined" | "contained"
  color?: "primary" | "secondary" | "inherit"
  onClick?: () => void
  fullWidth?: boolean
  style?: (theme: Theme) => object | object
}

type FileTypeSlice = {
  label: string
  value: number
  color?: string
}

interface ProjectOverviewProps {
  title?: string
  fileTypeBreakdown?: FileTypeSlice[]
  datasetsCount?: number
  stars?: number
  shares?: number
  lastUpdated?: string
  actionButtons?: ActionButton[]
}

const ProjectOverviewWidget: React.FC<ProjectOverviewProps> = ({
  title = "Project Overview",
  fileTypeBreakdown = [
    { label: "CSV", value: 12 },
    { label: "JSON", value: 6 },
    { label: "Images", value: 9 },
    { label: "MP4", value: 3 },
    { label: "Annotations", value: 4 },
  ],
  datasetsCount = 4,
  stars = 37,
  shares = 12,
  lastUpdated = "Aug 16, 2025",
  actionButtons = [],
}) => {
  const theme = useTheme()

  // Map colors with safe fallbacks
  const colorMap: Record<string, string> = {
    CSV: theme.palette?.colors?.blue?.[500] ?? "#3b82f6",
    JSON: theme.palette?.colors?.green?.[500] ?? "#16a34a",
    Images: theme.palette?.colors?.orange?.[500] ?? "#f59e0b",
    MP4: theme.palette?.colors?.red?.[500] ?? "#ef4444",
    MP3: theme.palette?.colors?.purple?.[500] ?? "#8b5cf6",
    Annotations: theme.palette?.colors?.teal?.[500] ?? "#14b8a6",
  }
  const seriesData = fileTypeBreakdown.map((s, i) => ({
    id: i,
    value: s.value,
    label: s.label,
    color: s.color ?? colorMap[s.label] ?? theme.palette.grey[500],
  }))

  return (
    <SStack
      direction="column"
      spacing={2}
      radius="lg"
      bgColor="transparent"
      noShadow
      noBorder
      sx={{ flex: 1, minHeight: 0 }}
    >
      <Box
        sx={{
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: theme.custom?.radii?.xs,
          backgroundColor: theme.palette.background.paper,
          boxShadow: theme.palette.boxShadow?.light,
          p: theme.custom.spacing.xs,
          display: "flex",
          flexDirection: "column",
          gap: theme.custom.spacing.xs,
          height: "100%"
        }}
      >
        <HeadingBlock
          heading={title}
          headingSize="h6"
          headingWeight={theme.custom.font.weight.regular}
          subheading="Project files breakdown and metrics"
          padding={0}
        />

        {/* File Types: bigger pie + single legend (with counts) on the right */}
        <Box>
          <Stack direction="row" spacing={2} alignItems="center" justifyContent={'center'} >
            <Box
              sx={{ "& .MuiChartsLegend-root": { display: "none !important" } }}
            >
              <PieChart
                series={[
                  {
                    data: seriesData,
                    innerRadius: 24,
                    outerRadius: 48,
                  },
                ]}
                width={160}
                height={120}
                colors={seriesData.map((d) => d.color as string)}
              />
            </Box>

            <Stack spacing={0.5} sx={{ minWidth: 0 }}>
              {seriesData.map((s) => (
                <Stack
                  key={s.id}
                  direction="row"
                  spacing={1}
                  alignItems="center"
                >
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      bgcolor: s.color,
                      flexShrink: 0,
                    }}
                  />
                  <Typography variant="body2" color="text.secondary" noWrap>
                    {s.label} {s.value}
                  </Typography>
                </Stack>
              ))}
            </Stack>
          </Stack>
        </Box>

        {/* Consistent metrics: heading on top, value below */}
        <Box
          sx={{
            display: "grid",
            gap: theme.custom.spacing.sm,
            mt: theme.custom.spacing.sm,
            gridTemplateColumns: "repeat(2, 1fr)",
            [theme.breakpoints.up("sm")]: {
              gridTemplateColumns: "repeat(4, 1fr)",
            },
          }}
        >
          {/* Datasets */}
          <Box>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mb: 0.5, whiteSpace: "nowrap" }}
            >
              Datasets
            </Typography>
            <Typography
              variant="h6"
              sx={{
                lineHeight: 1.1,
                fontWeight: theme.custom.font.weight.bold,
              }}
            >
              {datasetsCount}
            </Typography>
          </Box>

          {/* Shares */}
          <Box>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mb: 0.5, whiteSpace: "nowrap" }}
            >
              Shares
            </Typography>
            <Stack direction="row" spacing={0.5} alignItems="center">
              <ShareIcon fontSize="small" />
              <Typography
                sx={{
                  lineHeight: 1.1,
                  fontWeight: theme.custom.font.weight.medium,
                  fontSize: theme.custom.font.size.md,
                }}
              >
                x{shares}
              </Typography>
            </Stack>
          </Box>

          {/* Stars */}
          <Box>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mb: 0.5, whiteSpace: "nowrap" }}
            >
              Stars
            </Typography>
            <Stack direction="row" spacing={0.5} alignItems="center">
              <StarIcon
                sx={{ color: theme.palette.colors.yellow?.[600] ?? "#eab308" }}
                fontSize="small"
              />
              <Typography
                sx={{
                  lineHeight: 1.1,
                  fontWeight: theme.custom.font.weight.medium,
                  fontSize: theme.custom.font.size.md,
                }}
              >
                x{stars}
              </Typography>
            </Stack>
          </Box>

          {/* Last Updated */}
          <Box>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mb: 0.5, whiteSpace: "nowrap" }}
            >
              Last Updated
            </Typography>
            <Typography
              sx={{
                lineHeight: 1.1,
                fontWeight: theme.custom.font.weight.regular,
                color: theme.palette.text.primary,
              }}
            >
              {lastUpdated}
            </Typography>
          </Box>
        </Box>

        {/* Actions (optional) */}
        {actionButtons.length > 0 && (
          <Stack direction="row" spacing={1}>
            {actionButtons.map((btn, i) => (
              <Button
                key={i}
                variant={btn.variant || "contained"}
                color={btn.color || "primary"}
                fullWidth={btn.fullWidth ?? true}
                onClick={btn.onClick}
                sx={
                  typeof btn.style === "function"
                    ? (t) => btn.style!(t)
                    : btn.style || {}
                }
              >
                {btn.label}
              </Button>
            ))}
          </Stack>
        )}
      </Box>
    </SStack>
  )
}

export default ProjectOverviewWidget
