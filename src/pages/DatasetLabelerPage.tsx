import React, { useEffect, useMemo, useRef, useState } from "react"
import {
  Box,
  Button,
  Chip,
  Divider,
  IconButton,
  Popover,
  Slider,
  Stack,
  TextField,
  Typography,
} from "@mui/material"
import { useTheme } from "@mui/material/styles"
import PlayArrowIcon from "@mui/icons-material/PlayArrow"
import PauseIcon from "@mui/icons-material/Pause"
import { useLoaderData, useLocation, useParams } from "react-router-dom"
import { GraphQLClient } from "../graphql/GraphQLClient"
import { ServicePort } from "../utility/constants/serviceConstants"
import { UPSERT_ANNOTATION_DRAFT_MUTATION } from "../graphql/mutation/annotationDraft"
import { GET_OR_CREATE_ANNOTATION_SET_MUTATION } from "../graphql/mutation/annotationSet"
import { FILE_SIGNED_URL_QUERY } from "../graphql/query/fileQuery"

const sampleVideoUrl =
  "https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"

type LabelMeta = {
  name: string
  tags: string[]
  color: string
  notes: string
}

type Point = { x: number; y: number }

type RectShape = { x: number; y: number; w: number; h: number }

const FPS = 30

type Keyframe = RectShape & { frame: number }

type ActiveKeyframe = { frame: number; active: boolean }

type NoteEntry = {
  id: string
  frame: number
  text: string
  anchorX: number
  anchorY: number
}

type DatasetLabelerFile = {
  id: string
  datasetItemId?: string | null
  name: string
  status: string
  objectKey?: string | null
  bucket?: string | null
  storageProvider?: string | null
  contentType?: string | null
  meta?: Record<string, any> | null
}

type DatasetLabelerLoaderData = {
  dataset: {
    id: string
    name: string
    description?: string | null
    datastoreId: string
  }
  datasetFiles: DatasetLabelerFile[]
}

type AnnotationRect = {
  id: string
  labelId: string
  labelName: string
  color: string
  keyframes: Keyframe[]
  activeKeyframes: ActiveKeyframe[]
}

type VideoBounds = {
  left: number
  top: number
  width: number
  height: number
}

type DragHandle =
  | "move"
  | "nw"
  | "ne"
  | "sw"
  | "se"
  | "n"
  | "s"
  | "e"
  | "w"
  | null

