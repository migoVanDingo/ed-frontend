import React from "react"
import { Box, Button, Stack, Tooltip, Typography } from "@mui/material"
import { useTheme } from "@mui/material/styles"
import { formatTime, frameToTime } from "../../../utils/labeler/labelerUtils"
import type { TimelinePoint } from "../../../types/labeler/labelerTypes"

type LabelerTimelineProps = {
  activeLabelId: string | null
  activeLabelName: string | null
  activeLabelColor?: string
  activeLabelInterpolation: boolean
  canAddKeyframe: boolean
  duration: number
  durationFrames: number
  effectiveFps: number
  labelActiveSegments: { start: number; end: number }[]
  interpolationPoints: TimelinePoint[]
  selectedTimelinePoint: TimelinePoint | null
  timelinePoints: TimelinePoint[]
  timelineTicks: number[]
  onToggleInterpolation: () => void
  onAddKeyframe: () => void
  onDeletePoint: () => void
  onSelectPoint: (point: TimelinePoint, timeSeconds: number) => void
  accentButtonSx: Record<string, unknown>
  showControls?: boolean
  showHeader?: boolean
  showTopBorder?: boolean
  currentTimeSeconds?: number
  showRangeLabels?: boolean
  timestampFontSize?: number | string
  showPointTimestamps?: boolean
  showPointHoverTimestamp?: boolean
  timelineBorderRadius?: number
  timelineHeight?: number
  pointSize?: number
}

