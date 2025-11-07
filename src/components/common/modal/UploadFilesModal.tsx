import React, { useCallback, useMemo, useState } from "react";
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Stack,
  Tooltip,
  Typography,
  useTheme,
  alpha,
  TextField,
  Autocomplete,
  LinearProgress,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import CloseIcon from "@mui/icons-material/Close";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import { useDropzone, type DropzoneOptions } from "react-dropzone";

/**
 * UploadFilesModal
 * - MUI Dialog with a drag-and-drop zone (react-dropzone)
 * - Shows dropped files as a list with remove buttons
 * - Optional tags input (MUI Autocomplete freeSolo)
 * - Cancel / Upload actions
 *
 * Props
 * - open: boolean
 * - onClose: () => void
 * - onUpload?: (args: { files: File[]; tags: string[] }) => Promise<void> | void
 * - title?: string (default: "Upload files")
 * - accept?: Dropzone Accept (e.g., { 'image/*': [] })
 * - maxFiles?: number
 * - maxSize?: number (bytes)
 * - showTags?: boolean (default: true)
 * - initialTags?: string[]
 * - helperText?: string
 */

type Accept = DropzoneOptions["accept"];

export type UploadFilesModalProps = {
  open: boolean;
  onClose: () => void;
  onUpload?: (args: { files: File[]; tags: string[] }) => Promise<void> | void;
  title?: string;
  accept?: Accept;
  maxFiles?: number;
  maxSize?: number;
  showTags?: boolean;
  initialTags?: string[];
  helperText?: string;
};

const DropArea = styled(Box)(({ theme }) => ({
  border: `2px dashed ${alpha(theme.palette.text.primary, 0.25)}`,
  borderRadius: theme.custom.radii.md,
  padding: theme.spacing(5),
  textAlign: "center",
  cursor: "pointer",
  transition: "border-color 120ms ease, background-color 120ms ease",
}));

