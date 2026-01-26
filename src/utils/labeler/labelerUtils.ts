import type {
  ActiveKeyframe,
  AnnotationRect,
  RectShape,
} from "../../types/labeler/labelerTypes"

export const FPS = 30

export const formatTime = (seconds: number) => {
  if (!Number.isFinite(seconds)) return "0:00"
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, "0")}`
}

export const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max)

export const timeToFrame = (time: number, fps: number = FPS) =>
  Math.round(time * fps)

export const frameToTime = (frame: number, fps: number) => frame / fps

export const isNormalizedRect = (rect: RectShape) =>
  rect.x >= 0 &&
  rect.y >= 0 &&
  rect.w >= 0 &&
  rect.h >= 0 &&
  rect.x <= 1 &&
  rect.y <= 1 &&
  rect.w <= 1 &&
  rect.h <= 1

export const getTimelineTickInterval = (durationSeconds: number) => {
  if (durationSeconds <= 60) return 10
  if (durationSeconds <= 300) return 30
  if (durationSeconds <= 900) return 60
  if (durationSeconds <= 1800) return 120
  if (durationSeconds <= 3600) return 300
  return 600
}

export const getSegmentState = (activeKeyframes: ActiveKeyframe[], frame: number) => {
  if (activeKeyframes.length === 0) {
    return { active: true, startFrame: 0, endFrame: Infinity }
  }
  const frames = [...activeKeyframes].sort((a, b) => a.frame - b.frame)
  const exactIndex = frames.findIndex((frameItem) => frameItem.frame === frame)
  if (exactIndex >= 0) {
    return {
      active: frames[exactIndex].active,
      startFrame: frames[exactIndex].frame,
      endFrame: frames[exactIndex + 1]?.frame ?? Infinity,
    }
  }
  if (frame <= frames[0].frame) {
    return {
      active: frames[0].active,
      startFrame: frames[0].frame,
      endFrame: frames[1]?.frame ?? Infinity,
    }
  }
  if (frame >= frames[frames.length - 1].frame) {
    return {
      active: frames[frames.length - 1].active,
      startFrame: frames[frames.length - 1].frame,
      endFrame: Infinity,
    }
  }
  const nextIndex = frames.findIndex((frameItem) => frameItem.frame >= frame)
  const prev = frames[Math.max(nextIndex - 1, 0)]
  const next = frames[nextIndex]
  return {
    active: prev?.active ?? true,
    startFrame: prev?.frame ?? 0,
    endFrame: next?.frame ?? Infinity,
  }
}

export const getActiveSegments = (
  activeKeyframes: ActiveKeyframe[],
  durationFrames: number
) => {
  if (durationFrames <= 0) return []
  if (activeKeyframes.length === 0) {
    return [{ start: 0, end: durationFrames }]
  }
  const frames = [...activeKeyframes].sort((a, b) => a.frame - b.frame)
  const segments: Array<{ start: number; end: number }> = []
  const pushSegment = (start: number, end: number, active: boolean) => {
    if (!active) return
    segments.push({ start: Math.max(start, 0), end: Math.min(end, durationFrames) })
  }

  pushSegment(0, frames[0].frame, frames[0].active)
  for (let i = 0; i < frames.length - 1; i += 1) {
    pushSegment(frames[i].frame, frames[i + 1].frame, frames[i].active)
  }
  pushSegment(
    frames[frames.length - 1].frame,
    durationFrames,
    frames[frames.length - 1].active
  )
  return segments.filter((segment) => segment.end > segment.start)
}

export const mergeSegments = (segments: Array<{ start: number; end: number }>) => {
  if (segments.length === 0) return []
  const sorted = [...segments].sort((a, b) => a.start - b.start)
  const merged: Array<{ start: number; end: number }> = [sorted[0]]
  for (let i = 1; i < sorted.length; i += 1) {
    const prev = merged[merged.length - 1]
    const curr = sorted[i]
    if (curr.start <= prev.end) {
      prev.end = Math.max(prev.end, curr.end)
    } else {
      merged.push({ ...curr })
    }
  }
  return merged
}

export const getLastKeyframeRect = (
  annotation: AnnotationRect,
  frame: number
): RectShape | null => {
  if (annotation.keyframes.length === 0) return null
  const frames = [...annotation.keyframes].sort((a, b) => a.frame - b.frame)
  const before = frames.filter((kf) => kf.frame <= frame)
  const target = before[before.length - 1] ?? frames[0]
  if (!target) return null
  return { x: target.x, y: target.y, w: target.w, h: target.h }
}

export const getInterpolatedRect = (
  annotation: AnnotationRect,
  frame: number
): RectShape | null => {
  if (annotation.keyframes.length === 0) return null
  const segment = getSegmentState(annotation.activeKeyframes, frame)
  if (!segment.active) return null

  const frames = [...annotation.keyframes].sort((a, b) => a.frame - b.frame)
  const segmentFrames = frames.filter(
    (kf) => kf.frame >= segment.startFrame && kf.frame <= segment.endFrame
  )
  const usableFrames = segmentFrames.length > 0 ? segmentFrames : frames

  if (frame <= usableFrames[0].frame) {
    const { x, y, w, h } = usableFrames[0]
    return { x, y, w, h }
  }
  if (frame >= usableFrames[usableFrames.length - 1].frame) {
    const { x, y, w, h } = usableFrames[usableFrames.length - 1]
    return { x, y, w, h }
  }

  const nextIndex = usableFrames.findIndex(
    (frameItem) => frameItem.frame >= frame
  )
  const prev = usableFrames[Math.max(nextIndex - 1, 0)]
  const next = usableFrames[nextIndex]
  if (!prev || !next) return null

  const span = next.frame - prev.frame
  const t = span === 0 ? 0 : (frame - prev.frame) / span
  return {
    x: prev.x + (next.x - prev.x) * t,
    y: prev.y + (next.y - prev.y) * t,
    w: prev.w + (next.w - prev.w) * t,
    h: prev.h + (next.h - prev.h) * t,
  }
}

export const isActiveAtTime = (annotation: AnnotationRect, frame: number) =>
  getSegmentState(annotation.activeKeyframes, frame).active
