import React, { useMemo, useState } from "react"
import {
  Box,
  Stack,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  Chip,
  Button,
} from "@mui/material"
import { useTheme, type Theme } from "@mui/material/styles"
import { DataGrid, type GridColDef, GridToolbar } from "@mui/x-data-grid"
import MoreVertIcon from "@mui/icons-material/MoreVert"
import HeadingBlock from "../../../common/HeadingBlock"
import { SStack } from "../../../styled/SStack"
import { formatRelativeTime } from "../../../../utility/formatter/timeHelper"

type FileType = "CSV" | "JSON" | "Images" | "MP4" | "MP3" | "Annotations"
type FileMethod = "Upload" | "Link" | "Preprocess" | "Labeler" | "Pipeline"

interface ProjectFile {
  id: string
  name: string
  type: FileType
  size: number // bytes
  method: FileMethod
  updatedAt: string // ISO
}

interface ProjectViewProps {
  files?: ProjectFile[]
  onProjectView?: () => void
  onOpenSettings?: () => void
}

const DEFAULT_FILES: ProjectFile[] = [
  {
    id: "f1",
    name: "images_manifest.json",
    type: "JSON",
    size: 258_000,
    method: "Upload",
    updatedAt: "2025-08-15T10:15:00Z",
  },
  {
    id: "f2",
    name: "images_batch_01.zip",
    type: "Images",
    size: 104_857_600,
    method: "Link",
    updatedAt: "2025-08-14T09:42:00Z",
  },
  {
    id: "f3",
    name: "labels_v2.json",
    type: "Annotations",
    size: 780_000,
    method: "Labeler",
    updatedAt: "2025-08-16T18:05:00Z",
  },
  {
    id: "f4",
    name: "train.csv",
    type: "CSV",
    size: 3_450_000,
    method: "Preprocess",
    updatedAt: "2025-08-12T07:30:00Z",
  },
  {
    id: "f5",
    name: "inference_001.mp4",
    type: "MP4",
    size: 50_250_000,
    method: "Pipeline",
    updatedAt: "2025-08-17T02:12:00Z",
  },
  {
    id: "f6",
    name: "audio_notes.mp3",
    type: "MP3",
    size: 8_500_000,
    method: "Upload",
    updatedAt: "2025-08-10T12:10:00Z",
  },
]

const formatBytes = (size: number) => {
  if (size >= 1_000_000_000) return `${(size / 1_000_000_000).toFixed(1)} GB`
  if (size >= 1_000_000) return `${(size / 1_000_000).toFixed(1)} MB`
  if (size >= 1_000) return `${(size / 1_000).toFixed(1)} KB`
  return `${size} B`
}

