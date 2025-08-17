import React, { useState } from "react"
import { DataGrid, type GridColDef } from "@mui/x-data-grid"
import {
  Box,
  Button,
  Stack,
  IconButton,
  Menu,
  MenuItem,
  Chip,
} from "@mui/material"
import { useTheme, type Theme } from "@mui/material/styles"
import MoreVertIcon from "@mui/icons-material/MoreVert"
import HeadingBlock from "../../../common/HeadingBlock"
import { formatRelativeTime } from "../../../../utility/formatter/timeHelper"
import { SStack } from "../../../styled/SStack"

interface FileItem {
  id: string
  name: string
  directory: string   // ✅ new field
  size: number
  type: string
  uploadedAt: string | Date
}

const mockFiles: FileItem[] = [
  {
    id: "1",
    name: "data.csv",
    directory: "/datasets/raw",  // ✅ added
    size: 1250000,
    type: "CSV",
    uploadedAt: "2025-08-10T14:22:00Z",
  },
  {
    id: "2",
    name: "annotations.json",
    directory: "/datasets/annotations", // ✅ added
    size: 258000,
    type: "JSON",
    uploadedAt: "2025-08-01T14:22:00Z",
  },
  {
    id: "3",
    name: "video.mp4",
    directory: "/datasets/media", // ✅ added
    size: 50250000,
    type: "MP4",
    uploadedAt: "2025-08-15T10:00:00Z",
  },
]



const FileExplorerWidget = () => {
  const theme = useTheme()

  // menu state
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [menuRowId, setMenuRowId] = useState<string | null>(null)

  const handleMenuOpen = (
    event: React.MouseEvent<HTMLElement>,
    rowId: string
  ) => {
    setAnchorEl(event.currentTarget)
    setMenuRowId(rowId)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
    setMenuRowId(null)
  }

  const chipColors: Record<string, string> = {
    CSV: theme.palette.colors.blue[500],
    JSON: theme.palette.colors.green[500],
    Images: theme.palette.colors.orange[500],
    MP4: theme.palette.colors.red[500],
    MP3: theme.palette.colors.purple[500],
  }

  const columns: GridColDef<FileItem>[] = [
  {
    field: "name",
    headerName: "Name",
    flex: 1,
    minWidth: 180,
  },
  {
    field: "directory",   // ✅ new column
    headerName: "Directory",
    flex: 1,

    renderCell: (params) => (
      <span
        style={{
          fontSize: theme.custom.font.size.sm,
          color: theme.palette.text.secondary,
        }}
      >
        {params.value}
      </span>
    ),
  },
  {
    field: "size",
    headerName: "Size",
    width: 120,
    renderCell: (params) => {
      const size = params.row.size
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
  {
    field: "uploadedAt",
    headerName: "Uploaded",
    width: 160,
    renderCell: (params) => (
      <span
        style={{
          fontSize: theme.custom.font.size.sm,
          color: theme.palette.text.secondary,
        }}
      >
        {formatRelativeTime(params.value)}
      </span>
    ),
  },
  {
    field: "actions",
    headerName: "Actions",
    width: 80,
    sortable: false,
    renderCell: (params) => (
      <IconButton
        size="small"
        onClick={(e) => handleMenuOpen(e, params.row.id)}
      >
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
      bgColor={["transparent"]}
      padding="sm"
      sx={{
        flexGrow: 1,
        width: "100%",
        minHeight: 0,
      }}
    >
      {/* Heading + Buttons */}
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ px: theme.custom.spacing.sm, pt: theme.custom.spacing.sm }}
      >
        <HeadingBlock
          heading="Files"
          headingSize="h5"
          headingWeight={theme.custom.font.weight.regular}
          subheading="Quick file management. View file explorer for more options."
          padding={0}
        />

        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            size="small"
            sx={(theme: Theme) => ({
              borderRadius: theme.custom?.radii?.xs,
              fontSize: theme.custom.font.size.sm,
              color: theme.palette.accent1.vibrant,
              borderColor: theme.palette.accent1.vibrant,
              "&:hover": { backgroundColor: theme.palette.accent1.dim },
              width: 150,
            })}
          >
            File Explorer
          </Button>
          <Button
            variant="contained"
            size="small"
            sx={(theme: Theme) => ({
              color: theme.palette.getContrastText(
                theme.palette.accent1.vibrant
              ),
              borderRadius: theme.custom?.radii?.xs,
              fontSize: theme.custom.font.size.sm,
              backgroundColor: theme.palette.accent1.vibrant,
              "&:hover": { backgroundColor: theme.palette.accent1.dim },
              width: 150,
            })}
          >
            Upload Files
          </Button>
        </Stack>
      </Stack>

      {/* DataGrid */}
      <Box sx={{ flex: 1, minHeight: 0 }}>
        <DataGrid
          rows={mockFiles}
          columns={columns}
          pageSizeOptions={[5, 10]}
          initialState={{
            pagination: { paginationModel: { pageSize: 5 } },
          }}
          disableRowSelectionOnClick
          sx={{
            border: "none",
            boxShadow: "none",
            backgroundColor: "transparent",
            "& .MuiDataGrid-main": {
              backgroundColor: "transparent",
            },
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

      {/* Row Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleMenuClose}>Preview File</MenuItem>
        <MenuItem onClick={handleMenuClose}>Delete File</MenuItem>
        <MenuItem onClick={handleMenuClose}>Share File</MenuItem>
      </Menu>
    </SStack>
  )
}

export default FileExplorerWidget
