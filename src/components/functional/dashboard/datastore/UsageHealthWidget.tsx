import React from "react"
import { Box, Stack, Typography, Button, Chip } from "@mui/material"
import { useTheme, type Theme } from "@mui/material/styles"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import HeadingBlock from "../../../common/HeadingBlock"
import { SStack } from "../../../styled/SStack"

// Dummy dataset usage data
const chartData = [
  { dataset: "DS1", CSV: 12, MP3: 5 },
  { dataset: "DS2", MP4: 8, JSON: 6 },
  { dataset: "DS3", CSV: 4, Images: 10 },
  { dataset: "DS4", Annotations: 7, MP4: 3 },
  { dataset: "DS5", CSV: 9, JSON: 4, MP3: 2 },
]

const UsageHealthWidget = () => {
  const theme = useTheme()

  // ---- Metrics (mock) ----
  const used = 120
  const total = 500
  const free = total - used
  const datasets = 18
  const ingestionActive = 3 // if > 0 => Active, else Inactive
  const datastoreHealthy = true

  // Pie data + safe colors
  const USAGE_USED = theme.palette?.colors?.blue?.[500] ?? "#3b82f6"
  const USAGE_FREE = theme.palette?.colors?.grey?.[300] ?? "#d1d5db"
  const usageData = [
    { name: "Used", value: used, color: USAGE_USED },
    { name: "Free", value: free, color: USAGE_FREE },
  ]

  // Collect all unique file types (so bars render even if some datasets lack a key)
  const fileTypes = Array.from(
    new Set(
      chartData.flatMap((d) => Object.keys(d).filter((k) => k !== "dataset"))
    )
  )

  // File type -> color map (safe fallbacks)
  const colorMap: Record<string, string> = {
    CSV: theme.palette?.colors?.blue?.[500] ?? "#4f46e5",
    JSON: theme.palette?.colors?.green?.[500] ?? "#16a34a",
    MP3: theme.palette?.colors?.orange?.[500] ?? "#f59e0b",
    MP4: theme.palette?.colors?.red?.[500] ?? "#ef4444",
    Images: theme.palette?.colors?.purple?.[500] ?? "#8b5cf6",
    Annotations: theme.palette?.colors?.teal?.[500] ?? "#14b8a6",
  }

  return (
    <SStack
      direction="column"
      spacing={2}
      radius="lg"
      bgColor={theme.palette.background.default}
      sx={{ flexGrow: 1, width: "100%", minHeight: 0 }}
    >
      {/* Top row: Heading (left) + Metrics grid (right) */}
      <Box
        sx={{
          px: theme.custom.spacing.xs,
          pt: theme.custom.spacing.xs,
          display: "grid",
          gap: theme.custom.spacing.sm,
          gridTemplateColumns: "1fr",
          alignItems: "start",
          [theme.breakpoints.up("md")]: {
            gridTemplateColumns: "auto 1fr", // heading auto width, metrics take remaining
          },
        }}
      >
        {/* Left: Heading */}
        <HeadingBlock
          heading="Usage & Health"
          headingSize="h5"
          headingWeight={theme.custom.font.weight.regular}
          subheading="Datastore status and activity"
          padding={0}
        />

        {/* Right: Metrics grid (ALL FOUR BOXES INSIDE THIS ONE GRID) */}
        <Box
          sx={{
            minWidth: 0,
            display: "grid",
            gap: theme.custom.spacing.sm,
            gridTemplateColumns: "1fr",
            gridAutoRows: "1fr",
            [theme.breakpoints.up("sm")]: { gridTemplateColumns: "repeat(2, 1fr)" },
            [theme.breakpoints.up("md")]: { gridTemplateColumns: "repeat(4, 1fr)" },
          }}
        >
          {/* Box 1: Storage */}
          <Box
            sx={{
              p: 2,
              borderRadius: theme.custom?.radii?.md ?? 12,
              bgcolor: theme.palette.background.default,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              minHeight: 100,
            }}
          >
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mb: 1, fontWeight: theme.custom.font.weight.medium, whiteSpace: "nowrap" }}
            >
              Storage
            </Typography>

            <Stack direction="row" spacing={2} alignItems="center" sx={{ width: "100%", justifyContent: "center" }}>
              <PieChart width={80} height={80}>
                <Pie data={usageData} innerRadius={18} outerRadius={27} dataKey="value">
                  {usageData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>

              {/* Legend with inline values (no wrapping) */}
              <Stack spacing={1} sx={{ minWidth: 0 }}>
                {usageData.map((entry) => (
                  <Stack key={entry.name} direction="row" spacing={1} alignItems="center" sx={{ whiteSpace: "nowrap" }}>
                    <Box sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: entry.color }} />
                    <Typography variant="body2" color="text.secondary">
                      {entry.name}: {entry.value} GB
                    </Typography>
                  </Stack>
                ))}
              </Stack>
            </Stack>
          </Box>

          {/* Box 2: Datasets */}
          <Box
            sx={{
              p: 2,
              borderRadius: theme.custom?.radii?.md ?? 12,
              bgcolor: theme.palette.background.default,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              minHeight: 100,
            }}
          >
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mb: 1, fontWeight: theme.custom.font.weight.medium, whiteSpace: "nowrap" }}
            >
              Datasets
            </Typography>
            <Typography
              variant="h4"
              sx={{
                lineHeight: 1,
                fontWeight: theme.custom.font.weight.bold,
                whiteSpace: "nowrap",
              }}
            >
              {datasets}
            </Typography>
          </Box>

          {/* Box 3: Processing Jobs */}
          <Box
            sx={{
              p: 2,
              borderRadius: theme.custom?.radii?.md ?? 12,
              bgcolor: theme.palette.background.default,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              minHeight: 100,
            }}
          >
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mb: 1, fontWeight: theme.custom.font.weight.medium, whiteSpace: "nowrap" }}
            >
              Processing Jobs
            </Typography>
            <Chip
              label={ingestionActive > 0 ? "Active" : "Inactive"}
              sx={{
                px: 1,
                fontSize: theme.custom.font.size.md,
                bgcolor:
                  ingestionActive > 0
                    ? theme.palette?.colors?.green?.[500] ?? "#16a34a"
                    : theme.palette?.colors?.grey?.[500] ?? "#9ca3af",
                color: theme.palette.common.white,
              }}
            />
          </Box>

          {/* Box 4: API Endpoint */}
          <Box
            sx={{
              p: 2,
              borderRadius: theme.custom?.radii?.md ?? 12,
              bgcolor: theme.palette.background.default,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              minHeight: 100,
            }}
          >
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mb: 1, fontWeight: theme.custom.font.weight.medium, whiteSpace: "nowrap" }}
            >
              API Endpoint
            </Typography>
            <Chip
              label={datastoreHealthy ? "Healthy" : "Offline"}
              sx={{
                px: 1,
                fontSize: theme.custom.font.size.md,
                bgcolor: datastoreHealthy
                  ? theme.palette?.colors?.green?.[500] ?? "#16a34a"
                  : theme.palette?.colors?.red?.[500] ?? "#ef4444",
                color: theme.palette.common.white,
              }}
            />
          </Box>
        </Box>
      </Box>

      {/* Bar Chart — side-by-side (fixed height so it always renders) */}
      <Box sx={{ width: "100%", height: 200, px: theme.custom.spacing.sm }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 0, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="dataset" />
            <YAxis />
            <Tooltip />
            <Legend />
            {fileTypes.map((fileType) => (
              <Bar
                key={fileType}
                dataKey={fileType}
                // No stackId => grouped side-by-side bars
                fill={colorMap[fileType] ?? (theme.palette?.colors?.grey?.[400] ?? "#cccccc")}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </Box>

      {/* Actions */}
      <Stack
        direction="row"
        justifyContent="flex-end"
        spacing={1}
        sx={{
          p: theme.custom.spacing.xs,
          borderTop: `1px solid ${theme.palette.divider}`,
          backgroundColor: theme.palette.background.default,
        }}
      >
        <Button
          variant="contained"
          size="small"
          sx={(t: Theme) => ({
            color: t.palette.getContrastText(t.palette.accent1.vibrant),
            borderRadius: t.custom?.radii?.xs,
            fontSize: t.custom.font.size.sm,
            backgroundColor: t.palette.accent1.vibrant,
            "&:hover": { backgroundColor: t.palette.accent1.dim },
          })}
        >
          Create Dataset
        </Button>
        <Button
          variant="outlined"
          size="small"
          sx={(t: Theme) => ({
            borderRadius: t.custom?.radii?.xs,
            fontSize: t.custom.font.size.sm,
            color: t.palette.accent1.vibrant,
            borderColor: t.palette.accent1.vibrant,
            "&:hover": { backgroundColor: t.palette.accent1.dim },
          })}
        >
          Create Processing Job
        </Button>
      </Stack>
    </SStack>
  )
}

export default UsageHealthWidget
