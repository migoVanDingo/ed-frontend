import React from "react"
import { Box, Button, Chip, Stack } from "@mui/material"
import { useTheme, type Theme } from "@mui/material/styles"
import { DataGrid, type GridColDef } from "@mui/x-data-grid"
import HeadingBlock from "../../../common/HeadingBlock"
import { SStack } from "../../../styled/SStack"
import { formatRelativeTime } from "../../../../utility/formatter/timeHelper"

interface Project {
  id: string
  name: string
  tags?: string[]
  updated_at: string // ISO
}

interface ProjectExplorerWidgetProps {
  projects?: Project[]
  onSelectProject?: (project: Project) => void
}

const defaultProjects: Project[] = [
  { id: "p1", name: "Customer Churn Analysis", tags: ["ETL", "Regression", "Prod"], updated_at: "2025-08-12T10:15:00Z" },
  { id: "p2", name: "Product Image Classifier", tags: ["Vision", "Training"], updated_at: "2025-08-15T18:45:00Z" },
  { id: "p3", name: "Event Log Ingestion", tags: ["Ingest", "Streaming", "Kafka"], updated_at: "2025-08-14T07:30:00Z" },
  { id: "p4", name: "Documentation Search", tags: ["NLP", "Embeddings"], updated_at: "2025-08-10T12:05:00Z" },
  { id: "p5", name: "Pricing Experiments", tags: ["AB-Testing", "Experimental"], updated_at: "2025-08-09T22:00:00Z" },
]

const ProjectExplorerWidget: React.FC<ProjectExplorerWidgetProps> = ({
  projects = defaultProjects,
  onSelectProject,
}) => {
  const theme = useTheme()

  // Ensure tags is always an array
  const rows: Project[] = (projects ?? []).map((p) => ({
    ...p,
    tags: Array.isArray(p.tags) ? p.tags : [],
  }))

  const tagColors: Record<string, string> = {
    ETL: theme.palette.colors.blue[500],
    Regression: theme.palette.colors.purple[500],
    Prod: theme.palette.colors.green[600],
    Vision: theme.palette.colors.orange[500],
    Training: theme.palette.colors.red[400],
    Ingest: theme.palette.colors.teal?.[500] ?? theme.palette.colors.green[500],
    Streaming: theme.palette.colors.indigo?.[400] ?? theme.palette.colors.blue[400],
    Kafka: theme.palette.colors.brown?.[400] ?? theme.palette.grey[600],
    NLP: theme.palette.colors.pink?.[400] ?? theme.palette.colors.purple[400],
    Embeddings: theme.palette.colors.cyan?.[500] ?? theme.palette.colors.blue[300],
    "AB-Testing": theme.palette.colors.amber?.[500] ?? theme.palette.colors.orange[400],
    Experimental: theme.palette.colors.grey[600],
  }

  const columns: GridColDef<Project>[] = [
    { field: "name", headerName: "Name", flex: 1, minWidth: 180 },

    {
      field: "tags",
      headerName: "Tags",
      flex: 1,
      minWidth: 180,
      renderCell: (params) => {
        const tags: string[] = Array.isArray(params.row?.tags) ? params.row.tags! : []
        return (
          <Box
            title={tags.join(", ")}
            sx={{
              display: "flex",
              gap: 0.5,
              alignItems: "center",
              flexWrap: "nowrap",
              overflow: "hidden",
              width: "100%",
              WebkitMaskImage: "linear-gradient(to right, black 85%, transparent)",
              maskImage: "linear-gradient(to right, black 85%, transparent)",
            }}
          >
            {tags.map((t) => (
              <Chip
                key={t}
                label={t}
                size="small"
                sx={{
                  flex: "0 0 auto",
                  backgroundColor: tagColors[t] || theme.palette.grey[400],
                  color: theme.palette.common.white,
                  fontSize: theme.custom.font.size.sm,
                  fontWeight: theme.custom.font.weight.bold,
                  height: 24,
                  whiteSpace: "nowrap",
                }}
              />
            ))}
          </Box>
        )
      },
      // enable built-in filtering on tags via string contains
      filterable: true,
      type: "string",
      valueGetter: (params: any) =>
        Array.isArray(params.row?.tags) ? params.row.tags!.join(" ") : "",
    },

    {
      field: "updated_at",
      headerName: "Last Updated",
      width: 160,
      type: "date", // lets the built-in Filter panel use date operators
      valueGetter: (params: any) => {
        const iso = params.row?.updated_at
        const d = iso ? new Date(iso) : null
        return d && !isNaN(d.getTime()) ? d : null
      },
      renderCell: (params) => (
        <span
          style={{
            fontSize: theme.custom.font.size.sm,
            color: theme.palette.text.secondary,
          }}
        >
          {formatRelativeTime(params.row?.updated_at)}
        </span>
      ),
    },
  ]

  return (
    <SStack
      direction="column"
      spacing={2}
      radius="lg"
      bgColor="transparent"
      padding="sm"
      sx={{ flexGrow: 1, width: "100%", minHeight: 0 }}
    >
      <HeadingBlock
        heading="Project Explorer"
        headingSize="h5"
        headingWeight={theme.custom.font.weight.regular}
        subheading="Use the grid to search and select the project you want to work on."
        padding={0}
      />

      <Box sx={{ flex: 1, minHeight: 0 }}>
        <DataGrid
          rows={rows}
          columns={columns}
          getRowId={(r) => r.id}
          pageSizeOptions={[5, 10]}
          initialState={{ pagination: { paginationModel: { pageSize: 5 } } }}
          disableRowSelectionOnClick
          onRowClick={(params) => onSelectProject?.(params.row)}

          // 🔹 Match your DatasetList: built-in toolbar with Quick Filter
          showToolbar
          slotProps={{
            toolbar: {
              showQuickFilter: true,
              quickFilterProps: { debounceMs: 300 },
            },
          }}

          sx={{
            border: "none",
            boxShadow: "none",
            backgroundColor: "transparent",
            "& .MuiDataGrid-main": { backgroundColor: "transparent" },
            "& .MuiDataGrid-columnHeaders": {
              backgroundColor: "transparent",
              fontWeight: theme.custom.font.weight.bold,
              color: theme.palette.text.primary,
              fontSize: theme.custom.font.size.md,
            },
            "& .MuiDataGrid-cell": {
              display: "flex",
              alignItems: "center",
              overflow: "hidden",
              borderBottom: `1px solid ${theme.palette.divider}`,
            },
            "& .MuiDataGrid-row:hover": {
              backgroundColor: theme.palette.action.hover,
              cursor: "pointer",
            },
            "& .MuiDataGrid-row:nth-of-type(even)": {
              backgroundColor:
                theme.palette.mode === "dark"
                  ? theme.palette.grey[900]
                  : theme.palette.grey[50],
            },
            "& .MuiDataGrid-toolbarContainer": {
              p: theme.custom.spacing.xs,
              backgroundColor: theme.palette.background.paper,
              borderBottom: `1px solid ${theme.palette.divider}`,
            },
          }}
        />
      </Box>

      {/* Bottom Actions */}
      <Stack
        direction="row"
        justifyContent="flex-end"
        spacing={1}
        sx={{
          p: theme.custom.spacing.xs,
          borderTop: `1px solid ${theme.palette.divider}`,
          backgroundColor: theme.palette.background.paper,
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
          New Project
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
          View All
        </Button>
      </Stack>
    </SStack>
  )
}

export default ProjectExplorerWidget
