import React, { useState } from "react"
import Card from "@mui/material/Card"
import CardContent from "@mui/material/CardContent"
import Chip from "@mui/material/Chip"
import IconButton from "@mui/material/IconButton"
import Menu from "@mui/material/Menu"
import MenuItem from "@mui/material/MenuItem"
import { useTheme } from "@mui/material/styles"
import { DataGrid, type GridColDef } from "@mui/x-data-grid"
import { SStack } from "../../styled/SStack"
import MoreVertIcon from "@mui/icons-material/MoreVert"
import { formatRelativeTime } from "../../../utility/formatter/timeHelper"

export type DatasetFileRow = {
  id: string
  name: string
  type?: string
  tags: string[]
  sizeBytes?: number
  uploadedAt?: string
  status?: string
}

type DatasetFileListProps = {
  files: DatasetFileRow[]
}

const formatBytes = (size?: number) => {
  if (!size) return "--"
  if (size >= 1_000_000_000) return `${(size / 1_000_000_000).toFixed(1)} GB`
  if (size >= 1_000_000) return `${(size / 1_000_000).toFixed(1)} MB`
  if (size >= 1_000) return `${(size / 1_000).toFixed(1)} KB`
  return `${size} B`
}

const formatTypeLabel = (value?: string) => {
  if (!value) return "--"
  if (value.includes("/")) {
    const [group, subtype] = value.split("/")
    if (subtype) return subtype.toUpperCase()
    return group.toUpperCase()
  }
  return value.toUpperCase()
}

const DatasetFileList = ({ files }: DatasetFileListProps) => {
  const theme = useTheme()
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
    IMAGES: theme.palette.colors.orange[500],
    PNG: theme.palette.colors.orange[500],
    JPG: theme.palette.colors.orange[500],
    JPEG: theme.palette.colors.orange[500],
    PDF: theme.palette.colors.red[500],
    MP4: theme.palette.colors.red[500],
    MP3: theme.palette.colors.purple[500],
  }

  const columns: GridColDef<DatasetFileRow>[] = [
    {
      field: "name",
      headerName: "Name",
      flex: 1,
      minWidth: 200,
    },
    {
      field: "type",
      headerName: "Type",
      width: 140,
      renderCell: (params) => {
        const label = formatTypeLabel(params.value)
        return (
          <Chip
            label={label}
            size="small"
            sx={{
              backgroundColor: chipColors[label] || theme.palette.grey[300],
              color: theme.palette.primary.light,
              fontSize: theme.custom.font.size.sm,
              fontWeight: theme.custom.font.weight.bold,
              height: 28,
            }}
          />
        )
      },
    },
    {
      field: "tags",
      headerName: "Tags",
      width: 200,
      sortable: false,
      renderCell: (params) => {
        const tags = params.value as string[]
        if (!tags?.length) return "--"
        return (
          <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
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
          </div>
        )
      },
    },
    {
      field: "sizeBytes",
      headerName: "Size",
      width: 120,
      renderCell: (params) => formatBytes(params.value as number | undefined),
    },
    {
      field: "uploadedAt",
      headerName: "Uploaded",
      width: 150,
      renderCell: (params) =>
        params.value ? formatRelativeTime(params.value as string) : "--",
    },
    {
      field: "status",
      headerName: "Status",
      width: 120,
      renderCell: (params) => params.value ?? "--",
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 70,
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
      bgColor="transparent"
      noShadow
      noBorder
      sx={{ flex: 6, flexShrink: 0 }}
    >
      <Card
        sx={{
          borderRadius: theme.custom?.radii?.xs,
          display: "flex",
          flexDirection: "column",
          height: "100%",
          boxShadow: "none",
          border: "none",
          backgroundColor: theme.palette.background.paper,
        }}
      >
        <CardContent
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            boxShadow: "none",
            border: "none",
            backgroundColor: theme.palette.background.paper,
          }}
        >
          <div style={{ flex: 1, marginTop: theme.custom.spacing.xs }}>
            <DataGrid
              rows={files}
              columns={columns}
              pageSizeOptions={[5, 10]}
              initialState={{
                pagination: { paginationModel: { pageSize: 5 } },
              }}
              disableRowSelectionOnClick
              getRowId={(row) => row.id}
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
          </div>
        </CardContent>
      </Card>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleMenuClose}>View</MenuItem>
        <MenuItem onClick={handleMenuClose}>Remove from dataset</MenuItem>
      </Menu>
    </SStack>
  )
}

export default DatasetFileList