const LabelerTimeline = ({
  activeLabelId,
  activeLabelName,
  activeLabelColor,
  activeLabelInterpolation,
  canAddKeyframe,
  duration,
  durationFrames,
  effectiveFps,
  labelActiveSegments,
  interpolationPoints,
  selectedTimelinePoint,
  timelinePoints,
  timelineTicks,
  onToggleInterpolation,
  onAddKeyframe,
  onDeletePoint,
  onSelectPoint,
  accentButtonSx,
  showControls = true,
  showHeader = true,
  showTopBorder = true,
  currentTimeSeconds,
  showRangeLabels = true,
  timestampFontSize,
  showPointTimestamps = true,
  showPointHoverTimestamp = true,
  timelineBorderRadius = 6,
  timelineHeight = 26,
  pointSize = 10,
}: LabelerTimelineProps) => {
  const theme = useTheme()
  const effectiveTimestampFontSize =
    timestampFontSize ?? theme.custom.font.size.xs

  return (
    <Box
      sx={{
        mt: showTopBorder ? 2 : 0,
        pt: showTopBorder ? 1 : 0,
        borderTop: showTopBorder ? `1px solid ${theme.palette.divider}` : "none",
      }}
    >
      <Stack spacing={0.75}>
        {showHeader && (
          <Stack direction="row" alignItems="center" spacing={1}>
            <Typography
              variant="subtitle2"
              sx={{ fontWeight: theme.custom.font.weight.medium }}
            >
              Label Timeline
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {activeLabelName ?? "Select a label"}
            </Typography>
            <Box sx={{ flex: 1 }} />
            {showControls && (
              <>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={onToggleInterpolation}
                  disabled={!activeLabelId}
                  sx={
                    activeLabelInterpolation
                      ? accentButtonSx
                      : {
                          borderColor: theme.palette.grey[400],
                          color: theme.palette.text.secondary,
                          "&:hover": {
                            backgroundColor: theme.palette.action.hover,
                          },
                        }
                  }
                >
                  {activeLabelInterpolation
                    ? "Interpolation On"
                    : "Interpolation Off"}
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={onAddKeyframe}
                  disabled={!activeLabelId || !canAddKeyframe}
                  sx={accentButtonSx}
                >
                  Add Keyframe
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  color="error"
                  onClick={onDeletePoint}
                  disabled={!selectedTimelinePoint}
                >
                  Delete Point
                </Button>
              </>
            )}
          </Stack>
        )}
        <Box
          sx={{
            position: "relative",
            height: timelineHeight,
            borderRadius: timelineBorderRadius,
            backgroundColor:
              theme.palette.mode === "dark"
                ? theme.palette.grey[800]
                : theme.palette.grey[200],
          }}
        >
          {typeof currentTimeSeconds === "number" && duration > 0 && (
            <Box
              sx={{
                position: "absolute",
                left: `${Math.min(
                  Math.max(currentTimeSeconds / duration, 0),
                  1
                ) * 100}%`,
                top: 0,
                bottom: 0,
                width: 2,
                backgroundColor: theme.palette.accent1.vibrant,
                transform: "translateX(-1px)",
                pointerEvents: "none",
              }}
            />
          )}
          {timelineTicks.map((tick) => {
            if (!duration) return null
            const left = Math.min(Math.max(tick / duration, 0), 1)
            return (
              <Box
                key={`tick-${tick}`}
                sx={{
                  position: "absolute",
                  left: `${left * 100}%`,
                  top: "50%",
                  width: 2,
                  height: 8,
                  transform: "translate(-50%, -50%)",
                  backgroundColor: theme.palette.grey[400],
                }}
              />
            )
          })}
          {labelActiveSegments.map((segment, idx) => {
            if (!duration || duration <= 0) return null
            const startPct = segment.start / durationFrames
            const endPct = segment.end / durationFrames
            return (
              <Box
                key={`segment-${idx}`}
                sx={{
                  position: "absolute",
                  left: `${startPct * 100}%`,
                  width: `${Math.max((endPct - startPct) * 100, 0.5)}%`,
                  top: "50%",
                  height: 6,
                  transform: "translateY(-50%)",
                  backgroundColor:
                    activeLabelColor ?? theme.palette.primary.main,
                  borderRadius: 6,
                  opacity: 0.7,
                }}
              />
            )
          })}
          {timelinePoints.map((point, idx) => {
            if (!duration || duration <= 0) return null
            const timeSeconds = frameToTime(point.frame, effectiveFps)
            const left = Math.min(Math.max(timeSeconds / duration, 0), 1)
            const isSelected =
              selectedTimelinePoint?.annotationId === point.annotationId &&
              selectedTimelinePoint.frame === point.frame &&
              selectedTimelinePoint.type === point.type
              return (
                <Tooltip
                  key={`${point.annotationId}-${point.type}-${point.frame}-${idx}`}
                  title={
                    showPointHoverTimestamp ? formatTime(timeSeconds) : ""
                  }
                  arrow
                  disableHoverListener={!showPointHoverTimestamp}
                >
                  <Box
                    onClick={() => onSelectPoint(point, timeSeconds)}
                    sx={{
                      position: "absolute",
                      left: `calc(${left * 100}% - ${pointSize / 2}px)`,
                      top: "50%",
                      width: pointSize,
                      height: pointSize,
                      borderRadius: "50%",
                      transform: "translateY(-50%)",
                      backgroundColor:
                        point.type === "keyframe"
                        ? activeLabelColor ?? theme.palette.primary.main
                        : "transparent",
                    border: `2px solid ${
                      point.type === "toggle"
                        ? activeLabelColor ?? theme.palette.primary.main
                        : theme.palette.common.white
                    }`,
                    boxShadow: isSelected
                      ? `0 0 0 2px ${theme.palette.primary.main}`
                      : "none",
                    cursor: "pointer",
                  }}
                />
              </Tooltip>
            )
          })}
          {interpolationPoints.map((point, idx) => {
            if (!duration || duration <= 0) return null
            const timeSeconds = frameToTime(point.frame, effectiveFps)
            const left = Math.min(Math.max(timeSeconds / duration, 0), 1)
            const isSelected =
              selectedTimelinePoint?.annotationId === point.annotationId &&
              selectedTimelinePoint.frame === point.frame &&
              selectedTimelinePoint.type === point.type
              return (
                <Tooltip
                  key={`interp-${point.annotationId}-${point.frame}-${idx}`}
                  title={
                    showPointHoverTimestamp ? formatTime(timeSeconds) : ""
                  }
                  arrow
                  disableHoverListener={!showPointHoverTimestamp}
                >
                  <Box
                    onClick={() =>
                      onSelectPoint(
                        {
                          annotationId: point.annotationId,
                          frame: point.frame,
                          type: "interpolation",
                        },
                        timeSeconds
                      )
                    }
                    sx={{
                      position: "absolute",
                      left: `calc(${left * 100}% - ${pointSize / 2}px)`,
                      top: "50%",
                      width: pointSize,
                      height: pointSize,
                      borderRadius: "50%",
                      transform: "translateY(-50%)",
                      backgroundColor: point.active
                      ? theme.palette.info.main
                      : theme.palette.grey[400],
                    border: `2px solid ${theme.palette.common.white}`,
                    boxShadow: isSelected
                      ? `0 0 0 2px ${theme.palette.info.main}`
                      : "none",
                    cursor: "pointer",
                  }}
                />
              </Tooltip>
            )
          })}
          {showPointTimestamps &&
            timelinePoints.map((point, idx) => {
              if (!duration || duration <= 0) return null
              const timeSeconds = frameToTime(point.frame, effectiveFps)
              const left = Math.min(Math.max(timeSeconds / duration, 0), 1)
              return (
                <Typography
                  key={`ts-${point.annotationId}-${point.type}-${point.frame}-${idx}`}
                  variant="caption"
                  sx={{
                    position: "absolute",
                    left: `calc(${left * 100}% - 16px)`,
                    top: "100%",
                    mt: 0.25,
                    fontSize: effectiveTimestampFontSize,
                    color: theme.palette.text.secondary,
                    whiteSpace: "nowrap",
                  }}
                >
                  {formatTime(timeSeconds)}
                </Typography>
              )
            })}
          {showPointTimestamps &&
            interpolationPoints.map((point, idx) => {
              if (!duration || duration <= 0) return null
              const timeSeconds = frameToTime(point.frame, effectiveFps)
              const left = Math.min(Math.max(timeSeconds / duration, 0), 1)
              return (
                <Typography
                  key={`ts-interp-${point.annotationId}-${point.frame}-${idx}`}
                  variant="caption"
                  sx={{
                    position: "absolute",
                    left: `calc(${left * 100}% - 16px)`,
                    top: "100%",
                    mt: 0.25,
                    fontSize: effectiveTimestampFontSize,
                    color: theme.palette.text.secondary,
                    whiteSpace: "nowrap",
                  }}
                >
                  {formatTime(timeSeconds)}
                </Typography>
              )
            })}
          {!activeLabelId && (
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
              }}
            >
              Select a label to view its timeline.
            </Typography>
          )}
        </Box>
        {showRangeLabels && (
          <Stack direction="row" justifyContent="space-between">
            <Typography variant="caption" color="text.secondary">
              {formatTime(0)}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {formatTime(duration)}
            </Typography>
          </Stack>
        )}
      </Stack>
    </Box>
  )
}

export default LabelerTimeline
