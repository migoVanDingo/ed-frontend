import React from "react"
import {
  Box,
  Button,
  Chip,
  Divider,
  Popover,
  Stack,
  TextField,
  Typography,
} from "@mui/material"
import { useTheme } from "@mui/material/styles"
import type {
  AnnotationRect,
  LabelMeta,
  NoteEntry,
} from "../../../types/labeler/labelerTypes"

type LabelerDetailsPanelProps = {
  activeLabelName: string | null
  activeMeta?: LabelMeta
  labelNameDraft: string
  onLabelNameDraftChange: (value: string) => void
  onUpdateLabelName: () => void
  isColorPickerOpen: boolean
  colorAnchorEl: HTMLElement | null
  onColorPickerOpen: (event: React.MouseEvent<HTMLElement>) => void
  onColorPickerClose: () => void
  onColorChange: (value: string) => void
  newTag: string
  onNewTagChange: (value: string) => void
  onAddTag: () => void
  noteDraft: string
  onNoteDraftChange: (value: string) => void
  onAddNote: () => void
  selectedAnnotationId: string | null
  activeNotes: NoteEntry[]
  annotations: AnnotationRect[]
  onToggleAnnotation: (id: string) => void
  onDeleteAnnotation: (id: string) => void
  isAnnotationActive: (rect: AnnotationRect) => boolean
  onCommit: () => void
  isCommitDisabled: boolean
  isSavingDraft: boolean
  isAutosaving: boolean
  draftSource: "draft" | "committed" | null
  saveError: string | null
  saveSuccess: string | null
  accentButtonSx: Record<string, unknown>
}

