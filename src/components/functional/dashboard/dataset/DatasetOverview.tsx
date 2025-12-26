import React from "react"
import Card from "@mui/material/Card"
import CardContent from "@mui/material/CardContent"
import Typography from "@mui/material/Typography"
import LinearProgress from "@mui/material/LinearProgress"
import Button from "@mui/material/Button"
import Stack from "@mui/material/Stack"
import Table from "@mui/material/Table"
import TableBody from "@mui/material/TableBody"
import TableCell from "@mui/material/TableCell"
import TableHead from "@mui/material/TableHead"
import TableRow from "@mui/material/TableRow"
import { useTheme } from "@mui/material/styles"
import HeadingBlock from "../../../common/HeadingBlock"
import { SStack } from "../../../styled/SStack"
import { formatRelativeTime } from "../../../../utility/formatter/timeHelper"
import type { DatasetSummary } from "../../../../types/dashboard"
import { useNavigate } from "react-router-dom"

type DatasetOverviewProps = {
  datasets: DatasetSummary[]
}

const DatasetOverview = ({ datasets }: DatasetOverviewProps) => {
  const theme = useTheme()
  const nav = useNavigate()

  const totalDatasets = datasets.length
  const utilization = 0
  const recentDatasets = datasets.slice(0, 5)

  return (
    <SStack
      direction="column"
      spacing={2}
      radius="lg"
      bgColor="transparent"
      noBorder
      noShadow
      sx={{
        flex: 3,
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
          height: "100%",
        }}
      >
        <CardContent sx={{ flexGrow: 1 }}>
          <HeadingBlock heading="Datasets" headingWeight={200} />
          {/* Stats */}
          <Typography variant="subtitle1" gutterBottom>
            Total Datasets: {totalDatasets}
          </Typography>
          <Typography variant="body2" gutterBottom>
            Utilization: {Math.round(utilization)}% of datastore
          </Typography>
          <LinearProgress
            variant="determinate"
            value={utilization}
            sx={{
              height: 8,
              borderRadius: 5,
              mb: 2,
              "& .MuiLinearProgress-bar": {
                backgroundColor: theme.palette.accent2.vibrant,
              },
              "&.MuiLinearProgress-root": {
                backgroundColor: theme.palette.accent2.dim,
              },
            }}
          />

          {/* Recent datasets */}
          <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
            Recent Datasets
          </Typography>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell align="right">Size</TableCell>
                <TableCell align="right">Created</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {recentDatasets.map((ds) => (
                <TableRow key={ds.id}>
                  <TableCell
                    sx={{
                      maxWidth: 200,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    <Button
                      variant="text"
                      onClick={() => nav(`/dashboard/dataset/${ds.id}`)}
                      sx={{
                        padding: 0,
                        minWidth: "auto",
                        textTransform: "none",
                        justifyContent: "flex-start",
                        color: theme.palette.accent2.vibrant,
                        "&:hover": {
                          backgroundColor: "transparent",
                          color: theme.palette.accent2.dim,
                        },
                      }}
                    >
                      {ds.name}
                    </Button>
                  </TableCell>
                  <TableCell align="right">--</TableCell>
                  <TableCell align="right">
                    {formatRelativeTime(new Date(ds.created_at * 1000).toISOString())}
                  </TableCell>
                </TableRow>
              ))}
              {!recentDatasets.length && (
                <TableRow>
                  <TableCell colSpan={3} align="center">
                    No datasets yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>

        {/* Actions */}
        <Stack direction="row" spacing={2} sx={{ p: 2, pt: 0 }}>
          <Button
            fullWidth
            variant="contained"
            sx={{
              color: theme.palette.getContrastText(
                theme.palette.accent2.vibrant
              ),
              borderRadius: theme.custom?.radii?.xs,
              fontSize: theme.custom.font.size.sm,
              backgroundColor: theme.palette.accent2.vibrant,
              "&:hover": { backgroundColor: theme.palette.accent2.dim },
            }}
          >
            View All Datasets
          </Button>
          <Button
            fullWidth
            variant="outlined"
            sx={{
              borderRadius: theme.custom?.radii?.xs,
              fontSize: theme.custom.font.size.sm,
              color: theme.palette.accent2.vibrant,
              borderColor: theme.palette.accent2.vibrant,
              "&:hover": { backgroundColor: theme.palette.accent2.dim },
            }}
          >
            New Dataset
          </Button>
        </Stack>
      </Card>
    </SStack>
  )
}

export default DatasetOverview