function formatBytes(bytes: number) {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

export default function UploadFilesModal({
  open,
  onClose,
  onUpload,
  title = "Upload files",
  accept,
  maxFiles,
  maxSize,
  showTags = true,
  initialTags = [],
  helperText,
}: UploadFilesModalProps) {
  const theme = useTheme();
  const [files, setFiles] = useState<File[]>([]);
  const [tags, setTags] = useState<string[]>(initialTags);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[], fileRejections: any[]) => {
      setError(null);

      // Gather rejection reasons nicely
      if (fileRejections?.length) {
        const first = fileRejections[0];
        const reasons = first?.errors?.map((e: any) => e.message).join(", ");
        setError(reasons || "One or more files were rejected.");
      }

      setFiles((prev) => {
        const next = [...prev, ...acceptedFiles];
        // Ensure uniqueness by name+size+lastModified to reduce accidental dupes
        const deduped = Array.from(
          new Map(next.map((f) => [`${f.name}-${f.size}-${f.lastModified}` as const, f])).values()
        );
        return deduped;
      });
    },
    []
  );

  const { getRootProps, getInputProps, isDragActive, isDragReject, isFocused } = useDropzone({
    onDrop,
    multiple: true,
    accept,
    maxFiles,
    maxSize,
  });

  const borderColor = useMemo(() => {
    if (isDragReject) return theme.palette.error.main;
    if (isDragActive || isFocused) return theme.palette.primary.main;
    return alpha(theme.palette.text.primary, 0.25);
  }, [isDragActive, isFocused, isDragReject, theme.palette.error.main, theme.palette.primary.main, theme.palette.text.primary]);

  const removeFile = (fileToRemove: File) => {
    setFiles((prev) => prev.filter((f) => f !== fileToRemove));
  };

  const handleUpload = async () => {
    if (!files.length) return;
    setIsUploading(true);
    setError(null);
    try {
      const response = await onUpload?.({ files, tags });

      console.log('response from onUpload:', response);
      setFiles([]);
      setTags(initialTags);
      onClose();
    } catch (e: any) {
      setError(e?.message || "Upload failed. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const canUpload = files.length > 0 && !isUploading;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" aria-labelledby="upload-dialog-title">
      <DialogTitle id="upload-dialog-title">
        <Stack direction="row" alignItems="center" justifyContent="space-between" gap={1}>
          <Typography variant="h6">{title}</Typography>
          <IconButton aria-label="close" onClick={onClose} size="small">
            <CloseIcon fontSize="small" />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent dividers>
        <Stack spacing={2}>
          <Box {...getRootProps()} sx={{ outline: "none" }}>
            <input {...getInputProps()} />
            <DropArea sx={{ borderColor, backgroundColor: isDragActive ? alpha(theme.palette.primary.main, 0.04) : "transparent" }}>
              <Stack alignItems="center" spacing={1}>
                <CloudUploadIcon fontSize="medium" />
                <Typography variant="subtitle1" fontWeight={600}>
                  {isDragActive ? "Drop files to upload" : "Drag & drop files here"}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  or click to browse
                </Typography>
                {helperText && (
                  <Typography variant="caption" color="text.secondary">
                    {helperText}
                  </Typography>
                )}
              </Stack>
            </DropArea>
          </Box>

          {!!error && (
            <Typography variant="body2" color="error">
              {error}
            </Typography>
          )}

          {files.length > 0 && (
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                Files ({files.length})
              </Typography>
              <List dense sx={{ width: "100%", bgcolor: "background.paper", borderRadius: 2 }}>
                {files.map((file) => (
                  <ListItem key={`${file.name}-${file.size}-${file.lastModified}`} secondaryAction={
                    <Tooltip title="Remove">
                      <IconButton edge="end" aria-label={`remove ${file.name}`} onClick={() => removeFile(file)}>
                        <DeleteOutlineIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  }>
                    <ListItemText
                      primary={
                        <Stack direction="row" spacing={1} alignItems="center">
                          {file.type === 'application/pdf' ? (
                          <PictureAsPdfIcon fontSize="small" />
                          ) : (
                          <InsertDriveFileIcon fontSize="small" />
                          )}
                          <Typography variant="body2" noWrap title={file.name}>
                            {file.name}
                          </Typography>
                        </Stack>
                      }
                      secondary={
                        <Typography variant="caption" color="text.secondary">
                          {formatBytes(file.size)}
                        </Typography>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          )}

          {showTags && (
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                Tags (optional)
              </Typography>
              <Autocomplete
                multiple
                freeSolo
                value={tags}
                onChange={(_, newValue) => setTags(newValue as string[])}
                options={[]}
                renderTags={(value: readonly string[], getTagProps) =>
                  value.map((option: string, index: number) => (
                    <Chip variant="filled" label={option} {...getTagProps({ index })} key={`option-${index}`}/>
                  ))
                }
                renderInput={(params) => <TextField {...params} placeholder="Add tags and press Enter" />}
              />
            </Box>
          )}

          {isUploading && <LinearProgress />}
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={isUploading} variant="text">
          Cancel
        </Button>
        <Button onClick={handleUpload} disabled={!canUpload} variant="contained" startIcon={<CloudUploadIcon fontSize="small" />}>
          Upload
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// USAGE EXAMPLE
// <UploadFilesModal
//   open={open}
//   onClose={() => setOpen(false)}
//   onUpload={async ({ files, tags }) => {
//     const formData = new FormData();
//     files.forEach((f) => formData.append("files", f));
//     tags.forEach((t) => formData.append("tags", t));
//     await fetch("/api/upload", { method: "POST", body: formData });
//   }}
//   accept={{ "image/*": [], "application/pdf": [] }}
//   maxFiles={10}
//   maxSize={10 * 1024 * 1024} // 10MB per file
//   helperText="Max 10 files, 10MB each"
// />
