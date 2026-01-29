import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"
import {
  Box,
  Button,
  Chip,
  IconButton,
  Slider,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material"
import { useTheme } from "@mui/material/styles"
import PlayArrowIcon from "@mui/icons-material/PlayArrow"
import PauseIcon from "@mui/icons-material/Pause"
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline"
import { useLoaderData, useLocation, useParams } from "react-router-dom"
import { GraphQLClient } from "../graphql/GraphQLClient"
import { ServicePort } from "../utility/constants/serviceConstants"
import { UPSERT_ANNOTATION_DRAFT_MUTATION } from "../graphql/mutation/annotationDraft"
import { GET_OR_CREATE_ANNOTATION_SET_MUTATION } from "../graphql/mutation/annotationSet"
import { COMMIT_ANNOTATION_DRAFT_MUTATION } from "../graphql/mutation/annotationCommit"
import { FILE_SIGNED_URL_QUERY } from "../graphql/query/fileQuery"
import { ANNOTATION_DRAFT_QUERY } from "../graphql/query/annotationDraft"
import LabelerDetailsPanel from "../components/functional/labeler/LabelerDetailsPanel"
import LabelerFileListPanel from "../components/functional/labeler/LabelerFileListPanel"
import LabelerTimeline from "../components/functional/labeler/LabelerTimeline"
import {
  FPS,
  clamp,
  formatTime,
  getActiveSegments,
  getInterpolatedRect,
  getLastKeyframeRect,
  getSegmentState,
  getTimelineTickInterval,
  isActiveAtTime,
  isNormalizedRect,
  timeToFrame,
} from "../utils/labeler/labelerUtils"
import type {
  ActiveKeyframe,
  AnnotationRect,
  DatasetLabelerFile,
  DatasetLabelerLoaderData,
  DragHandle,
  LabelMeta,
  NoteEntry,
  Point,
  RectShape,
  TimelinePoint,
  VideoBounds,
} from "../types/labeler/labelerTypes"

const sampleVideoUrl =
  "https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"

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
  const [displayTime, setDisplayTime] = useState(0)
  const [isScrubbing, setIsScrubbing] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
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
  useEffect(() => {
    setInterpolationKeyframesByAnnotation((prev) => {
      if (annotations.length === 0) return prev
      const next = { ...prev }
      let mutated = false
      annotations.forEach((rect) => {
        if (!Array.isArray(next[rect.id])) {
          next[rect.id] = [{ frame: 0, active: false }]
          mutated = true
        }
      })
      return mutated ? next : prev
    })
  }, [annotations])
  const [pendingEdits, setPendingEdits] = useState<
    Record<string, { frame: number; rect: RectShape }>
  >({})
  const [notes, setNotes] = useState<NoteEntry[]>([])
  const [noteDraft, setNoteDraft] = useState("")
  const [labelNameDraft, setLabelNameDraft] = useState("")
  const [colorAnchorEl, setColorAnchorEl] = useState<HTMLElement | null>(null)
  const isColorPickerOpen = Boolean(colorAnchorEl)
  const [isSavingDraft, setIsSavingDraft] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null)
  const [isAutosaving, setIsAutosaving] = useState(false)
  const lastAutosavePayloadRef = useRef<string | null>(null)
  const [autosaveTick, setAutosaveTick] = useState(0)
  const [isHydratingDraft, setIsHydratingDraft] = useState(false)
  const [draftStatus, setDraftStatus] = useState<string | null>(null)
  const [draftSource, setDraftSource] = useState<"draft" | "committed" | null>(
    null
  )
  const [draftFps, setDraftFps] = useState<number | null>(null)
  const [interpolationKeyframesByAnnotation, setInterpolationKeyframesByAnnotation] =
    useState<Record<string, ActiveKeyframe[]>>(() => ({}))
  const [selectedTimelinePoint, setSelectedTimelinePoint] = useState<{
    annotationId: string
    frame: number
    type: "keyframe" | "toggle" | "interpolation"
  } | null>(null)
  const [videoUrl, setVideoUrl] = useState(sampleVideoUrl)
  const [videoUrlError, setVideoUrlError] = useState<string | null>(null)
  const [annotationSetId, setAnnotationSetId] = useState<string | null>(
    annotationSetIdParam
  )
  const lastSelectedFileIdRef = useRef<string | null>(null)

  const filesById = useMemo(
    () => new Map(datasetFiles.map((file) => [file.id, file])),
    [datasetFiles]
  )
  const selectedFile = selectedFileId ? filesById.get(selectedFileId) : undefined
  const resolvedDatasetItemId =
    selectedFile?.datasetItemId ?? selectedDatasetItemIdOverride ?? null
  const activeLabel = labels.find((label) => label.id === activeLabelId)
  const activeMeta = activeLabelId ? labelMetadata[activeLabelId] : undefined
  useEffect(() => {
    setLabelNameDraft(activeMeta?.name ?? "")
  }, [activeLabelId, activeMeta?.name])

  const contentHeight = `calc(100vh - ${theme.custom.component.header.height}px)`
  const videoInspect = selectedFile?.meta?.video?.inspect
  const metaDuration = Number(videoInspect?.duration_seconds)
  const metaFps = Number(videoInspect?.fps)
  const effectiveDuration = Number.isFinite(metaDuration) ? metaDuration : null
  const safeDraftFps =
    typeof draftFps === "number" && Number.isFinite(draftFps)
      ? draftFps
      : null
  const safeMetaFps = Number.isFinite(metaFps) ? metaFps : null
  const effectiveFps = safeDraftFps ?? safeMetaFps ?? FPS
  const resetLabelerState = useCallback(() => {
    const baseLabel = {
      id: "default1",
      name: "Default Label 1",
      color: theme.palette.accent1.vibrant,
    }
    setLabels([baseLabel])
    setLabelMetadata({
      [baseLabel.id]: {
        name: baseLabel.name,
        tags: ["person"],
        color: baseLabel.color,
        notes: "",
      },
    })
    setActiveLabelId(baseLabel.id)
    setLabelNameDraft(baseLabel.name)
    setAnnotations([])
    setNotes([])
    setNewTag("")
    setNoteDraft("")
    setSelectedAnnotationId(null)
    setDragHandle(null)
    setDragStartPoint(null)
    setDragStartRect(null)
    setDragPreview(null)
    setPendingEdits({})
    setInterpolationKeyframesByAnnotation({})
    setDraftFps(null)
    setDraftSource(null)
    setDraftStatus(null)
    setSaveError(null)
    setSaveSuccess(null)
    setIsSavingDraft(false)
    setIsAutosaving(false)
    setCurrentTime(0)
    setDisplayTime(0)
    setDuration(0)
    lastAutosavePayloadRef.current = null
  }, [theme.palette.accent1.vibrant])
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
    if (!selectedFileId) return
    if (lastSelectedFileIdRef.current === selectedFileId) return
    lastSelectedFileIdRef.current = selectedFileId
    resetLabelerState()
  }, [resetLabelerState, selectedFileId])

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

  const normalizeRect = (rect: RectShape): RectShape => {
    if (isNormalizedRect(rect)) return rect
    if (!videoBounds.width || !videoBounds.height) return rect
    return {
      x: rect.x / videoBounds.width,
      y: rect.y / videoBounds.height,
      w: rect.w / videoBounds.width,
      h: rect.h / videoBounds.height,
    }
  }

  const toDisplayRect = (rect: RectShape): RectShape => {
    if (!isNormalizedRect(rect) || !videoBounds.width || !videoBounds.height) {
      return rect
    }
    return {
      x: rect.x * videoBounds.width,
      y: rect.y * videoBounds.height,
      w: rect.w * videoBounds.width,
      h: rect.h * videoBounds.height,
    }
  }

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const handleLoaded = () => {
      setDuration(video.duration || 0)
      setDisplayTime(video.currentTime || 0)
      updateVideoBounds()
    }
    const handleTimeUpdate = () => {
      if (!isScrubbing) {
        setCurrentTime(video.currentTime)
        setDisplayTime(video.currentTime)
      }
    }
    const handlePlay = () => {
      setIsPlaying(true)
    }
    const handlePause = () => {
      setIsPlaying(false)
      if (!isScrubbing) {
        setDisplayTime(video.currentTime)
      }
    }

    video.addEventListener("loadedmetadata", handleLoaded)
    video.addEventListener("timeupdate", handleTimeUpdate)
    video.addEventListener("play", handlePlay)
    video.addEventListener("pause", handlePause)
    video.addEventListener("ended", handlePause)
    return () => {
      video.removeEventListener("loadedmetadata", handleLoaded)
      video.removeEventListener("timeupdate", handleTimeUpdate)
      video.removeEventListener("play", handlePlay)
      video.removeEventListener("pause", handlePause)
      video.removeEventListener("ended", handlePause)
    }
  }, [isScrubbing])

  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    if (isScrubbing) return

    let rafId: number | null = null
    let intervalId: number | null = null

    const updateTime = () => {
      if (isScrubbing) return
      const nextTime = video.currentTime
      setCurrentTime(nextTime)
      setDisplayTime(nextTime)
    }

    const videoWithCallback = video as HTMLVideoElement & {
      requestVideoFrameCallback?: (callback: () => void) => number
      cancelVideoFrameCallback?: (handle: number) => void
    }

    if (videoWithCallback.requestVideoFrameCallback) {
      const tick = () => {
        updateTime()
        rafId = videoWithCallback.requestVideoFrameCallback!(tick)
      }
      rafId = videoWithCallback.requestVideoFrameCallback(tick)
    } else {
      intervalId = window.setInterval(updateTime, 50)
    }

    return () => {
      if (rafId !== null && videoWithCallback.cancelVideoFrameCallback) {
        videoWithCallback.cancelVideoFrameCallback(rafId)
      } else if (rafId !== null) {
        window.cancelAnimationFrame(rafId)
      }
      if (intervalId !== null) window.clearInterval(intervalId)
    }
  }, [isScrubbing, videoUrl])

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
    queueAutosave()
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
    setDisplayTime(clamped)
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
    setDisplayTime(clamped)
    setIsScrubbing(false)
  }

  const handleJump = (delta: number) => {
    const video = videoRef.current
    if (!video) return
    const nextValue = clamp(video.currentTime + delta, 0, video.duration || 0)
    video.currentTime = nextValue
    setCurrentTime(nextValue)
    setDisplayTime(nextValue)
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
    frame: number,
    overwriteSegment: boolean = false
  ) => {
    if (!videoBounds.width || !videoBounds.height) return
    const normalizedRect = normalizeRect(rect)
    const keyframe = { ...normalizedRect, frame }
    setAnnotations((prev) =>
      prev.map((annotation) => {
        if (annotation.id !== id) return annotation
        let nextFrames = [...annotation.keyframes]
        if (overwriteSegment) {
          const segment = getSegmentState(annotation.activeKeyframes, frame)
          nextFrames = nextFrames.filter(
            (kf) =>
              kf.frame === frame ||
              kf.frame < segment.startFrame ||
              kf.frame > segment.endFrame
          )
        }
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

  const updateAnnotationWithoutNewKeyframe = (
    id: string,
    rect: RectShape,
    frame: number
  ) => {
    if (!videoBounds.width || !videoBounds.height) return
    const normalizedRect = normalizeRect(rect)
    setAnnotations((prev) =>
      prev.map((annotation) => {
        if (annotation.id !== id) return annotation
        if (annotation.keyframes.length === 0) return annotation
        const hasKeyframe = annotation.keyframes.some((kf) => kf.frame === frame)
        if (!hasKeyframe) return annotation
        const nextFrames = annotation.keyframes.map((kf) =>
          kf.frame === frame ? { ...normalizedRect, frame } : kf
        )
        return { ...annotation, keyframes: nextFrames }
      })
    )
  }

  const addKeyframeForAnnotation = (annotationId: string, frame: number) => {
    if (!videoBounds.width || !videoBounds.height) return
    const pending = pendingEdits[annotationId]
    setAnnotations((prev) =>
      prev.map((annotation) => {
        if (annotation.id !== annotationId) return annotation
        const rect =
          pending && pending.frame === frame
            ? pending.rect
            : getInterpolatedRect(annotation, frame) ??
              getLastKeyframeRect(annotation, frame)
        if (!rect) return annotation
        const normalizedRect = normalizeRect(rect)
        const nextFrames = [...annotation.keyframes]
        const existingIndex = nextFrames.findIndex((kf) => kf.frame === frame)
        if (existingIndex >= 0) {
          nextFrames[existingIndex] = { ...normalizedRect, frame }
        } else {
          nextFrames.push({ ...normalizedRect, frame })
        }
        return { ...annotation, keyframes: nextFrames }
      })
    )
    if (pending && pending.frame === frame) {
      setPendingEdits((prev) => {
        const next = { ...prev }
        delete next[annotationId]
        return next
      })
    }
  }

  const addKeyframeForLabel = () => {
    if (!activeLabelId) return
    const frame = currentFrame
    const target =
      labelAnnotations.find((rect) => rect.id === selectedAnnotationId) ??
      labelAnnotations[0]
    if (!target) return
    addKeyframeForAnnotation(target.id, frame)
    queueAutosave()
  }

  const toggleInterpolationAtCurrentFrame = () => {
    const targetId =
      selectedAnnotationId ??
      (activeLabelId
        ? annotations.find((rect) => rect.labelId === activeLabelId)?.id ?? null
        : null)
    if (!targetId) return
    const frame = currentFrame
    const keyframes = interpolationKeyframesByAnnotation[targetId] ?? [
      { frame: 0, active: false },
    ]
    const currentState = getSegmentState(keyframes, frame).active
    const nextFrames = keyframes.filter((kf) => kf.frame !== frame)
    nextFrames.push({ frame, active: !currentState })
    setInterpolationKeyframesByAnnotation((prev) => ({
      ...prev,
      [targetId]: nextFrames,
    }))
    addKeyframeForAnnotation(targetId, frame)
    queueAutosave()
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
    const currentFrame = timeToFrame(currentTime, effectiveFps)
    const candidates = annotations
      .map((rect) => {
        const isSelected = rect.id === selectedAnnotationId
        const isActive = isActiveAtTime(rect, currentFrame)
        const pending =
          pendingEdits[rect.id]?.frame === currentFrame
            ? pendingEdits[rect.id].rect
            : null
        const display = isActive
          ? pending ?? getInterpolatedRect(rect, currentFrame)
          : isSelected
            ? pending ?? getLastKeyframeRect(rect, currentFrame)
            : null
        return display ? { rect, display: toDisplayRect(display) } : null
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
      setActiveLabelId(hit.rect.labelId)
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
        const frame = timeToFrame(currentTime, effectiveFps)
        const target = annotations.find((item) => item.id === selectedAnnotationId)
        const hasKeyframe = Boolean(
          target?.keyframes.some((kf) => kf.frame === frame)
        )
        if (hasKeyframe) {
          updateAnnotationWithoutNewKeyframe(selectedAnnotationId, rect, frame)
        } else {
          setPendingEdits((prev) => ({
            ...prev,
            [selectedAnnotationId]: { frame, rect },
          }))
        }
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

    if (!videoBounds.width || !videoBounds.height) {
      setIsDrawing(false)
      setCurrentRect(null)
      setStartPoint(null)
      return
    }

    const annotation: AnnotationRect = {
      id: `rect-${Date.now()}`,
      labelId: currentRect.labelId,
      labelName: currentRect.labelName,
      color: currentRect.color,
      keyframes: [
        { ...normalizeRect(rect), frame: currentFrame },
      ],
      activeKeyframes: [
        { frame: 0, active: false },
        { frame: currentFrame, active: true },
      ],
    }

    setAnnotations((prev) => [...prev, annotation])
    setInterpolationKeyframesByAnnotation((prev) => ({
      ...prev,
      [annotation.id]: [{ frame: 0, active: false }],
    }))
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
        const currentFrame = timeToFrame(currentTime, effectiveFps)
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
        } else {
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
    queueAutosave()
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

  const isVideoPlaying = videoRef.current ? !videoRef.current.paused : false
  const currentFrame = timeToFrame(currentTime, effectiveFps)
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

  const labelAnnotations = activeLabelId
    ? annotations.filter((rect) => rect.labelId === activeLabelId)
    : []
  const durationFrames = Math.max(timeToFrame(duration, effectiveFps), 0)
  const selectedById = annotations.find((rect) => rect.id === selectedAnnotationId)
  const selectedTimelineAnnotation =
    selectedById && (!activeLabelId || selectedById.labelId === activeLabelId)
      ? selectedById
      : labelAnnotations[0]
  const activeLabelInterpolation = selectedTimelineAnnotation
    ? Array.isArray(
        interpolationKeyframesByAnnotation[selectedTimelineAnnotation.id]
      )
      ? getSegmentState(
          interpolationKeyframesByAnnotation[selectedTimelineAnnotation.id],
          currentFrame
        ).active
      : false
    : false
  const labelActiveSegments = selectedTimelineAnnotation
    ? getActiveSegments(selectedTimelineAnnotation.activeKeyframes, durationFrames)
    : []
  const timelinePoints = selectedTimelineAnnotation
    ? [
        ...selectedTimelineAnnotation.keyframes.map((kf) => ({
          annotationId: selectedTimelineAnnotation.id,
          frame: kf.frame,
          type: "keyframe" as const,
        })),
        ...selectedTimelineAnnotation.activeKeyframes.map((kf) => ({
          annotationId: selectedTimelineAnnotation.id,
          frame: kf.frame,
          type: "toggle" as const,
          active: kf.active,
        })),
      ]
    : []
  const interpolationPoints = selectedTimelineAnnotation
    ? (interpolationKeyframesByAnnotation[selectedTimelineAnnotation.id] ?? []).map(
        (kf) => ({
          annotationId: selectedTimelineAnnotation.id,
          frame: kf.frame,
          type: "interpolation" as const,
          active: kf.active,
        })
      )
    : []
  const timelineTicks = duration
    ? Array.from(
        { length: Math.floor(duration / getTimelineTickInterval(duration)) + 1 },
        (_, idx) => idx * getTimelineTickInterval(duration)
      ).filter((value) => value > 0 && value < duration)
    : []

  useEffect(() => {
    if (!activeLabelId) return
    if (
      selectedAnnotationId &&
      annotations.some(
        (rect) => rect.id === selectedAnnotationId && rect.labelId === activeLabelId
      )
    ) {
      return
    }
    const next = annotations.find((rect) => rect.labelId === activeLabelId)
    setSelectedAnnotationId(next?.id ?? null)
  }, [activeLabelId, annotations, selectedAnnotationId])

  useEffect(() => {
    setPendingEdits((prev) => {
      if (Object.keys(prev).length === 0) return prev
      const next = { ...prev }
      Object.keys(next).forEach((id) => {
        if (next[id].frame !== currentFrame) {
          delete next[id]
        }
      })
      return next
    })
  }, [currentFrame])

  const handleTimelinePointSelect = (
    point: {
      annotationId: string
      frame: number
      type: "keyframe" | "toggle" | "interpolation"
    },
    timeSeconds: number
  ) => {
    const video = videoRef.current
    if (video) {
      video.currentTime = timeSeconds
    }
    setCurrentTime(timeSeconds)
    if (point.type !== "interpolation") {
      setSelectedAnnotationId(point.annotationId)
    }
    setSelectedTimelinePoint(point)
  }

  const handleDeleteTimelinePoint = () => {
    if (!selectedTimelinePoint) return
    const { annotationId, frame, type } = selectedTimelinePoint
    if (type === "interpolation") {
      if (!activeLabelId) return
      setInterpolationKeyframesByLabel((prev) => ({
        ...prev,
        [activeLabelId]: (prev[activeLabelId] ?? []).filter(
          (kf) => kf.frame !== frame
        ),
      }))
      setSelectedTimelinePoint(null)
      return
    }
    setAnnotations((prev) =>
      prev.map((rect) => {
        if (rect.id !== annotationId) return rect
        if (type === "keyframe") {
          return {
            ...rect,
            keyframes: rect.keyframes.filter((kf) => kf.frame !== frame),
          }
        }
        return {
          ...rect,
          activeKeyframes: rect.activeKeyframes.filter((kf) => kf.frame !== frame),
        }
      })
    )
    setSelectedTimelinePoint(null)
  }

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!event.ctrlKey || !event.shiftKey) return
      if (event.key.toLowerCase() !== "k") return
      event.preventDefault()
      addKeyframeForLabel()
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [addKeyframeForLabel])

  const handleAddNote = () => {
    if (!noteDraft.trim() || !selectedAnnotationId) return
    const target = annotations.find((rect) => rect.id === selectedAnnotationId)
    if (!target) return
    const rawDisplay = getInterpolatedRect(target, currentFrame)
    const display = rawDisplay ? toDisplayRect(rawDisplay) : null
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
    queueAutosave()
  }

  const buildDraftPayload = (savedAt?: string) => ({
    datasetId: datasetId ?? null,
    datasetItemId: resolvedDatasetItemId ?? null,
    fileId: selectedFileId ?? null,
    videoUrl,
    labels,
    labelMetadata,
    annotations,
    notes,
    activeLabelId,
    fps: effectiveFps,
    duration,
    ...(savedAt ? { savedAt } : {}),
    interpolationKeyframesByAnnotation,
  })

  const applyDraftPayload = (payload: any) => {
    if (!payload || typeof payload !== "object") return
    if (Array.isArray(payload.labels)) {
      setLabels(payload.labels)
      if (!payload.activeLabelId && payload.labels.length > 0) {
        setActiveLabelId(payload.labels[0].id)
      }
    }
    if (payload.labelMetadata && typeof payload.labelMetadata === "object") {
      setLabelMetadata(payload.labelMetadata)
    } else if (Array.isArray(payload.labels)) {
      const meta: Record<string, LabelMeta> = {}
      payload.labels.forEach((label: any) => {
        if (!label?.id) return
        meta[label.id] = {
          name: label.name ?? label.id,
          tags: Array.isArray(label.tags) ? label.tags : [],
          color: label.color ?? theme.palette.accent1.vibrant,
          notes: label.notes ?? "",
        }
      })
      setLabelMetadata(meta)
    }
    if (Array.isArray(payload.annotations)) {
      setAnnotations(payload.annotations)
    }
    if (Array.isArray(payload.notes)) {
      setNotes(payload.notes)
    }
    if (typeof payload.duration === "number" && payload.duration > 0) {
      setDuration(payload.duration)
    }
    if (payload.activeLabelId) {
      setActiveLabelId(payload.activeLabelId)
    }
    if (
      payload.interpolationKeyframesByAnnotation &&
      typeof payload.interpolationKeyframesByAnnotation === "object"
    ) {
      setInterpolationKeyframesByAnnotation(payload.interpolationKeyframesByAnnotation)
    } else if (
      payload.interpolationKeyframesByLabel &&
      typeof payload.interpolationKeyframesByLabel === "object"
    ) {
      setInterpolationKeyframesByAnnotation({})
    }
    if (typeof payload.fps === "number" && Number.isFinite(payload.fps)) {
      setDraftFps(payload.fps)
    }
  }

  useEffect(() => {
    if (!annotationSetId || !resolvedDatasetItemId) return

    let cancelled = false
    const loadDraft = async () => {
      setIsHydratingDraft(true)
      const response = await GraphQLClient.query<{
        annotationDraft: { id: string; status: string; payload: any } | null
      }>(ANNOTATION_DRAFT_QUERY, ServicePort.GRAPHQL, {
        variables: {
          annotationSetId,
          datasetItemId: resolvedDatasetItemId,
          status: "DRAFT",
        },
      })

      if (cancelled) return

      if (response.success && response.data?.annotationDraft?.payload) {
        const payload = response.data.annotationDraft.payload
        applyDraftPayload(payload)
        setDraftStatus(response.data.annotationDraft.status)
        setDraftSource("draft")
        lastAutosavePayloadRef.current = JSON.stringify(payload)
        setIsHydratingDraft(false)
        return
      }

      const committedResponse = await GraphQLClient.query<{
        annotationDraft: { id: string; status: string; payload: any } | null
      }>(ANNOTATION_DRAFT_QUERY, ServicePort.GRAPHQL, {
        variables: {
          annotationSetId,
          datasetItemId: resolvedDatasetItemId,
          status: "COMMITTED",
        },
      })

      if (cancelled) return

        if (committedResponse.success && committedResponse.data?.annotationDraft?.payload) {
        const payload = committedResponse.data.annotationDraft.payload
        applyDraftPayload(payload)
        setDraftStatus(committedResponse.data.annotationDraft.status)
        setDraftSource("committed")
        lastAutosavePayloadRef.current = JSON.stringify(payload)

        await GraphQLClient.mutate<{
          upsertAnnotationDraft: { id: string; status: string }
        }>(UPSERT_ANNOTATION_DRAFT_MUTATION, ServicePort.GRAPHQL, {
          variables: {
            input: {
              annotationSetId: annotationSetId,
              datasetItemId: resolvedDatasetItemId,
              payload,
              status: "DRAFT",
            },
          },
        })
      } else {
        const seedPayload = buildDraftPayload()
        await GraphQLClient.mutate<{
          upsertAnnotationDraft: { id: string; status: string }
        }>(UPSERT_ANNOTATION_DRAFT_MUTATION, ServicePort.GRAPHQL, {
          variables: {
            input: {
              annotationSetId: annotationSetId,
              datasetItemId: resolvedDatasetItemId,
              payload: seedPayload,
              status: "DRAFT",
            },
          },
        })
        lastAutosavePayloadRef.current = JSON.stringify(seedPayload)
        setDraftSource(null)
        setDraftStatus("DRAFT")
      }

      setIsHydratingDraft(false)
    }

    loadDraft()

    return () => {
      cancelled = true
    }
  }, [annotationSetId, resolvedDatasetItemId])

  const queueAutosave = useCallback(() => {
    setAutosaveTick((prev) => prev + 1)
  }, [])

  useEffect(() => {
    if (!annotationSetId || !resolvedDatasetItemId) return
    if (isSavingDraft || isHydratingDraft) return

    const payload = buildDraftPayload()
    const payloadKey = JSON.stringify(payload)
    if (payloadKey === lastAutosavePayloadRef.current) return

    const saveDraft = async () => {
      setIsAutosaving(true)
      const response = await GraphQLClient.mutate<{
        upsertAnnotationDraft: { id: string; status: string }
      }>(UPSERT_ANNOTATION_DRAFT_MUTATION, ServicePort.GRAPHQL, {
        variables: {
          input: {
            annotationSetId: annotationSetId,
            datasetItemId: resolvedDatasetItemId,
            payload,
            status: "DRAFT",
          },
        },
      })

      if (!response.success || !response.data?.upsertAnnotationDraft) {
        const message =
          response.errors?.[0]?.message ?? "Failed to autosave annotation draft."
        setSaveError(message)
        setIsAutosaving(false)
        return
      }

      lastAutosavePayloadRef.current = payloadKey
      setIsAutosaving(false)
    }

    saveDraft()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autosaveTick, annotationSetId, resolvedDatasetItemId, isSavingDraft, isHydratingDraft])

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
      commitAnnotationDraft: {
        annotationRevisionId: string
        annotationIds: string[]
      }
    }>(COMMIT_ANNOTATION_DRAFT_MUTATION, ServicePort.GRAPHQL, {
      variables: {
        input: {
          annotationSetId: annotationSetId,
          datasetItemId: resolvedDatasetItemId,
          payload: buildDraftPayload(new Date().toISOString()),
        },
      },
    })

    if (!response.success || !response.data?.commitAnnotationDraft) {
      const message =
        response.errors?.[0]?.message ?? "Failed to save annotation draft."
      setSaveError(message)
      setIsSavingDraft(false)
      return
    }

    setSaveSuccess(
      `Committed revision ${response.data.commitAnnotationDraft.annotationRevisionId}.`
    )
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
        <LabelerFileListPanel
          files={datasetFiles}
          selectedFileId={selectedFileId}
          onSelectFile={setSelectedFileId}
        />

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
                  if (!isScrubbing) {
                    setCurrentTime(video.currentTime)
                    setDisplayTime(video.currentTime)
                  }
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
                  const pending =
                    pendingEdits[rect.id]?.frame === currentFrame
                      ? pendingEdits[rect.id].rect
                      : null
                  const shouldInterpolate =
                    Array.isArray(interpolationKeyframesByAnnotation[rect.id])
                      ? getSegmentState(
                          interpolationKeyframesByAnnotation[rect.id],
                          currentFrame
                        ).active
                      : false
                  const display = (() => {
                    if (preview) return preview
                    if (pending) return pending
                    if (isActive) {
                      return shouldInterpolate
                        ? getInterpolatedRect(rect, currentFrame)
                        : getLastKeyframeRect(rect, currentFrame)
                    }
                    if (isSelected) {
                      return getLastKeyframeRect(rect, currentFrame)
                    }
                    return null
                  })()
                  if (!display) return null
                  const resolvedDisplay = toDisplayRect(display)
                  const boxColor = isActive
                    ? rect.color
                    : theme.palette.grey[600]
                  const isActiveLabel = rect.labelId === activeLabelId
                  return (
                    <Box
                      key={rect.id}
                      sx={{
                        position: "absolute",
                        left: resolvedDisplay.x,
                        top: resolvedDisplay.y,
                        width: resolvedDisplay.w,
                        height: resolvedDisplay.h,
                        border: `2px solid ${boxColor}`,
                        zIndex: isActiveLabel
                          ? 3
                          : rect.id === selectedAnnotationId
                            ? 2
                            : 1,
                      }}
                    >
                      <Stack
                        direction="row"
                        spacing={0.5}
                        alignItems="center"
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
                        <Typography
                          variant="caption"
                          sx={{
                            color: theme.palette.getContrastText(boxColor),
                            fontWeight: theme.custom.font.weight.medium,
                            whiteSpace: "nowrap",
                          }}
                        >
                          {isActive
                            ? rect.labelName
                            : `${rect.labelName} · inactive`}
                        </Typography>
                        <Tooltip title="Add keyframe">
                          <IconButton
                            size="small"
                            onMouseDown={(event) => event.stopPropagation()}
                            onClick={(event) => {
                              event.stopPropagation()
                              addKeyframeForAnnotation(
                                rect.id,
                                currentFrame
                              )
                              queueAutosave()
                            }}
                            sx={{
                              p: 0.25,
                              color: theme.palette.getContrastText(boxColor),
                            }}
                          >
                            <AddCircleOutlineIcon
                              sx={{ fontSize: 16 }}
                            />
                          </IconButton>
                        </Tooltip>
                        <Box
                          sx={{
                            width: 10,
                            height: 10,
                            borderRadius: "50%",
                            backgroundColor: shouldInterpolate
                              ? theme.palette.info.main
                              : theme.palette.grey[300],
                            boxShadow: shouldInterpolate
                              ? `0 0 8px ${theme.palette.info.main}`
                              : "none",
                            animation: shouldInterpolate
                              ? "pulse 1.6s ease-in-out infinite"
                              : "none",
                            flexShrink: 0,
                            "@keyframes pulse": {
                              "0%": { transform: "scale(1)", opacity: 0.6 },
                              "50%": { transform: "scale(1.4)", opacity: 1 },
                              "100%": { transform: "scale(1)", opacity: 0.6 },
                            },
                          }}
                        />
                      </Stack>
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
                  {formatTime(displayTime)}
                </Typography>
                <Slider
                  value={isScrubbing ? currentTime : displayTime}
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
            <LabelerTimeline
              activeLabelId={activeLabelId}
              activeLabelName={activeLabel?.name ?? null}
              activeLabelColor={activeLabel?.color}
              activeLabelInterpolation={activeLabelInterpolation}
              canAddKeyframe={labelAnnotations.length > 0}
              duration={duration}
              durationFrames={durationFrames}
              effectiveFps={effectiveFps}
              labelActiveSegments={labelActiveSegments}
              interpolationPoints={interpolationPoints}
              selectedTimelinePoint={selectedTimelinePoint}
              timelinePoints={timelinePoints}
              timelineTicks={timelineTicks}
              onToggleInterpolation={toggleInterpolationAtCurrentFrame}
              onAddKeyframe={addKeyframeForLabel}
              onDeletePoint={handleDeleteTimelinePoint}
              onSelectPoint={handleTimelinePointSelect}
              accentButtonSx={accentButtonSx}
            />
          </Box>
        </Box>

        <LabelerDetailsPanel
          activeLabelName={activeLabel?.name ?? null}
          activeMeta={activeMeta}
          labelNameDraft={labelNameDraft}
          onLabelNameDraftChange={setLabelNameDraft}
          onUpdateLabelName={() => {
            if (!activeLabelId) return
            handleUpdateMeta({ name: labelNameDraft })
            queueAutosave()
          }}
          isColorPickerOpen={isColorPickerOpen}
          colorAnchorEl={colorAnchorEl}
          onColorPickerOpen={handleColorPickerOpen}
          onColorPickerClose={handleColorPickerClose}
          onColorChange={(value) => handleUpdateMeta({ color: value })}
          newTag={newTag}
          onNewTagChange={setNewTag}
          onAddTag={handleAddTag}
          noteDraft={noteDraft}
          onNoteDraftChange={setNoteDraft}
          onAddNote={handleAddNote}
          selectedAnnotationId={selectedAnnotationId}
          activeNotes={activeNotes}
          annotations={annotations}
          onSelectAnnotation={(rect) => {
            setSelectedAnnotationId(rect.id)
            setActiveLabelId(rect.labelId)
          }}
          onToggleAnnotation={handleToggleAnnotation}
          onDeleteAnnotation={handleDeleteAnnotation}
          isAnnotationActive={(rect) =>
            isActiveAtTime(rect, timeToFrame(currentTime, effectiveFps))
          }
          onCommit={handleCommitAnnotations}
          isCommitDisabled={isCommitDisabled}
          isSavingDraft={isSavingDraft}
          isAutosaving={isAutosaving}
          draftSource={draftSource}
          saveError={saveError}
          saveSuccess={saveSuccess}
          accentButtonSx={accentButtonSx}
        />
      </Box>
    </Box>
  )
}

export default DatasetLabelerPage
