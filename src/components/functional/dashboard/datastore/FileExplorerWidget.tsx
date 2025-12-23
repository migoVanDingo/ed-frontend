// FileExplorerWidget.tsx
import React, { useMemo, useState, useEffect } from "react"
import { DataGrid, type GridColDef } from "@mui/x-data-grid"
import {
  Box,
  Button,
  Stack,
  IconButton,
  Menu,
  MenuItem,
  Chip,
  Snackbar,
  Alert,
} from "@mui/material"
import { useTheme, type Theme } from "@mui/material/styles"
import MoreVertIcon from "@mui/icons-material/MoreVert"
import CloudUploadIcon from "@mui/icons-material/CloudUpload"
import CircularProgress from "@mui/material/CircularProgress"
import HeadingBlock from "../../../common/HeadingBlock"
import { formatRelativeTime } from "../../../../utility/formatter/timeHelper"
import { SStack } from "../../../styled/SStack"
import { uploadFilesToDatastore } from "../../../../utility/upload/uploadFilesToDatastore"
import UploadFilesModal from "../../modals/UploadFilesModal"
import type { DashboardLoaderData } from "../../../../types/dashboard"
import { useRouteLoaderData } from "react-router-dom"
import { useAppSelector } from "../../../../hooks/reduxHook"
import { useSubscription } from "@apollo/client"
import { FILE_STATUS_UPDATED_SUBSCRIPTION } from "../../../../graphql/subscriptions/fileStatusUpdate"
import type {
  UploadResultFile,
  UploadResult,
} from "../../../../utility/upload/uploadFilesToDatastore"

type FileStatus =
  | "uploading"
  | "pending_upload"
  | "processing"
  | "ready"
  | "failed"

interface FileItem {
  id: string // this should be FILE id once we have it
  fileId?: string // redundant but can keep
  name: string
  directory?: string
  sizeBytes?: number
  type?: string
  uploadedAt?: string
  status: FileStatus
  uploadProgress?: number // 0–100, only meaningful while uploading
}

type LoaderFileItem = {
  id: string
  filename: string
  contentType?: string | null
  size?: number | null
  created_at?: number | string | null
  status?: FileStatus
}

type InitialFilesPage =
  | LoaderFileItem[]
  | {
      items: LoaderFileItem[]
      totalCount?: number
      limit?: number
      offset?: number
    }

const toIsoString = (value: number | string | null | undefined): string | undefined => {
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
    status: file.status ?? "ready",
  }))
}