const ProjectView: React.FC<ProjectViewProps> = ({
  files = DEFAULT_FILES,
  onProjectView,
  onOpenSettings,
}) => {
  const theme = useTheme()

  const typeColors: Record<FileType, string> = {
    CSV: theme.palette?.colors?.blue?.[500] ?? "#3b82f6",
    JSON: theme.palette?.colors?.green?.[500] ?? "#16a34a",
    Images: theme.palette?.colors?.orange?.[500] ?? "#f59e0b",
    MP4: theme.palette?.colors?.red?.[500] ?? "#ef4444",
    MP3: theme.palette?.colors?.purple?.[500] ?? "#8b5cf6",
    Annotations: theme.palette?.colors?.teal?.[500] ?? "#14b8a6",
  }
  const methodColors: Record<FileMethod, string> = {
    Upload: theme.palette?.colors?.blue?.[600] ?? "#2563eb",
    Link: theme.palette?.colors?.purple?.[500] ?? "#7c3aed",
    Preprocess: theme.palette?.colors?.amber?.[500] ?? "#f59e0b",
    Labeler: theme.palette?.colors?.pink?.[400] ?? "#f472b6",
    Pipeline: theme.palette?.colors?.green?.[600] ?? "#16a34a",
  }

  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
  const [menuRowId, setMenuRowId] = useState<string | null>(null)
  const openMenu = (e: React.MouseEvent<HTMLElement>, id: string) => {
    setAnchorEl(e.currentTarget)
    setMenuRowId(id)
  }
  const closeMenu = () => {
    setAnchorEl(null)
    setMenuRowId(null)
  }

  const columns: GridColDef<ProjectFile>[] = [
    { field: "name", headerName: "Name", flex: 1, minWidth: 220 },
    {
      field: "type",
      headerName: "Type",
      width: 140,
      renderCell: (params) => (
        <Chip
          label={params.value as string}
          size="small"
          sx={{
            bgcolor:
              typeColors[params.value as FileType] ?? theme.palette.grey[500],
            color: theme.palette.common.white,
            fontSize: theme.custom.font.size.sm,
            fontWeight: theme.custom.font.weight.bold,
            height: 24,
          }}
        />
      ),
      filterable: true,
      type: "string",
    },
    {
      field: "size",
      headerName: "Size",
      width: 120,
      renderCell: (params) => <span>{formatBytes(params.row.size)}</span>,
      type: "number",
    },
    {
      field: "method",
      headerName: "Method",
      width: 140,
      renderCell: (params) => (
        <Chip
          label={params.value as string}
          size="small"
          sx={{
            bgcolor:
              methodColors[params.value as FileMethod] ??
              theme.palette.grey[600],
            color: theme.palette.common.white,
            fontSize: theme.custom.font.size.sm,
            fontWeight: theme.custom.font.weight.bold,
            height: 24,
            whiteSpace: "nowrap",
          }}
        />
      ),
      filterable: true,
      type: "string",
    },
    {
      field: "updatedAt",
      headerName: "Updated",
      width: 160,
      type: "date",
      valueGetter: (params: any) => {
        const iso = (params.row?.updatedAt as string) || ""
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
          {formatRelativeTime(params.row?.updatedAt)}
        </span>
      ),
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 80,
      sortable: false,
      renderCell: (params) => (
        <IconButton size="small" onClick={(e) => openMenu(e, params.row.id)}>
          <MoreVertIcon fontSize="small" />
        </IconButton>
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
        heading="Project View"
        headingSize="h5"
        headingWeight={theme.custom.font.weight.regular}
        subheading="View project files"
        headingStyle={{ padding: "1rem 0 0 1rem" }}
        subheadingStyle={{ paddingLeft: "1rem" }}
        padding={0}
      />

      {/* Files grid fills remaining space (no overflow) */}
      <Box
        sx={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}
      >
        <Box sx={{ flex: 1, minHeight: 0 }}>
          <DataGrid
            rows={files}
            columns={columns}
            getRowId={(r) => r.id}
            disableRowSelectionOnClick
            pageSizeOptions={[10, 25]}
            initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
            slots={{ toolbar: GridToolbar }}
            showToolbar
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
                border: 'none', 
                backgroundColor: theme.palette.background.paper,
                boxShadow: "none",
              },
              /* the TablePagination root + toolbar */
              "& .MuiTablePagination-root": { minHeight: 36, height: 36 },
              "& .MuiTablePagination-toolbar": {
                border: 'none', 
                backgroundColor: theme.palette.background.paper,
                boxShadow: "none",
                minHeight: 36,
                height: 36,
                p: 0,
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

        {/* Row menu */}
        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={closeMenu}>
          <MenuItem onClick={closeMenu}>Preview</MenuItem>
          <MenuItem onClick={closeMenu}>Share</MenuItem>
          <MenuItem onClick={closeMenu}>Delete</MenuItem>
        </Menu>

        {/* Bottom actions */}
        <Stack
          direction="row"
          justifyContent="flex-end"
          spacing={1}
          sx={{
            mt: theme.custom.spacing.xs,
            p: theme.custom.spacing.xs,
            borderTop: `1px solid ${theme.palette.divider}`,
            backgroundColor: theme.palette.background.paper,
            flexShrink: 0,
          }}
        >
          <Button
            variant="contained"
            size="small"
            onClick={onProjectView}
            sx={(t: Theme) => ({
              color: t.palette.getContrastText(t.palette.accent1.vibrant),
              borderRadius: t.custom?.radii?.xs,
              fontSize: t.custom.font.size.sm,
              backgroundColor: t.palette.accent1.vibrant,
              "&:hover": { backgroundColor: t.palette.accent1.dim },
            })}
          >
            View Project
          </Button>
          <Button
            variant="outlined"
            size="small"
            onClick={onOpenSettings}
            sx={(t: Theme) => ({
              borderRadius: t.custom?.radii?.xs,
              fontSize: t.custom.font.size.sm,
              color: t.palette.accent1.vibrant,
              borderColor: t.palette.accent1.vibrant,
              "&:hover": { backgroundColor: t.palette.accent1.dim },
            })}
          >
            Settings
          </Button>
        </Stack>
      </Box>
    </SStack>
  )
}

export default ProjectView
