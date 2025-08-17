import React from "react"
import Card from "@mui/material/Card"
import CardContent from "@mui/material/CardContent"
import Typography from "@mui/material/Typography"
import LinearProgress from "@mui/material/LinearProgress"
import Button from "@mui/material/Button"
import Stack from "@mui/material/Stack"
import { PieChart } from "@mui/x-charts/PieChart"
import { useTheme } from "@mui/material/styles"
import StarIcon from "@mui/icons-material/Star"
import ShareIcon from "@mui/icons-material/Share"
import HeadingBlock from "../../../common/HeadingBlock"
import { SStack } from "../../../styled/SStack"

// Type for buttons
type ActionButton = {
  label: string
  variant?: "text" | "outlined" | "contained"
  color?: "primary" | "secondary" | "inherit"
  onClick?: () => void
  fullWidth?: boolean
  style: object
}

interface DataOverviewProps {
  title?: string
  actionButtons?: ActionButton[]
}

const DataOverview: React.FC<DataOverviewProps> = ({
  title = "Datastore Overview",
  actionButtons = [],
}) => {
  const theme = useTheme()

  const totalStorage = 10 // GB
  const usedStorage = 3.2
  const storagePercent = (usedStorage / totalStorage) * 100

  const fileTypeData = [
    { id: 0, value: 60, label: "CSV" },
    { id: 1, value: 25, label: "JSON" },
    { id: 2, value: 15, label: "Images" },
  ]

  const shares = 12
  const stars = 48
  const lastUpload = "Aug 14, 2025"

  return (
    <SStack
      direction="column"
      spacing={2}
      radius="lg"
      bgColor={["transparent"]}
      noShadow
      noBorder
      sx={{
        flex: 2,
        flexShrink: 0,
      }}
    >
      <Card
        sx={{
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: theme.custom?.radii?.xs,
          backgroundColor: theme.palette.background.paper,
          boxShadow: theme.palette.boxShadow?.light,
          display: "flex",
          flexDirection: "column",
          margin: 0,
        }}
      >
        <CardContent>
          <HeadingBlock
            heading={title}
            headingSize="h6"
            headingWeight={theme.custom.font.weight.regular}
            padding={0}
          />

          {/* Storage usage */}
          <Typography variant="subtitle1" gutterBottom>
            Storage Usage
          </Typography>
          <Typography variant="body2" gutterBottom>
            {usedStorage} GB of {totalStorage} GB (
            {Math.round(100 - storagePercent)}% remaining)
          </Typography>
          <LinearProgress
            variant="determinate"
            value={storagePercent}
            sx={{
              height: 8,
              borderRadius: 5,
              mb: 2,
              "& .MuiLinearProgress-bar": {
                backgroundColor: theme.palette.accent1.vibrant,
              },
              "&.MuiLinearProgress-root": {
                backgroundColor: theme.palette.primary.main,
              },
            }}
          />

          {/* File breakdown pie chart */}
          <Typography variant="subtitle1" gutterBottom>
            File Types
          </Typography>
          <PieChart
            series={[
              {
                data: fileTypeData,
                innerRadius: 20,
                outerRadius: 40,
              },
            ]}
            width={180}
            height={120}
          />

          {/* Last upload */}
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Last upload: {lastUpload}
          </Typography>

          {/* Engagement metrics */}
          <Stack
            direction="row"
            spacing={3}
            alignItems="center"
            sx={{ mt: 1, mb: 2 }}
          >
            <Stack direction="row" spacing={0.5} alignItems="center">
              <ShareIcon fontSize="small" />
              <Typography variant="body2">{shares} Shares</Typography>
            </Stack>
            <Stack direction="row" spacing={0.5} alignItems="center">
              <StarIcon fontSize="small" />
              <Typography variant="body2">{stars} Stars</Typography>
            </Stack>
          </Stack>

          {/* Actions */}
          {actionButtons.length > 0 && (
            <Stack direction="row" spacing={2}>
              {actionButtons.map((btn, i) => (
                <Button
                  key={i}
                  variant={btn.variant || "contained"}
                  color={btn.color || "primary"}
                  fullWidth={btn.fullWidth ?? true}
                  onClick={btn.onClick}
                  sx={btn.style || {}}
                >
                  {btn.label}
                </Button>
              ))}
            </Stack>
          )}
        </CardContent>
      </Card>
    </SStack>
  )
}

export default DataOverview