const FileExplorerWidget = ({ initialFiles }: { initialFiles?: InitialFilesPage }) => {
  const theme = useTheme()

  const data = useRouteLoaderData("dashboard-layout") as
    | DashboardLoaderData
    | undefined
  const currentDatastoreId = useAppSelector(
    (state) => state.workspace.currentDatastoreId
  )

  console.log('data: ', data)

  const datastores = data?.datastores ?? []

  const selectedDatastore =
    datastores.find((d) => d.id === currentDatastoreId) ?? datastores[0]

  const datastoreIdForUpload = selectedDatastore?.id

  // ──────────────────────────────────────
  // Local state for files in this view
  // ──────────────────────────────────────
  const [files, setFiles] = useState<FileItem[]>(
    normalizeInitialFiles(initialFiles)
  )

  // menu state
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [menuRowId, setMenuRowId] = useState<string | null>(null)

  // upload modal state
  const [openUpload, setOpenUpload] = useState(false)

  // snackbar state
  const [snackbarOpen, setSnackbarOpen] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState("")

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

  const handleOpenUpload = () => setOpenUpload(true)
  const handleCloseUpload = () => setOpenUpload(false)

  const handleSnackbarClose = (
    _event?: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    if (reason === "clickaway") return
    setSnackbarOpen(false)
  }

  // ──────────────────────────────────────
  // Subscription: fileStatusUpdated
  // ──────────────────────────────────────

  // For now, we can subscribe per-datastore and ignore uploadSession filter.
  const { data: subData, error: subError } = useSubscription(
    FILE_STATUS_UPDATED_SUBSCRIPTION,
    {
      skip: !datastoreIdForUpload,
      variables: {
        datastoreId: datastoreIdForUpload ?? "",
        uploadSessionId: null,
      },
    }
  )
  useEffect(() => {
    if (!subData?.fileStatusUpdated) return
    const evt = subData.fileStatusUpdated

    setFiles((prev) => {
      let found = false
      const next = prev.map((f) => {
        if (f.id === evt.fileId) {
          found = true
          return {
            ...f,
            status: evt.newStatus as FileStatus,
            uploadProgress:
              evt.newStatus === "ready" || evt.newStatus === "failed"
                ? 100
                : f.uploadProgress,
            uploadedAt: evt.occurredAt ?? f.uploadedAt,
          }
        }
        return f
      })

      if (!found) {
        next.push({
          id: evt.fileId,
          name: evt.fileId,
          status: evt.newStatus as FileStatus,
          uploadedAt: evt.occurredAt,
        })
      }

      return next
    })
  }, [subData])

  useEffect(() => {
    setFiles(normalizeInitialFiles(initialFiles))
  }, [initialFiles])

  if (subError) {
    console.error("fileStatusUpdated subscription error", subError)
  }

  // ──────────────────────────────────────
  // Upload handler
  // ──────────────────────────────────────
  const handleUpload = async ({
    files: selectedFiles,
    tags,
  }: {
    files: File[]
    tags: string[]
  }) => {
    if (!datastoreIdForUpload) {
      console.warn("No datastore selected for upload")
      return
    }

    // 1) Call backend to open upload session + get real file IDs.
    //    Modal stays open while this promise is pending.
    const result: UploadResult = await uploadFilesToDatastore({
      datastoreId: datastoreIdForUpload,
      files: selectedFiles,
      tags,
      onFileProgress: ({ fileId, percent, bytesSent, total }) => {
        // 3) Update progress for the row keyed by fileId
        setFiles((prev) =>
          prev.map((row) =>
            row.id === fileId
              ? { ...row, uploadProgress: percent, status: "uploading" }
              : row
          )
        )

        console.debug(
          `[upload:${fileId}] ${bytesSent}/${total ?? 0} bytes (${percent}%)`
        )
      },
    })

    const uploadedFiles: UploadResultFile[] = result?.files ?? []

    // 2) Once we have file IDs, create rows in the grid (status=uploading, progress 0)
    if (uploadedFiles.length) {
      const newRows: FileItem[] = uploadedFiles.map(
        ({ fileId, filename, sizeBytes }) => ({
          id: fileId,
          fileId,
          name: filename || fileId,
          sizeBytes,
          status: "uploading",
          uploadProgress: 0,
          uploadedAt: new Date().toISOString(),
        })
      )

      setFiles((prev) => [...newRows, ...prev])
    }

    // IMPORTANT: do NOT close the modal from here.
    // UploadFilesModal will call onClose() after onUpload resolves.
    setSnackbarMessage(
      "Your files are being uploaded. You can track progress here."
    )
    setSnackbarOpen(true)

    return result.rawResponse
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
        field: "status",
        headerName: "Status",
        width: 160,
        renderCell: (params) => {
          const status = params.row.status
          const progress = params.row.uploadProgress
          const labelMap: Record<FileStatus, string> = {
            uploading:
              progress != null ? `Uploading ${progress}%` : "Uploading",
            pending_upload: "Pending upload",
            processing: "Processing",
            ready: "Ready",
            failed: "Failed",
          }

          const colorMap: Partial<Record<FileStatus, string>> = {
            ready: theme.palette.success.main,
            failed: theme.palette.error.main,
          }

          return (
            <Stack direction="row" alignItems="center" spacing={1}>
              {(status === "uploading" || status === "processing") && (
                <CircularProgress size={16} />
              )}
              <span
                style={{
                  fontSize: theme.custom.font.size.sm,
                  color: colorMap[status] ?? theme.palette.text.secondary,
                }}
              >
                {labelMap[status] ?? status}
              </span>
            </Stack>
          )
        },
      },
      {
        field: "directory",
        headerName: "Directory",
        flex: 1,
        renderCell: (params) => (
          <span
            style={{
              fontSize: theme.custom.font.size.sm,
              color: theme.palette.text.secondary,
            }}
          >
            {params.value || "—"}
          </span>
        ),
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
      {
        field: "uploadedAt",
        headerName: "Uploaded",
        width: 160,
        renderCell: (params) => {
          if (!params.value) return "—"
          return (
            <span
              style={{
                fontSize: theme.custom.font.size.sm,
                color: theme.palette.text.secondary,
              }}
            >
              {formatRelativeTime(params.value)}
            </span>
          )
        },
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
    ],
    [chipColors, theme, handleMenuOpen]
  )

  // Custom empty state
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
      {/* Heading + Buttons */}
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ px: theme.custom.spacing.xs, pt: theme.custom.spacing.xs }}
      >
        <HeadingBlock
          heading="Datastore Dashboard"
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
            onClick={handleOpenUpload}
            startIcon={<CloudUploadIcon fontSize="small" />}
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

      <Box sx={{ flex: 1, minHeight: 0 }}>
        <DataGrid
          rows={files}
          columns={columns}
          pageSizeOptions={[5, 10]}
          initialState={{ pagination: { paginationModel: { pageSize: 5 } } }}
          disableRowSelectionOnClick
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

      {/* Upload Modal */}
      <UploadFilesModal
        open={openUpload}
        onClose={handleCloseUpload}
        onUpload={handleUpload}
        title="Upload files"
        accept={{
          "image/*": [],
          "video/*": [],
          "text/csv": [],
          "application/json": [],
          "application/pdf": [],
        }}
        maxFiles={20}
        maxSize={5 * 1024 * 1024 * 1024} // 5GB each
        helperText="Drag & drop or click to browse. Up to 20 files."
        showTags
      />

      {/* Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity="info"
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </SStack>
  )
}

export default FileExplorerWidget
