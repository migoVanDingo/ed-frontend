// DatasetFilesPicker.tsx
import React, { useMemo, useState, useEffect } from "react"
import { DataGrid, type GridColDef, type GridRowSelectionModel } from "@mui/x-data-grid"
import {
  Box,
  Stack,
  TextField,
  InputAdornment,
  Chip,
} from "@mui/material"
import { useTheme } from "@mui/material/styles"
import SearchIcon from "@mui/icons-material/Search"
import HeadingBlock from "../../common/HeadingBlock"
import { SStack } from "../../styled/SStack"

type FileItem = {
  id: string
  fileId?: string
  name: string
  sizeBytes?: number
  type?: string
  uploadedAt?: string
  tags?: string[]
}

type LoaderFileItem = {
  id: string
  filename: string
  contentType?: string | null
  size?: number | null
  created_at?: number | string | null
  tags?: string[] | null
}

type InitialFilesPage =
  | LoaderFileItem[]
  | {
      items: LoaderFileItem[]
      totalCount?: number
      limit?: number
      offset?: number
    }

type DatasetFilesPickerProps = {
  initialFiles?: InitialFilesPage
  onSelectionChange?: (selectedFileIds: string[]) => void
}

const toIsoString = (
  value: number | string | null | undefined
): string | undefined => {
  if (value == null) return undefined
  if (typeof value === "number") return new Date(value * 1000).toISOString()
  const parsed = Date.parse(value)
  if (Number.isNaN(parsed)) return undefined
  return new Date(parsed).toISOString()
}

const normalizeInitialFiles = (initialFiles?: InitialFilesPage): FileItem[] => {
  if (!initialFiles) return []
  const items = Array.isArray(initialFiles) ? initialFiles : initialFiles.items

  return items.map((file) => ({
    id: file.id,
    fileId: file.id,
    name: file.filename || file.id,
    sizeBytes: file.size ?? undefined,
    type: file.contentType ?? undefined,
    uploadedAt: toIsoString(file.created_at),
    tags: file.tags ?? [],
  }))
}

const DatasetFilesPicker = ({
  initialFiles,
  onSelectionChange,
}: DatasetFilesPickerProps) => {
  const theme = useTheme()

  const [files, setFiles] = useState<FileItem[]>(
    normalizeInitialFiles(initialFiles)
  )

  const emptySelection = (): GridRowSelectionModel => ({
    type: "include",
    ids: new Set(),
  })
  const [selection, setSelection] = useState<GridRowSelectionModel>(
    emptySelection
  )

  useEffect(() => {
    setFiles(normalizeInitialFiles(initialFiles))
  }, [initialFiles])

  const handleSelectionChange = (model: GridRowSelectionModel) => {
    setSelection(model)
    if (!onSelectionChange) return
    const ids = Array.isArray(model) ? model : Array.from(model.ids)
    onSelectionChange(ids.map(String))
  }

  const chipColors: Record<string, string> = {
    CSV: theme.palette.colors.blue[500],
    JSON: theme.palette.colors.green[500],
    Images: theme.palette.colors.orange[500],
    MP4: theme.palette.colors.red[500],
    MP3: theme.palette.colors.purple[500],
    PDF: theme.palette.colors.red[500],
  }

  const columns: GridColDef<FileItem>[] = useMemo(
    () => [
      { field: "name", headerName: "Name", flex: 1, minWidth: 180 },
      {
        field: "tags",
        headerName: "Tags",
        flex: 1,
        minWidth: 200,
        sortable: false,
        renderCell: (params) => {
          const tags = params.row.tags ?? []
          if (!tags.length) return "—"
          return (
            <Stack direction="row" spacing={0.5} sx={{ flexWrap: "wrap" }}>
              {tags.map((tag) => (
                <Chip
                  key={`${params.row.id}-${tag}`}
                  label={tag}
                  size="small"
                  sx={{
                    borderRadius: 999,
                    fontSize: theme.custom.font.size.sm,
                    backgroundColor: theme.palette.accent1.dim,
                  }}
                />
              ))}
            </Stack>
          )
        },
      },
      {
        field: "sizeBytes",
        headerName: "Size",
        width: 120,
        renderCell: (params) => {
          const size = params.row.sizeBytes
          if (!size) return "—"
          if (size >= 1_000_000) return `${(size / 1_000_000).toFixed(1)} MB`
          if (size >= 1_000) return `${(size / 1_000).toFixed(1)} KB`
          return `${size} B`
        },
      },
      {
        field: "type",
        headerName: "File Type",
        width: 160,
        renderCell: (params) => {
          const type = params.row.type
          if (!type) return "—"
          return (
            <Chip
              label={type}
              size="small"
              sx={{
                backgroundColor: chipColors[type] || theme.palette.grey[400],
                color: theme.palette.primary.light,
                fontSize: theme.custom.font.size.sm,
                fontWeight: theme.custom.font.weight.bold,
                height: 26,
              }}
            />
          )
        },
      },
    ],
    [chipColors, theme]
  )

  const NoRowsOverlay = () => (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: theme.palette.text.secondary,
        fontSize: theme.custom.font.size.sm,
        p: 2,
      }}
    >
      No files yet. Upload files to your datastore to get started.
    </Box>
  )

  return (
    <SStack
      direction="column"
      spacing={2}
      radius="lg"
      bgColor={theme.palette.background.default}
      height="100%"
      sx={{ flexGrow: 1, width: "100%", minHeight: 0 }}
    >
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ px: theme.custom.spacing.xs, pt: theme.custom.spacing.xs }}
      >
        <HeadingBlock
          heading="Dataset Files"
          headingSize="h5"
          headingWeight={theme.custom.font.weight.regular}
          subheading="Files currently included in this dataset."
          padding={0}
        />
        <TextField
          placeholder="Search files..."
          size="small"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
          sx={{ width: { xs: "100%", sm: 280 } }}
        />
      </Stack>

      <Box sx={{ flex: 1, minHeight: 0 }}>
        <DataGrid
          rows={files}
          columns={columns}
          pageSizeOptions={[5, 10]}
          initialState={{ pagination: { paginationModel: { pageSize: 5 } } }}
          checkboxSelection
          disableRowSelectionOnClick
          rowSelectionModel={selection}
          onRowSelectionModelChange={handleSelectionChange}
          slots={{ noRowsOverlay: NoRowsOverlay }}
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
          }}
        />
      </Box>
    </SStack>
  )
}

export default DatasetFilesPicker