const LabelerDetailsPanel = ({
  activeLabelName,
  activeMeta,
  labelNameDraft,
  onLabelNameDraftChange,
  onUpdateLabelName,
  isColorPickerOpen,
  colorAnchorEl,
  onColorPickerOpen,
  onColorPickerClose,
  onColorChange,
  newTag,
  onNewTagChange,
  onAddTag,
  noteDraft,
  onNoteDraftChange,
  onAddNote,
  selectedAnnotationId,
  activeNotes,
  annotations,
  onToggleAnnotation,
  onDeleteAnnotation,
  isAnnotationActive,
  onCommit,
  isCommitDisabled,
  isSavingDraft,
  isAutosaving,
  draftSource,
  saveError,
  saveSuccess,
  accentButtonSx,
}: LabelerDetailsPanelProps) => {
  const theme = useTheme()

  return (
    <Box
      sx={{
        borderLeft: `1px solid ${theme.palette.divider}`,
        display: "flex",
        flexDirection: "column",
        minHeight: 0,
        px: 2,
        py: 2,
      }}
    >
      <Typography
        variant="subtitle1"
        sx={{ fontWeight: theme.custom.font.weight.medium, mb: 1 }}
      >
        Label Details
      </Typography>
      <Box sx={{ overflow: "auto", minHeight: 0, flex: 1, pr: 0.5 }}>
        <Stack spacing={2}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography
              variant="subtitle2"
              sx={{ fontWeight: theme.custom.font.weight.medium }}
            >
              Active Label:
            </Typography>
            <Box
              sx={{
                width: 12,
                height: 12,
                borderRadius: "50%",
                backgroundColor: activeMeta?.color ?? theme.palette.divider,
              }}
            />
            <Typography variant="body2">
              {activeLabelName ?? "None"}
            </Typography>
          </Stack>

          <Divider />

          <Box>
            <Typography
              variant="subtitle2"
              sx={{ fontWeight: theme.custom.font.weight.medium, mb: 0.5 }}
            >
              Label Name
            </Typography>
            <Stack direction="row" spacing={1} alignItems="center">
              <TextField
                fullWidth
                size="small"
                value={labelNameDraft}
                onChange={(event) => onLabelNameDraftChange(event.target.value)}
                sx={{
                  "& .MuiInputBase-root": {
                    py: 0.3,
                    fontSize: theme.custom.font.size.sm,
                    minHeight: 36,
                  },
                }}
              />
              <Button variant="outlined" onClick={onUpdateLabelName} sx={{...accentButtonSx, minHeight: 36}}>
                Update
              </Button>
            </Stack>
          </Box>

          <Box>
            <Typography
              variant="subtitle2"
              sx={{ fontWeight: theme.custom.font.weight.medium, mb: 0.5 }}
            >
              Color
            </Typography>
            <Stack direction="row" spacing={1} alignItems="center">
              <Box
                onClick={onColorPickerOpen}
                sx={{
                  width: 26,
                  height: 26,
                  borderRadius: "50%",
                  backgroundColor: activeMeta?.color ?? theme.palette.divider,
                  border: `1px solid ${theme.palette.divider}`,
                  cursor: "pointer",
                }}
              />
              <Typography variant="caption" color="text.secondary">
                Click to change
              </Typography>
            </Stack>
            <Popover
              open={isColorPickerOpen}
              anchorEl={colorAnchorEl}
              onClose={onColorPickerClose}
              anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
              transformOrigin={{ vertical: "top", horizontal: "left" }}
            >
              <Box sx={{ p: 1 }}>
                <input
                  type="color"
                  value={activeMeta?.color ?? theme.palette.accent1.vibrant}
                  onChange={(event) => onColorChange(event.target.value)}
                  style={{ width: 48, height: 48, border: "none" }}
                />
              </Box>
            </Popover>
          </Box>

          <Box>
            <Typography
              variant="subtitle2"
              sx={{ fontWeight: theme.custom.font.weight.medium, mb: 0.5 }}
            >
              Tags
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              {(activeMeta?.tags ?? []).map((tag) => (
                <Chip key={tag} label={tag} size="small" />
              ))}
            </Stack>
            <Stack direction="row" spacing={1} mt={1}>
              <TextField
                size="small"
                placeholder="Add tag"
                value={newTag}
                onChange={(event) => onNewTagChange(event.target.value)}
                sx={{
                  "& .MuiInputBase-root": {
                    py: 0.3,
                    fontSize: theme.custom.font.size.sm,
                    minHeight: 34,
                  },
                }}
              />
              <Button variant="outlined" onClick={onAddTag} sx={accentButtonSx}>
                Add
              </Button>
            </Stack>
          </Box>

          <Box>
            <Typography
              variant="subtitle2"
              sx={{ fontWeight: theme.custom.font.weight.medium, mb: 0.5 }}
            >
              Notes
            </Typography>
            <Stack spacing={1}>
              <TextField
                fullWidth
                size="small"
                label="Add note at current frame"
                value={noteDraft}
                onChange={(event) => onNoteDraftChange(event.target.value)}
                multiline
                minRows={2}
                sx={{
                  "& .MuiInputBase-root": {
                    py: 0.3,
                    fontSize: theme.custom.font.size.sm,
                  },
                  "& .MuiInputLabel-root": {
                    fontSize: theme.custom.font.size.sm,
                  },
                }}
              />
              <Button
                variant="outlined"
                onClick={onAddNote}
                disabled={!selectedAnnotationId}
                sx={accentButtonSx}
              >
                Add Note
              </Button>
              {!selectedAnnotationId && (
                <Typography variant="caption" color="text.secondary">
                  Select a bounding box to anchor the note.
                </Typography>
              )}
              <Divider />
              <Stack spacing={1}>
                {activeNotes.length === 0 ? (
                  <Typography variant="caption" color="text.secondary">
                    No active notes at this frame.
                  </Typography>
                ) : (
                  activeNotes.map((note) => (
                    <Box
                      key={note.id}
                      sx={{
                        p: 1,
                        borderRadius: theme.custom.radii.xs,
                        border: `1px solid ${theme.palette.divider}`,
                      }}
                    >
                      <Typography variant="caption" color="text.secondary">
                        Frame {note.frame}
                      </Typography>
                      <Typography variant="body2">{note.text}</Typography>
                    </Box>
                  ))
                )}
              </Stack>
            </Stack>
          </Box>

          <Divider />

          <Box>
            <Typography
              variant="subtitle2"
              sx={{ fontWeight: theme.custom.font.weight.medium, mb: 1 }}
            >
              Annotations
            </Typography>
            <Stack spacing={1}>
              {annotations.map((rect) => (
                <Stack
                  key={rect.id}
                  direction="row"
                  spacing={1}
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Box
                      sx={{
                        width: 10,
                        height: 10,
                        borderRadius: "50%",
                        backgroundColor: rect.color,
                      }}
                    />
                    <Typography variant="body2">{rect.labelName}</Typography>
                  </Stack>
                  <Stack direction="row" spacing={1}>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => onToggleAnnotation(rect.id)}
                      sx={accentButtonSx}
                    >
                      {isAnnotationActive(rect) ? "Active" : "Inactive"}
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      color="error"
                      onClick={() => onDeleteAnnotation(rect.id)}
                    >
                      Delete
                    </Button>
                  </Stack>
                </Stack>
              ))}
            </Stack>
          </Box>
        </Stack>
      </Box>
      <Button
        variant="outlined"
        onClick={onCommit}
        disabled={isCommitDisabled}
        sx={{ ...accentButtonSx, mt: 2 }}
      >
        {isSavingDraft ? "Saving..." : "Commit Annotations"}
      </Button>
      {(draftSource || isAutosaving) && (
        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
          {isAutosaving
            ? "Autosaving draft..."
            : draftSource === "draft"
              ? "Loaded saved draft."
              : "Loaded last committed annotation."}
        </Typography>
      )}
      {saveError && (
        <Typography variant="caption" color="error" sx={{ mt: 1 }}>
          {saveError}
        </Typography>
      )}
      {saveSuccess && (
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
          {saveSuccess}
        </Typography>
      )}
    </Box>
  )
}

export default LabelerDetailsPanel
