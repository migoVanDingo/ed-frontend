import React from "react"
import {
  Box,
  Button,
  Chip,
  Link as MuiLink,
  Stack,
  Typography,
} from "@mui/material"
import { useTheme, type Theme } from "@mui/material/styles"
import { DataGrid, type GridColDef, GridToolbar } from "@mui/x-data-grid"
import HeadingBlock from "../../../common/HeadingBlock"
import { SStack } from "../../../styled/SStack"
import { formatRelativeTime } from "../../../../utility/formatter/timeHelper"

type Origin = "User" | "Link" | "Ingest" | "Pipeline" | "Derived"

interface ProjectDatasetRow {
  id: string
  name: string
  origin: Origin
  updatedAt: string // ISO
}

interface ProjectDatasetsWidgetProps {
  datasets?: ProjectDatasetRow[]
  onOpenDatasetDashboard?: () => void
  onManageProjectDatasets?: () => void
}

const MOCK_ROWS: ProjectDatasetRow[] = [
  {
    id: "ds_001",
    name: "Customer Records",
    origin: "User",
    updatedAt: "2025-08-14T12:10:00Z",
  },
  {
    id: "ds_002",
    name: "Event Logs",
    origin: "Ingest",
    updatedAt: "2025-08-15T09:02:00Z",
  },
  {
    id: "ds_003",
    name: "Images (S3)",
    origin: "Link",
    updatedAt: "2025-08-16T17:45:00Z",
  },
  {
    id: "ds_004",
    name: "Labeled Samples",
    origin: "Pipeline",
    updatedAt: "2025-08-17T03:21:00Z",
  },
  {
    id: "ds_005",
    name: "Features v2",
    origin: "Derived",
    updatedAt: "2025-08-12T08:05:00Z",
  },
]

const ProjectDatasetsWidget: React.FC<ProjectDatasetsWidgetProps> = ({
  datasets = MOCK_ROWS,
  onOpenDatasetDashboard,
  onManageProjectDatasets,
}) => {
  const theme = useTheme()

  const originColors: Record<Origin, string> = {
    User: theme.palette?.colors?.blue?.[500] ?? "#3b82f6",
    Link: theme.palette?.colors?.purple?.[500] ?? "#8b5cf6",
    Ingest: theme.palette?.colors?.green?.[500] ?? "#16a34a",
    Pipeline: theme.palette?.colors?.amber?.[600] ?? "#d97706",
    Derived: theme.palette?.colors?.teal?.[500] ?? "#14b8a6",
  }

  const columns: GridColDef<ProjectDatasetRow>[] = [
    {
      field: "name",
      headerName: "Dataset",
      flex: 1,
      minWidth: 220,
      renderCell: (params) => (
        <MuiLink
          href={`/datasets/${params.row.id}`}
          underline="hover"
          sx={{
            color: theme.palette.accent1.vibrant,
            fontWeight: theme.custom.font.weight.medium,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {params.value}
        </MuiLink>
      ),
    },
    {
      field: "origin",
      headerName: "Origin",
      width: 150,
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          sx={{
            bgcolor:
              originColors[params.value as Origin] ?? theme.palette.grey[500],
            color: theme.palette.common.white,
            fontSize: theme.custom.font.size.sm,
            fontWeight: theme.custom.font.weight.bold,
            height: 24,
            whiteSpace: "nowrap",
          }}
        />
      ),
      type: "string",
      filterable: true,
    },
    {
      field: "updatedAt",
      headerName: "Last Updated",
      width: 160,
      type: "date",
      valueGetter: (params: any) => {
        const iso = params.row?.updatedAt
        const d = iso ? new Date(iso) : null
        return d && !isNaN(d.getTime()) ? d : null
      },
      renderCell: (params) => (
        <Typography
          variant="body2"
          sx={{ color: theme.palette.text.secondary }}
        >
          {formatRelativeTime(params.row?.updatedAt)}
        </Typography>
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
        heading="Project Datasets"
        subheading="Datasets associated with this project."
        headingSize="h6"
        headingStyle={{ padding: "1rem 0 0 1rem " }}
        subheadingStyle={{ paddingLeft: "1rem" }}
        headingWeight={theme.custom.font.weight.regular}
        padding={0}
      />

      <Box sx={{ flex: 1, minHeight: 0 }}>
        <DataGrid
          density="compact"
          rows={datasets}
          columns={columns}
          getRowId={(r) => r.id}
          disableRowSelectionOnClick
          pageSizeOptions={[5, 10, 25]}
          initialState={{ pagination: { paginationModel: { pageSize: 5 } } }}
          slots={{ toolbar: GridToolbar }}
          slotProps={{
            toolbar: {
              showQuickFilter: true,
              quickFilterProps: { debounceMs: 300 },
            },
          }}
          hideFooterSelectedRowCount
          sx={{
            border: "none",
            /* footer container */
            "& .MuiDataGrid-footerContainer": {
              minHeight: 36,
              height: 36,
              px: 1,
              border: "none",
              backgroundColor: theme.palette.background.paper,
              boxShadow: "none",
            },
            /* the TablePagination root + toolbar */
            "& .MuiTablePagination-root": { minHeight: 36, height: 36 },
            "& .MuiTablePagination-toolbar": {
              minHeight: 36,
              height: 36,
              p: 0,
              border: "none",
              backgroundColor: theme.palette.background.paper,
              boxShadow: "none",
            },
            /* tighten text + remove extra gaps */
            "& .MuiTablePagination-displayedRows, & .MuiTablePagination-selectLabel":
              {
                m: 0,
                fontSize: (t) => t.custom.font.size.sm,
                lineHeight: "36px",
              },
            "& .MuiTablePagination-input": { m: 0 },
            "& .MuiTablePagination-actions": { m: 0 },
            "& .MuiTablePagination-spacer": { display: "none" }, // optional
          }}
        />
      </Box>

      <Stack
        direction="row"
        justifyContent="flex-end"
        spacing={1}
        sx={{
          p: theme.custom.spacing.xs,
          borderTop: `1px solid ${theme.palette.divider}`,
          backgroundColor: theme.palette.background.paper,
          flexShrink: 0,
        }}
      >
        <Button
          variant="outlined"
          size="small"
          onClick={onOpenDatasetDashboard}
          sx={(t: Theme) => ({
            borderRadius: t.custom?.radii?.xs,
            fontSize: t.custom.font.size.sm,
            color: t.palette.accent1.vibrant,
            borderColor: t.palette.accent1.vibrant,
            "&:hover": { backgroundColor: t.palette.accent1.dim },
          })}
        >
          Dataset Dashboard
        </Button>
        <Button
          variant="contained"
          size="small"
          onClick={onManageProjectDatasets}
          sx={(t: Theme) => ({
            color: t.palette.getContrastText(t.palette.accent1.vibrant),
            borderRadius: t.custom?.radii?.xs,
            fontSize: t.custom.font.size.sm,
            backgroundColor: t.palette.accent1.vibrant,
            "&:hover": { backgroundColor: t.palette.accent1.dim },
          })}
        >
          Manage Project Datasets
        </Button>
      </Stack>
    </SStack>
  )
}

export default ProjectDatasetsWidget