const formatTime = (seconds: number) => {
  if (!Number.isFinite(seconds)) return "0:00"
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, "0")}`
}

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max)

const timeToFrame = (time: number) => Math.round(time * FPS)

const getSegmentState = (activeKeyframes: ActiveKeyframe[], frame: number) => {
  if (activeKeyframes.length === 0) {
    return { active: true, startFrame: 0, endFrame: Infinity }
  }
  const frames = [...activeKeyframes].sort((a, b) => a.frame - b.frame)
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

const getLastKeyframeRect = (
  annotation: AnnotationRect,
  frame: number
): RectShape | null => {
  if (annotation.keyframes.length === 0) return null
  const frames = [...annotation.keyframes].sort((a, b) => a.frame - b.frame)
  const before = frames.filter((kf) => kf.frame <= frame)
  const target = before[before.length - 1] ?? frames[0]
  return target ? { x: target.x, y: target.y, w: target.w, h: target.h } : null
}

const getInterpolatedRect = (
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

const isActiveAtTime = (annotation: AnnotationRect, frame: number) =>
  getSegmentState(annotation.activeKeyframes, frame).active

const NOTE_DURATION_FRAMES = 100
const NOTE_OFFSET = 14

const DatasetLabelerPage = () => {
  const theme = useTheme()
  const loaderData = useLoaderData() as DatasetLabelerLoaderData
  const { datasetId } = useParams()
  const location = useLocation()
  const searchParams = new URLSearchParams(location.search)
  const annotationSetIdParam = searchParams.get("annotationSetId")
  const requestedFileId = searchParams.get("fileId")
  const datasetFiles = loaderData.datasetFiles ?? []
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const overlayRef = useRef<HTMLDivElement | null>(null)
  const videoContainerRef = useRef<HTMLDivElement | null>(null)

  const [labels, setLabels] = useState(() => [
    {
      id: "default1",
      name: "Default Label 1",
      color: theme.palette.accent1.vibrant,
    },
  ])

  const [selectedFileId, setSelectedFileId] = useState<string | null>(
    datasetFiles[0]?.id ?? null
  )
  const selectedDatasetItemIdOverride = searchParams.get("datasetItemId")
  const [activeLabelId, setActiveLabelId] = useState(labels[0]?.id)
  const [labelMetadata, setLabelMetadata] = useState<Record<string, LabelMeta>>(
    () => {
      const initial: Record<string, LabelMeta> = {}
      labels.forEach((label) => {
        initial[label.id] = {
          name: label.name,
          tags: ["person"],
          color: label.color,
          notes: "",
        }
      })
      return initial
    }
  )
  const [newTag, setNewTag] = useState("")
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [isScrubbing, setIsScrubbing] = useState(false)
  const [isDrawing, setIsDrawing] = useState(false)
  const [startPoint, setStartPoint] = useState<Point | null>(null)
  const [currentRect, setCurrentRect] = useState<
    | (RectShape & {
        labelId: string
        labelName: string
        color: string
      })
    | null
  >(null)
  const [annotations, setAnnotations] = useState<AnnotationRect[]>([])
  const [videoBounds, setVideoBounds] = useState<VideoBounds>({
    left: 0,
    top: 0,
    width: 0,
    height: 0,
  })
  const [selectedAnnotationId, setSelectedAnnotationId] = useState<
    string | null
  >(null)
  const [dragHandle, setDragHandle] = useState<DragHandle>(null)
  const [dragStartPoint, setDragStartPoint] = useState<Point | null>(null)
  const [dragStartRect, setDragStartRect] = useState<RectShape | null>(null)
  const [hoverHandle, setHoverHandle] = useState<DragHandle>(null)
  const [dragPreview, setDragPreview] = useState<{
    id: string
    rect: RectShape
  } | null>(null)
  const [notes, setNotes] = useState<NoteEntry[]>([])
  const [noteDraft, setNoteDraft] = useState("")
  const [colorAnchorEl, setColorAnchorEl] = useState<HTMLElement | null>(null)
  const isColorPickerOpen = Boolean(colorAnchorEl)
  const [isSavingDraft, setIsSavingDraft] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null)
  const [videoUrl, setVideoUrl] = useState(sampleVideoUrl)
  const [videoUrlError, setVideoUrlError] = useState<string | null>(null)
  const [annotationSetId, setAnnotationSetId] = useState<string | null>(
    annotationSetIdParam
  )

  const filesById = useMemo(
    () => new Map(datasetFiles.map((file) => [file.id, file])),
    [datasetFiles]
  )
  const selectedFile = selectedFileId ? filesById.get(selectedFileId) : undefined
  const resolvedDatasetItemId =
    selectedFile?.datasetItemId ?? selectedDatasetItemIdOverride ?? null
  const activeLabel = labels.find((label) => label.id === activeLabelId)
  const activeMeta = activeLabelId ? labelMetadata[activeLabelId] : undefined

  const contentHeight = `calc(100vh - ${theme.custom.component.header.height}px)`
  const videoInspect = selectedFile?.meta?.video?.inspect
  const metaDuration = Number(videoInspect?.duration_seconds)
  const metaFps = Number(videoInspect?.fps)
  const effectiveDuration = Number.isFinite(metaDuration) ? metaDuration : null
  const effectiveFps = Number.isFinite(metaFps) ? metaFps : FPS
  useEffect(() => {
    if (!selectedFileId) {
      setVideoUrl(sampleVideoUrl)
      setVideoUrlError(null)
      return
    }

    const target = selectedFile
    if (!target) return
    if (target.storageProvider && target.storageProvider !== "gcs") {
      setVideoUrl(sampleVideoUrl)
      setVideoUrlError("Unsupported storage provider for video preview.")
      return
    }

    let cancelled = false
    const fetchSignedUrl = async () => {
      const response = await GraphQLClient.query<{
        fileSignedUrl: string
      }>(FILE_SIGNED_URL_QUERY, ServicePort.GRAPHQL, {
        variables: { fileId: target.id, expiresIn: 900 },
      })

      if (cancelled) return

      if (!response.success || !response.data?.fileSignedUrl) {
        const message =
          response.errors?.[0]?.message ?? "Failed to load video URL."
        setVideoUrl(sampleVideoUrl)
        setVideoUrlError(message)
        return
      }

      setVideoUrl(response.data.fileSignedUrl)
      setVideoUrlError(null)
    }

    fetchSignedUrl()

    return () => {
      cancelled = true
    }
  }, [selectedFile, selectedFileId])

  useEffect(() => {
    if (effectiveDuration && (!duration || duration === 0)) {
      setDuration(effectiveDuration)
    }
  }, [effectiveDuration, duration])

  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    video.load()
  }, [videoUrl])

  useEffect(() => {
    if (!datasetFiles.length) return
    const requested =
      requestedFileId && filesById.has(requestedFileId)
        ? requestedFileId
        : null
    const nextId = requested ?? datasetFiles[0]?.id ?? null
    setSelectedFileId(nextId)
  }, [datasetFiles, filesById, requestedFileId])

  useEffect(() => {
    setAnnotationSetId(annotationSetIdParam ?? null)
  }, [annotationSetIdParam])

  useEffect(() => {
    if (annotationSetId || !datasetId) return

    let cancelled = false
    const ensureAnnotationSet = async () => {
      const response = await GraphQLClient.mutate<{
        getOrCreateAnnotationSet: { id: string; status: string }
      }>(GET_OR_CREATE_ANNOTATION_SET_MUTATION, ServicePort.GRAPHQL, {
        variables: { datasetId },
      })

      if (cancelled) return

      if (!response.success || !response.data?.getOrCreateAnnotationSet) {
        const message =
          response.errors?.[0]?.message ??
          "Failed to initialize annotation set."
        setSaveError(message)
        return
      }

      setAnnotationSetId(response.data.getOrCreateAnnotationSet.id)
    }

    ensureAnnotationSet()

    return () => {
      cancelled = true
    }
  }, [annotationSetId, datasetId])

  const updateVideoBounds = () => {
    const video = videoRef.current
    const container = videoContainerRef.current
    if (!video || !container) return
    if (!video.videoWidth || !video.videoHeight) return

    const containerRect = container.getBoundingClientRect()
    const videoAspect = video.videoWidth / video.videoHeight
    const containerAspect = containerRect.width / containerRect.height

    let width = containerRect.width
    let height = containerRect.height
    let left = 0
    let top = 0

    if (containerAspect > videoAspect) {
      height = containerRect.height
      width = height * videoAspect
      left = (containerRect.width - width) / 2
    } else {
      width = containerRect.width
      height = width / videoAspect
      top = (containerRect.height - height) / 2
    }

    setVideoBounds({ left, top, width, height })
  }

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const handleLoaded = () => {
      setDuration(video.duration || 0)
      updateVideoBounds()
    }
    const handleTimeUpdate = () => {
      if (!isScrubbing) setCurrentTime(video.currentTime)
    }

    video.addEventListener("loadedmetadata", handleLoaded)
    video.addEventListener("timeupdate", handleTimeUpdate)
    return () => {
      video.removeEventListener("loadedmetadata", handleLoaded)
      video.removeEventListener("timeupdate", handleTimeUpdate)
    }
  }, [isScrubbing])

  useEffect(() => {
    if (!videoContainerRef.current) return
    const observer = new ResizeObserver(() => updateVideoBounds())
    observer.observe(videoContainerRef.current)
    window.addEventListener("resize", updateVideoBounds)
    return () => {
      observer.disconnect()
      window.removeEventListener("resize", updateVideoBounds)
    }
  }, [])

  const handleUpdateMeta = (updates: Partial<LabelMeta>) => {
    if (!activeLabelId) return
    setLabelMetadata((prev) => ({
      ...prev,
      [activeLabelId]: {
        ...prev[activeLabelId],
        ...updates,
      },
    }))
    if (updates.name || updates.color) {
      setLabels((prev) =>
        prev.map((label) =>
          label.id === activeLabelId
            ? {
                ...label,
                name: updates.name ?? label.name,
                color: updates.color ?? label.color,
              }
            : label
        )
      )
      setAnnotations((prev) =>
        prev.map((rect) => {
          if (rect.labelId !== activeLabelId) return rect
          return {
            ...rect,
            labelName: updates.name ?? rect.labelName,
            color: updates.color ?? rect.color,
          }
        })
      )
    }
  }

  const handleAddTag = () => {
    if (!newTag.trim() || !activeMeta || !activeLabelId) return
    handleUpdateMeta({ tags: [...activeMeta.tags, newTag.trim()] })
    setNewTag("")
  }

  const handleAddLabel = () => {
    const nextIndex = labels.length + 1
    const id = `target${nextIndex}`
    const name = `target${nextIndex}`
    const color = theme.palette.accent1.dim

    setLabels((prev) => [...prev, { id, name, color }])
    setLabelMetadata((prev) => ({
      ...prev,
      [id]: { name, tags: [], color, notes: "" },
    }))
    setActiveLabelId(id)
  }

  const handleTogglePlay = () => {
    const video = videoRef.current
    if (!video) return
    if (video.paused) {
      video.play().catch((err) => {
        const message =
          err?.message ?? "Unable to play video. Unsupported source."
        setVideoUrlError(message)
      })
    } else {
      video.pause()
    }
  }

  const handleColorPickerOpen = (event: React.MouseEvent<HTMLElement>) => {
    setColorAnchorEl(event.currentTarget)
  }

  const handleColorPickerClose = () => {
    setColorAnchorEl(null)
  }

  const handleSliderChange = (_: Event, value: number | number[]) => {
    const nextValue = Array.isArray(value) ? value[0] : value
    const video = videoRef.current
    if (!video) return
    const max = video.duration || duration || 0
    setIsScrubbing(true)
    const clamped = max ? clamp(nextValue, 0, max) : Math.max(nextValue, 0)
    setCurrentTime(clamped)
    video.currentTime = clamped
  }

  const handleSliderCommit = (_: Event, value: number | number[]) => {
    const nextValue = Array.isArray(value) ? value[0] : value
    const video = videoRef.current
    if (!video) return
    const max = video.duration || duration || 0
    const clamped = max ? clamp(nextValue, 0, max) : Math.max(nextValue, 0)
    video.currentTime = clamped
    setCurrentTime(clamped)
    setIsScrubbing(false)
  }

  const handleJump = (delta: number) => {
    const video = videoRef.current
    if (!video) return
    const nextValue = clamp(video.currentTime + delta, 0, video.duration || 0)
    video.currentTime = nextValue
    setCurrentTime(nextValue)
  }

  const getRelativePoint = (
    event: React.MouseEvent<HTMLDivElement>
  ): Point | null => {
    if (!overlayRef.current) return null
    const rect = overlayRef.current.getBoundingClientRect()
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    }
  }

  const updateAnnotationKeyframe = (
    id: string,
    rect: RectShape,
    frame: number
  ) => {
    const keyframe: Keyframe = { ...rect, frame }
    setAnnotations((prev) =>
      prev.map((annotation) => {
        if (annotation.id !== id) return annotation
        const nextFrames = [...annotation.keyframes]
        const existingIndex = nextFrames.findIndex((kf) => kf.frame === frame)
        if (existingIndex >= 0) {
          nextFrames[existingIndex] = keyframe
        } else {
          nextFrames.push(keyframe)
        }
        return { ...annotation, keyframes: nextFrames }
      })
    )
  }

  const getHandleForRect = (point: Point, rect: RectShape): DragHandle => {
    const handleSize = 8
    const edgeThreshold = 6

    const isNear = (px: number, py: number) =>
      Math.abs(point.x - px) <= handleSize &&
      Math.abs(point.y - py) <= handleSize

    const left = rect.x
    const right = rect.x + rect.w
    const top = rect.y
    const bottom = rect.y + rect.h

    if (isNear(left, top)) return "nw"
    if (isNear(right, top)) return "ne"
    if (isNear(left, bottom)) return "sw"
    if (isNear(right, bottom)) return "se"

    if (
      Math.abs(point.y - top) <= edgeThreshold &&
      point.x >= left &&
      point.x <= right
    )
      return "n"
    if (
      Math.abs(point.y - bottom) <= edgeThreshold &&
      point.x >= left &&
      point.x <= right
    )
      return "s"
    if (
      Math.abs(point.x - left) <= edgeThreshold &&
      point.y >= top &&
      point.y <= bottom
    )
      return "w"
    if (
      Math.abs(point.x - right) <= edgeThreshold &&
      point.y >= top &&
      point.y <= bottom
    )
      return "e"

    if (
      point.x >= left &&
      point.x <= right &&
      point.y >= top &&
      point.y <= bottom
    )
      return "move"

    return null
  }

  const cursorForHandle = (handle: DragHandle) => {
    switch (handle) {
      case "nw":
      case "se":
        return "nwse-resize"
      case "ne":
      case "sw":
        return "nesw-resize"
      case "n":
      case "s":
        return "ns-resize"
      case "e":
      case "w":
        return "ew-resize"
      case "move":
        return "move"
      default:
        return activeLabel ? "crosshair" : "default"
    }
  }

  const findHoveredHandle = (point: Point) => {
    const currentFrame = timeToFrame(currentTime)
    const candidates = annotations
      .map((rect) => {
        const isSelected = rect.id === selectedAnnotationId
        const isActive = isActiveAtTime(rect, currentFrame)
        const display = isActive
          ? getInterpolatedRect(rect, currentFrame)
          : isSelected
            ? getLastKeyframeRect(rect, currentFrame)
            : null
        return display ? { rect, display } : null
      })
      .filter(
        (entry): entry is { rect: AnnotationRect; display: RectShape } =>
          !!entry
      )
    for (let i = candidates.length - 1; i >= 0; i -= 1) {
      const entry = candidates[i]
      if (!entry.display) continue
      const handle = getHandleForRect(point, entry.display)
      if (handle) return { rect: entry.rect, handle, display: entry.display }
    }
    return null
  }

  const handleOverlayMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const point = getRelativePoint(event)
    if (!point) return

    if (dragHandle && dragStartPoint && dragStartRect && selectedAnnotationId) {
      const dx = point.x - dragStartPoint.x
      const dy = point.y - dragStartPoint.y
      const boundsW = videoBounds.width
      const boundsH = videoBounds.height
      const minSize = 10

      let newRect = { ...dragStartRect }

      if (dragHandle === "move") {
        newRect.x = clamp(dragStartRect.x + dx, 0, boundsW - dragStartRect.w)
        newRect.y = clamp(dragStartRect.y + dy, 0, boundsH - dragStartRect.h)
      } else {
        let x = dragStartRect.x
        let y = dragStartRect.y
        let w = dragStartRect.w
        let h = dragStartRect.h

        if (dragHandle === "n" || dragHandle === "nw" || dragHandle === "ne") {
          y = clamp(
            dragStartRect.y + dy,
            0,
            dragStartRect.y + dragStartRect.h - minSize
          )
          h = dragStartRect.h + (dragStartRect.y - y)
        }
        if (dragHandle === "s" || dragHandle === "sw" || dragHandle === "se") {
          h = clamp(dragStartRect.h + dy, minSize, boundsH - dragStartRect.y)
        }
        if (dragHandle === "w" || dragHandle === "nw" || dragHandle === "sw") {
          x = clamp(
            dragStartRect.x + dx,
            0,
            dragStartRect.x + dragStartRect.w - minSize
          )
          w = dragStartRect.w + (dragStartRect.x - x)
        }
        if (dragHandle === "e" || dragHandle === "ne" || dragHandle === "se") {
          w = clamp(dragStartRect.w + dx, minSize, boundsW - dragStartRect.x)
        }

        newRect = { ...dragStartRect, x, y, w, h }
      }

      setDragPreview({ id: selectedAnnotationId, rect: newRect })
      return
    }

    if (isDrawing) {
      if (!startPoint || !currentRect) return
      setCurrentRect({
        ...currentRect,
        x: Math.min(startPoint.x, point.x),
        y: Math.min(startPoint.y, point.y),
        w: Math.abs(point.x - startPoint.x),
        h: Math.abs(point.y - startPoint.y),
      })
      return
    }

    const hit = findHoveredHandle(point)
    setHoverHandle(hit?.handle ?? null)
  }

  const handleOverlayMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
    const point = getRelativePoint(event)
    if (!point) return

    const hit = findHoveredHandle(point)
    if (hit && hit.display) {
      setSelectedAnnotationId(hit.rect.id)
      setDragHandle(hit.handle)
      setDragStartPoint(point)
      setDragStartRect(hit.display)
      return
    }

    if (!activeLabel) return

    setIsDrawing(true)
    setStartPoint(point)
    setCurrentRect({
      x: point.x,
      y: point.y,
      w: 0,
      h: 0,
      labelId: activeLabel.id,
      labelName: activeLabel.name,
      color: activeLabel.color,
    })
  }

  const handleOverlayMouseUp = (event: React.MouseEvent<HTMLDivElement>) => {
    if (dragHandle && selectedAnnotationId) {
      const rect = dragPreview?.rect
      if (rect) {
        updateAnnotationKeyframe(
          selectedAnnotationId,
          rect,
          timeToFrame(currentTime)
        )
      }
      setDragHandle(null)
      setDragStartPoint(null)
      setDragStartRect(null)
      setDragPreview(null)
      return
    }

    if (!isDrawing || !startPoint || !currentRect) return

    const point = getRelativePoint(event)
    if (!point) return

    const w = point.x - startPoint.x
    const h = point.y - startPoint.y
    const rect = {
      x: Math.min(startPoint.x, point.x),
      y: Math.min(startPoint.y, point.y),
      w: Math.abs(w),
      h: Math.abs(h),
    }

    const annotation: AnnotationRect = {
      id: `rect-${Date.now()}`,
      labelId: currentRect.labelId,
      labelName: currentRect.labelName,
      color: currentRect.color,
      keyframes: [{ ...rect, frame: timeToFrame(currentTime) }],
      activeKeyframes: [
        { frame: 0, active: false },
        { frame: timeToFrame(currentTime), active: true },
      ],
    }

    setAnnotations((prev) => [...prev, annotation])
    setSelectedAnnotationId(annotation.id)
    setCurrentRect(null)
    setStartPoint(null)
    setIsDrawing(false)

    console.log({
      label: annotation.labelName,
      x: rect.x,
      y: rect.y,
      w: rect.w,
      h: rect.h,
      timestamp: currentTime,
    })
  }

  const handleToggleAnnotation = (id: string) => {
    setAnnotations((prev) =>
      prev.map((rect) => {
        if (rect.id !== id) return rect
        const currentFrame = timeToFrame(currentTime)
        const currentActive = isActiveAtTime(rect, currentFrame)
        let nextKeyframes = rect.keyframes
        if (!currentActive) {
          const existing = rect.keyframes.find(
            (kf) => kf.frame === currentFrame
          )
          if (!existing) {
            const lastRect = getLastKeyframeRect(rect, currentFrame)
            if (lastRect) {
              nextKeyframes = [
                ...rect.keyframes,
                { ...lastRect, frame: currentFrame },
              ]
            }
          }
        }
        const nextFrames = [
          ...rect.activeKeyframes,
          { frame: currentFrame, active: !currentActive },
        ]
        return {
          ...rect,
          activeKeyframes: nextFrames,
          keyframes: nextKeyframes,
        }
      })
    )
  }

  const handleDeleteAnnotation = (id: string) => {
    setAnnotations((prev) => prev.filter((rect) => rect.id !== id))
    if (selectedAnnotationId === id) {
      setSelectedAnnotationId(null)
      setDragHandle(null)
      setDragStartPoint(null)
      setDragStartRect(null)
      setDragPreview(null)
    }
  }

  const statusDisplay = (status: string) => {
    if (status === "new") {
      return { color: "#e53935", symbol: "!" }
    }
    if (status === "review") {
      return { color: "#f9a825", symbol: "?" }
    }
    return { color: "#43a047", symbol: "✓" }
  }

  const isVideoPlaying = videoRef.current ? !videoRef.current.paused : false
  const currentFrame = timeToFrame(currentTime)
  const isEditingBox = Boolean(dragHandle)
  const activeNotes = notes.filter(
    (note) =>
      currentFrame >= note.frame &&
      currentFrame < note.frame + NOTE_DURATION_FRAMES
  )
  const isCommitDisabled =
    isSavingDraft || !annotationSetId || !resolvedDatasetItemId
  const accentButtonSx = {
    borderColor: theme.palette.accent1.vibrant,
    color: theme.palette.accent1.vibrant,
    "&:hover": { backgroundColor: theme.palette.accent1.dim },
  }

  const handleAddNote = () => {
    if (!noteDraft.trim() || !selectedAnnotationId) return
    const target = annotations.find((rect) => rect.id === selectedAnnotationId)
    if (!target) return
    const display = getInterpolatedRect(target, currentFrame)
    if (!display) return
    const anchorX = clamp(
      display.x + display.w + NOTE_OFFSET,
      0,
      videoBounds.width
    )
    const anchorY = clamp(display.y, 0, videoBounds.height)

    setNotes((prev) => [
      ...prev,
      {
        id: `note-${Date.now()}`,
        frame: currentFrame,
        text: noteDraft.trim(),
        anchorX,
        anchorY,
      },
    ])
    setNoteDraft("")
  }

  const buildDraftPayload = () => ({
    datasetId: datasetId ?? null,
    datasetItemId: resolvedDatasetItemId ?? null,
    fileId: selectedFileId ?? null,
    videoUrl,
    labels,
    labelMetadata,
    annotations,
    notes,
    fps: effectiveFps,
    duration,
    savedAt: new Date().toISOString(),
  })

  const handleCommitAnnotations = async () => {
    if (!annotationSetId || !resolvedDatasetItemId) {
      setSaveError("Missing annotationSetId or datasetItemId for this session.")
      setSaveSuccess(null)
      return
    }

    setIsSavingDraft(true)
    setSaveError(null)
    setSaveSuccess(null)

    const response = await GraphQLClient.mutate<{
      upsertAnnotationDraft: { id: string; status: string }
    }>(UPSERT_ANNOTATION_DRAFT_MUTATION, ServicePort.GRAPHQL, {
      variables: {
        input: {
          annotationSetId: annotationSetId,
          datasetItemId: resolvedDatasetItemId,
          payload: buildDraftPayload(),
          status: "COMMITTED",
        },
      },
    })

    if (!response.success || !response.data?.upsertAnnotationDraft) {
      const message =
        response.errors?.[0]?.message ?? "Failed to save annotation draft."
      setSaveError(message)
      setIsSavingDraft(false)
      return
    }

    setSaveSuccess(`Saved draft ${response.data.upsertAnnotationDraft.id}.`)
    setIsSavingDraft(false)
  }

  return (
    <Box
      sx={{
        height: contentHeight,
        padding: 0,
        backgroundColor: theme.palette.background.paper,
        display: "flex",
        flexDirection: "column",
        gap: 1,
      }}
    >
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            md: "300px minmax(0, 1fr) 360px",
          },
          gap: theme.custom.spacing.xs,
          flex: 1,
          minHeight: 0,
        }}
      >
        <Box
          sx={{
            borderRight: `1px solid ${theme.palette.divider}`,
            display: "flex",
            flexDirection: "column",
            minHeight: 0,
          }}
        >
          <Box sx={{ px: 2, pt: 2 }}>
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: theme.custom.font.weight.medium, mb: 1 }}
            >
              Files
            </Typography>
            <TextField
              placeholder="Search files"
              size="small"
              fullWidth
              sx={{ mb: 2 }}
            />
          </Box>
          <Box sx={{ overflow: "auto", minHeight: 0, flex: 1 }}>
            {datasetFiles.map((file, index) => {
              const status = statusDisplay(file.status)
              const isActive = file.id === selectedFileId
              return (
                <Box
                  key={file.id}
                  onClick={() => setSelectedFileId(file.id)}
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "24px 1fr",
                    alignItems: "center",
                    gap: 1,
                    p: 1.5,
                    cursor: "pointer",
                    backgroundColor: isActive
                      ? theme.palette.action.selected
                      : "transparent",
                    borderBottom:
                      index < datasetFiles.length - 1
                        ? `1px solid ${theme.palette.divider}`
                        : "none",
                  }}
                >
                  <Box
                    sx={{
                      width: 20,
                      height: 20,
                      borderRadius: "50%",
                      backgroundColor: status.color,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#fff",
                      fontWeight: 700,
                      fontSize: theme.custom.font.size.xs,
                    }}
                  >
                    {status.symbol}
                  </Box>
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: theme.custom.font.weight.medium }}
                  >
                    {file.name}
                  </Typography>
                </Box>
              )
            })}
          </Box>
        </Box>

        <Box
          sx={{
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: theme.custom.radii.xs,
            backgroundColor: theme.palette.background.paper,
            boxShadow: theme.palette.boxShadow.light,
            p: 2,
            mt: 2,
            mb: 2,
            display: "flex",
            flexDirection: "column",
            minHeight: 0,
            gap: 2,
          }}
        >
          <Stack spacing={1}>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <Typography
                variant="subtitle1"
                sx={{ fontWeight: theme.custom.font.weight.medium }}
              >
                Labels
              </Typography>
              <Button
                variant="outlined"
                onClick={handleAddLabel}
                sx={accentButtonSx}
              >
                Add Label
              </Button>
            </Stack>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              {labels.map((label) => (
                <Chip
                  key={label.id}
                  label={label.name}
                  onClick={() => setActiveLabelId(label.id)}
                  sx={{
                    backgroundColor:
                      label.id === activeLabelId ? label.color : "transparent",
                    color:
                      label.id === activeLabelId
                        ? theme.palette.getContrastText(label.color)
                        : theme.palette.text.primary,
                    border: `1px solid ${label.color}`,
                    fontWeight: theme.custom.font.weight.medium,
                  }}
                />
              ))}
            </Stack>
          </Stack>

          <Box
            sx={{
              flex: 1,
              minHeight: 0,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Typography
              variant="subtitle2"
              sx={{ mb: 1, fontWeight: theme.custom.font.weight.medium }}
            >
              {selectedFile?.name ?? "Select a file"}
            </Typography>
            <Box
              ref={videoContainerRef}
              sx={{
                position: "relative",
                borderRadius: theme.custom.radii.xs,
                overflow: "hidden",
                border: `1px solid ${theme.palette.divider}`,
                backgroundColor: theme.palette.background.default,
                flex: 1,
                minHeight: 0,
              }}
            >
              <video
                ref={videoRef}
                src={videoUrl}
                onLoadedMetadata={(event) => {
                  const video = event.currentTarget
                  setDuration(video.duration || 0)
                  updateVideoBounds()
                }}
                onError={() => {
                  setVideoUrlError(
                    "Unable to load video source. Check signed URL or bucket CORS."
                  )
                }}
                onTimeUpdate={(event) => {
                  const video = event.currentTarget
                  if (!Number.isFinite(duration) || duration === 0) {
                    setDuration(video.duration || 0)
                  }
                  if (!isScrubbing)
                    setCurrentTime(video.currentTime)
                }}
                style={{ width: "100%", height: "100%", objectFit: "contain" }}
              />
              <Box
                ref={overlayRef}
                onMouseDown={handleOverlayMouseDown}
                onMouseMove={handleOverlayMouseMove}
                onMouseUp={handleOverlayMouseUp}
                sx={{
                  position: "absolute",
                  left: videoBounds.left,
                  top: videoBounds.top,
                  width: videoBounds.width,
                  height: videoBounds.height,
                  cursor: cursorForHandle(hoverHandle),
                }}
              >
                {annotations.map((rect) => {
                  const isSelected = rect.id === selectedAnnotationId
                  const isActive = isActiveAtTime(rect, currentFrame)
                  const preview =
                    dragPreview?.id === rect.id ? dragPreview.rect : null
                  const display =
                    preview ??
                    (isActive
                      ? getInterpolatedRect(rect, currentFrame)
                      : isSelected
                        ? getLastKeyframeRect(rect, currentFrame)
                        : null)
                  if (!display) return null
                  const boxColor = isActive
                    ? rect.color
                    : theme.palette.grey[600]
                  return (
                    <Box
                      key={rect.id}
                      sx={{
                        position: "absolute",
                        left: display.x,
                        top: display.y,
                        width: display.w,
                        height: display.h,
                        border: `2px solid ${boxColor}`,
                      }}
                    >
                      <Box
                        sx={{
                          position: "absolute",
                          top: -18,
                          left: 0,
                          px: 0.5,
                          py: 0.25,
                          borderRadius: theme.custom.radii.xs,
                          backgroundColor: boxColor,
                          color: theme.palette.getContrastText(boxColor),
                          fontSize: theme.custom.font.size.xs,
                          fontWeight: theme.custom.font.weight.medium,
                        }}
                      >
                        {isActive
                          ? rect.labelName
                          : `${rect.labelName} · inactive`}
                      </Box>
                    </Box>
                  )
                })}
                {currentRect && (
                  <Box
                    sx={{
                      position: "absolute",
                      left: currentRect.x,
                      top: currentRect.y,
                      width: currentRect.w,
                      height: currentRect.h,
                      border: `2px dashed ${currentRect.color}`,
                      backgroundColor: "rgba(0,0,0,0.05)",
                    }}
                  >
                    <Box
                      sx={{
                        position: "absolute",
                        top: -18,
                        left: 0,
                        px: 0.5,
                        py: 0.25,
                        borderRadius: theme.custom.radii.xs,
                        backgroundColor: currentRect.color,
                        color: theme.palette.getContrastText(currentRect.color),
                        fontSize: theme.custom.font.size.xs,
                        fontWeight: theme.custom.font.weight.medium,
                      }}
                    >
                      {currentRect.labelName}
                    </Box>
                  </Box>
                )}
                {!isEditingBox &&
                  activeNotes.map((note) => (
                    <Box
                      key={note.id}
                      sx={{
                        position: "absolute",
                        left: clamp(note.anchorX, 0, videoBounds.width - 160),
                        top: clamp(note.anchorY, 0, videoBounds.height - 60),
                        maxWidth: 160,
                        p: 0.75,
                        borderRadius: theme.custom.radii.xs,
                        backgroundColor: theme.palette.background.paper,
                        boxShadow: theme.palette.boxShadow.light,
                        border: `1px solid ${theme.palette.divider}`,
                      }}
                    >
                      <Typography variant="caption" color="text.secondary">
                        Note @ {formatTime(note.frame / FPS)}
                      </Typography>
                      <Typography variant="body2">{note.text}</Typography>
                    </Box>
                  ))}
              </Box>
            </Box>
            <Stack spacing={1} sx={{ mt: 1 }}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <IconButton onClick={handleTogglePlay}>
                  {isVideoPlaying ? <PauseIcon /> : <PlayArrowIcon />}
                </IconButton>
                <Typography variant="caption" sx={{ minWidth: 42 }}>
                  {formatTime(currentTime)}
                </Typography>
                <Slider
                  value={currentTime}
                  min={0}
                  max={duration || videoRef.current?.duration || 1}
                  step={0.1}
                  onChange={handleSliderChange}
                  onChangeCommitted={handleSliderCommit}
                  sx={{
                    flex: 1,
                    color: theme.palette.accent1.vibrant,
                    "& .MuiSlider-thumb": {
                      backgroundColor: theme.palette.accent1.vibrant,
                    },
                    "& .MuiSlider-track": {
                      backgroundColor: theme.palette.accent1.vibrant,
                    },
                    "& .MuiSlider-rail": {
                      opacity: 0.2,
                    },
                  }}
                />
                <Typography variant="caption" sx={{ minWidth: 42 }}>
                  {formatTime(duration)}
                </Typography>
              </Stack>
              <Stack direction="row" spacing={1} flexWrap="wrap">
                <Button
                  variant="outlined"
                  onClick={() => handleJump(-5)}
                  sx={accentButtonSx}
                >
                  -5s
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => handleJump(5)}
                  sx={accentButtonSx}
                >
                  +5s
                </Button>
              </Stack>
              {videoUrlError && (
                <Typography variant="caption" color="error">
                  {videoUrlError}
                </Typography>
              )}
            </Stack>
          </Box>
        </Box>

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
                  {activeLabel?.name ?? "None"}
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
                <TextField
                  fullWidth
                  size="small"
                  value={activeMeta?.name ?? ""}
                  onChange={(event) =>
                    handleUpdateMeta({ name: event.target.value })
                  }
                  sx={{
                    "& .MuiInputBase-root": {
                      py: 0.3,
                      fontSize: theme.custom.font.size.sm,
                      minHeight: 36,
                    },
                  }}
                />
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
                    onClick={handleColorPickerOpen}
                    sx={{
                      width: 26,
                      height: 26,
                      borderRadius: "50%",
                      backgroundColor:
                        activeMeta?.color ?? theme.palette.divider,
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
                  onClose={handleColorPickerClose}
                  anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
                  transformOrigin={{ vertical: "top", horizontal: "left" }}
                >
                  <Box sx={{ p: 1 }}>
                    <input
                      type="color"
                      value={activeMeta?.color ?? theme.palette.accent1.vibrant}
                      onChange={(event) =>
                        handleUpdateMeta({ color: event.target.value })
                      }
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
                    onChange={(event) => setNewTag(event.target.value)}
                    sx={{
                      "& .MuiInputBase-root": {
                        py: 0.3,
                        fontSize: theme.custom.font.size.sm,
                        minHeight: 34,
                      },
                    }}
                  />
                  <Button
                    variant="outlined"
                    onClick={handleAddTag}
                    sx={accentButtonSx}
                  >
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
                    onChange={(event) => setNoteDraft(event.target.value)}
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
                    onClick={handleAddNote}
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
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => console.log("Annotations JSON:", annotations)}
                  sx={{ mb: 1 }}
                >
                  Dev: Log annotations
                </Button>
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
                        <Typography variant="body2">
                          {rect.labelName}
                        </Typography>
                      </Stack>
                      <Stack direction="row" spacing={1}>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => handleToggleAnnotation(rect.id)}
                          sx={accentButtonSx}
                        >
                          {isActiveAtTime(rect, timeToFrame(currentTime))
                            ? "Active"
                            : "Inactive"}
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          color="error"
                          onClick={() => handleDeleteAnnotation(rect.id)}
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
            onClick={handleCommitAnnotations}
            disabled={isCommitDisabled}
            sx={{ ...accentButtonSx, mt: 2 }}
          >
            {isSavingDraft ? "Saving..." : "Commit Annotations"}
          </Button>
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
      </Box>
    </Box>
  )
}

export default DatasetLabelerPage
