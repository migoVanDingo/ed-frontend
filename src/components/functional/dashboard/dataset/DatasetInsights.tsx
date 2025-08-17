import React from "react"
import Card from "@mui/material/Card"
import CardContent from "@mui/material/CardContent"
import Typography from "@mui/material/Typography"
import Grid from "@mui/material/Grid"
import { useTheme } from "@mui/material/styles"
import HeadingBlock from "../../../common/HeadingBlock"
import { SStack } from "../../../styled/SStack"

// Recharts
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts"

// Types
interface Dataset {
  id: string
  name: string
  type: string
  size: number
  created_at?: string
  updated_at?: string
}

interface DatasetInsightsProps {
  dataset?: Dataset
  data?: { label: string; value: number; color?: string }[]
}

const DatasetInsights: React.FC<DatasetInsightsProps> = ({
  dataset,
  data = [
    { label: "CSV", value: 6 },
    { label: "JSON", value: 2 },
    { label: "Images", value: 1 },
  ],
}) => {
  const theme = useTheme()

  // Fallback palette shades from theme
  const defaultColors = [
    theme.palette.colors.blue[500],
    theme.palette.colors.green[500],
    theme.palette.colors.orange[500],
    theme.palette.colors.purple[500],
  ]

  const datasetData = data.map((d, i) => ({
    ...d,
    color: d.color ?? defaultColors[i % defaultColors.length],
  }))

  const total = datasetData.reduce((sum, d) => sum + d.value, 0)

  return (
    <SStack
      direction="column"
      spacing={2}
      radius="lg"
      bgColor="transparent"
      noBorder
      height={'100%'}
      sx={{ flex: 1, flexShrink: 0, height: '100%' }}
    >
      <Card
        sx={{
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: theme.custom?.radii?.xs,
        }}
      >
        <CardContent>
          {/* Dynamic heading */}
          <HeadingBlock
            heading="Dataset Insights"
            subheading={dataset ? `Dataset: ${dataset.name}` : "All Datasets"}
            headingSize="h6"
            headingWeight={theme.custom.font.weight.regular}
            padding={0}
          />

          {/* Last updated (only for dataset mode) */}
          {dataset?.updated_at && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Last updated: {new Date(dataset.updated_at).toLocaleDateString()}
            </Typography>
          )}

          {/* Chart */}
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={datasetData}
              margin={{ top: 10, right: 10, left: 0, bottom: 30 }} // tighter margins
            >
              <XAxis dataKey="label" tick={{ fontSize: 12 }} interval={0} />
              <YAxis width={30} /> {/* keep it slim so chart aligns left */}
              <Tooltip />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {datasetData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>

          {/* Legend with percentages */}
          <Grid container spacing={1} sx={{ mt: 1, justifyContent: "space-between", pl: 2, pr: 2 }}>
            {datasetData.map((d, i) => {
              const pct = total > 0 ? ((d.value / total) * 100).toFixed(1) : "0"
              return (
                <Grid
                  key={i}
                  xs={6} // two columns
                  sx={{ display: "flex", alignItems: "center", gap: 1}}
                >
                  <span
                    style={{
                      display: "inline-block",
                      width: 12,
                      height: 12,
                      borderRadius: "50%",
                      backgroundColor: d.color,
                    }}
                  />
                  <Typography variant="body2">
                    {d.label} — {pct}%
                  </Typography>
                </Grid>
              )
            })}
          </Grid>
        </CardContent>
      </Card>
    </SStack>
  )
}

export default DatasetInsights
