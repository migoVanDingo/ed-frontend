import React, { useMemo } from "react"
import { Box, Tooltip } from "@mui/material"
import { useTheme } from "@mui/material/styles"
import {
  formatTime,
  frameToTime,
  getActiveSegments,
  timeToFrame,
} from "../../../utils/labeler/labelerUtils"
import type { ActiveKeyframe } from "../../../types/labeler/labelerTypes"

type ActivityMapTimelineProps = {
  color: string
  effectiveFps: number
  durationSeconds: number
  keyframes: Array<{ frame: number }>
  activeKeyframes: ActiveKeyframe[]
  interpolationKeyframes?: ActiveKeyframe[]
  currentTimeSeconds?: number
  onSelectPoint?: (frame: number) => void
  showPlayhead?: boolean
}

const ActivityMapTimeline = ({
  color,
  effectiveFps,
  durationSeconds,
  keyframes,
  activeKeyframes,
  interpolationKeyframes = [],
  currentTimeSeconds,
  onSelectPoint,
  showPlayhead = true,
}: ActivityMapTimelineProps) => {
  const theme = useTheme()

  const { maxFrame, assumeSeconds } = useMemo(() => {
    const frames = [
      ...keyframes.map((kf) => Number(kf.frame)),
      ...activeKeyframes.map((kf) => Number(kf.frame)),
      ...interpolationKeyframes.map((kf) => Number(kf.frame)),
    ].filter((value) => Number.isFinite(value))
    const maxValue = frames.length ? Math.max(...frames) : 0
    if (durationSeconds > 0) {
      // If max value is close to duration, treat it as seconds.
      const ratio = maxValue / durationSeconds
      return { maxFrame: maxValue, assumeSeconds: ratio <= 2 }
    }
    if (effectiveFps <= 0) {
      return { maxFrame: maxValue, assumeSeconds: true }
    }
    return { maxFrame: maxValue, assumeSeconds: maxValue <= effectiveFps * 2 }
  }, [activeKeyframes, durationSeconds, effectiveFps, interpolationKeyframes, keyframes])

  const normalizedActiveKeyframes = useMemo(() => {
    if (!assumeSeconds) return activeKeyframes
    return activeKeyframes.map((kf) => ({
      ...kf,
      frame: Math.round(Number(kf.frame) * effectiveFps),
    }))
  }, [activeKeyframes, assumeSeconds, effectiveFps])

  const durationFrames = Math.max(
    timeToFrame(durationSeconds, effectiveFps),
    assumeSeconds ? Math.round(maxFrame * effectiveFps) : maxFrame,
    1
  )
  const safeDurationSeconds = Math.max(
    durationSeconds || 0,
    frameToTime(durationFrames, effectiveFps),
    assumeSeconds ? maxFrame : 0,
    1 / Math.max(effectiveFps, 1)
  )
  const labelActiveSegments = getActiveSegments(normalizedActiveKeyframes, durationFrames)

  return (
    <Box
      sx={{
        position: "relative",
        width: "100%",
        minWidth: 0,
        height: 32,
        borderRadius: 0,
        backgroundColor:
          theme.palette.mode === "dark"
            ? theme.palette.grey[800]
            : theme.palette.grey[200],
      }}
    >
      {showPlayhead &&
        typeof currentTimeSeconds === "number" &&
        safeDurationSeconds > 0 && (
        <Box
          sx={{
            position: "absolute",
            left: `${Math.min(
              Math.max(currentTimeSeconds / safeDurationSeconds, 0),
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
      {labelActiveSegments.map((segment, idx) => {
        if (durationFrames <= 0) return null
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
              height: 8,
              transform: "translateY(-50%)",
              backgroundColor: color,
              borderRadius: 4,
              opacity: 0.8,
            }}
          />
        )
      })}
      {keyframes.map((kf, idx) => {
        const raw = Number(kf.frame)
        const timeSeconds = assumeSeconds
          ? raw
          : frameToTime(raw, effectiveFps)
        const left = Math.min(
          Math.max(timeSeconds / safeDurationSeconds, 0),
          1
        )
        return (
          <Tooltip key={`kf-${kf.frame}-${idx}`} title={formatTime(timeSeconds)} arrow>
            <Box
              onClick={() =>
                onSelectPoint?.(
                  assumeSeconds ? Math.round(raw * effectiveFps) : raw
                )
              }
              sx={{
                position: "absolute",
                left: `calc(${left * 100}% - 6px)`,
                top: "50%",
                width: 12,
                height: 12,
                borderRadius: "50%",
                transform: "translateY(-50%)",
                backgroundColor: color,
                border: `2px solid ${theme.palette.common.white}`,
                cursor: "pointer",
              }}
            />
          </Tooltip>
        )
      })}
      {normalizedActiveKeyframes.map((kf, idx) => {
        const raw = Number(kf.frame)
        const timeSeconds = frameToTime(raw, effectiveFps)
        const left = Math.min(
          Math.max(timeSeconds / safeDurationSeconds, 0),
          1
        )
        return (
          <Tooltip key={`tg-${kf.frame}-${idx}`} title={formatTime(timeSeconds)} arrow>
            <Box
              onClick={() => onSelectPoint?.(raw)}
              sx={{
                position: "absolute",
                left: `calc(${left * 100}% - 6px)`,
                top: "50%",
                width: 12,
                height: 12,
                borderRadius: "50%",
                transform: "translateY(-50%)",
                backgroundColor: kf.active ? color : "transparent",
                border: `2px solid ${color}`,
                cursor: "pointer",
              }}
            />
          </Tooltip>
        )
      })}
    </Box>
  )
}

export default ActivityMapTimeline
