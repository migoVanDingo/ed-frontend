import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"
import {
  Box,
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormGroup,
  IconButton,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Select,
  Slider,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material"
import { useTheme } from "@mui/material/styles"
import PlayArrowIcon from "@mui/icons-material/PlayArrow"
import PauseIcon from "@mui/icons-material/Pause"
import { useLoaderData, useLocation, useParams } from "react-router-dom"
import { GraphQLClient } from "../graphql/GraphQLClient"
import { ServicePort } from "../utility/constants/serviceConstants"
import { GET_OR_CREATE_ANNOTATION_SET_MUTATION } from "../graphql/mutation/annotationSet"
import { ANNOTATION_DRAFT_QUERY } from "../graphql/query/annotationDraft"
import { FILE_SIGNED_URL_QUERY } from "../graphql/query/fileQuery"
import LabelerFileListPanel from "../components/functional/labeler/LabelerFileListPanel"
import ActivityMapTimeline from "../components/functional/activityMap/ActivityMapTimeline"
import {
  FPS,
  clamp,
  formatTime,
  getInterpolatedRect,
  getLastKeyframeRect,
  getTimelineTickInterval,
  isActiveAtTime,
  isNormalizedRect,
  timeToFrame,
} from "../utils/labeler/labelerUtils"
import type {
  ActiveKeyframe,
  AnnotationRect,
  DatasetLabelerLoaderData,
  RectShape,
  TimelinePoint,
  VideoBounds,
} from "../types/labeler/labelerTypes"

const sampleVideoUrl =
  "https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"

const DatasetActivityMapPage = () => {
  const theme = useTheme()
  const loaderData = useLoaderData() as DatasetLabelerLoaderData
  const { datasetId } = useParams()
  const location = useLocation()
  const searchParams = new URLSearchParams(location.search)
  const annotationSetIdParam = searchParams.get("annotationSetId")
  const requestedFileId = searchParams.get("fileId")
  const datasetFiles = loaderData.datasetFiles ?? []
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const videoContainerRef = useRef<HTMLDivElement | null>(null)

  const [selectedFileId, setSelectedFileId] = useState<string | null>(
    datasetFiles[0]?.id ?? null
  )
  const [annotations, setAnnotations] = useState<AnnotationRect[]>([])
  const [interpolationKeyframesByAnnotation, setInterpolationKeyframesByAnnotation] =
    useState<Record<string, ActiveKeyframe[]>>(() => ({}))
  const [annotationSetId, setAnnotationSetId] = useState<string | null>(
    annotationSetIdParam
  )
  const [draftFps, setDraftFps] = useState<number | null>(null)
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [displayTime, setDisplayTime] = useState(0)
  const [isScrubbing, setIsScrubbing] = useState(false)
  const [videoUrl, setVideoUrl] = useState(sampleVideoUrl)
  const [videoUrlError, setVideoUrlError] = useState<string | null>(null)
  const [selectedLabelId, setSelectedLabelId] = useState<string | null>(null)
  const [groupBy, setGroupBy] = useState<"label" | "tag">("label")
  const [labelFilter, setLabelFilter] = useState("")
  const [selectedDatasetIds, setSelectedDatasetIds] = useState<string[]>([])
  const [videoBounds, setVideoBounds] = useState<VideoBounds>({
    left: 0,
    top: 0,
    width: 0,
    height: 0,
  })

  const filesById = useMemo(
    () => new Map(datasetFiles.map((file) => [file.id, file])),
    [datasetFiles]
  )
  const selectedFile = selectedFileId ? filesById.get(selectedFileId) : undefined
  const resolvedDatasetItemId = selectedFile?.datasetItemId ?? null
  const contentHeight = `calc(100vh - ${theme.custom.component.header.height}px)`

  const videoInspect = selectedFile?.meta?.video?.inspect
  const metaDuration = Number(videoInspect?.duration_seconds)
  const metaFps = Number(videoInspect?.fps)
  const effectiveDuration = Number.isFinite(metaDuration) ? metaDuration : null
  const safeDraftFps =
    typeof draftFps === "number" && Number.isFinite(draftFps) ? draftFps : null
  const safeMetaFps = Number.isFinite(metaFps) ? metaFps : null
  const effectiveFps = safeDraftFps ?? safeMetaFps ?? FPS
  const timelineDuration = useMemo(() => {
    if (duration > 0) return duration
    let maxFrame = 0
    annotations.forEach((annotation) => {
      annotation.keyframes.forEach((kf) => {
        const value = Number(kf.frame)
        if (Number.isFinite(value) && value > maxFrame) maxFrame = value
      })
      annotation.activeKeyframes.forEach((kf) => {
        const value = Number(kf.frame)
        if (Number.isFinite(value) && value > maxFrame) maxFrame = value
      })
    })
    if (maxFrame <= 0) return 0
    return maxFrame / effectiveFps
  }, [annotations, duration, effectiveFps])
  const durationFrames = Math.max(timeToFrame(timelineDuration, effectiveFps), 0)
  const timelineTicks = timelineDuration
    ? Array.from(
        {
          length:
            Math.floor(
              timelineDuration / getTimelineTickInterval(timelineDuration)
            ) + 1,
        },
        (_, idx) => idx * getTimelineTickInterval(timelineDuration)
      ).filter((value) => value > 0 && value < timelineDuration)
    : []
  const currentFrame = timeToFrame(currentTime, effectiveFps)

  const labelOptions = useMemo(() => {
    const unique = new Map<string, string>()
    annotations.forEach((annotation) => {
      const name = annotation.labelName || annotation.labelId
      if (!unique.has(annotation.labelId)) unique.set(annotation.labelId, name)
    })
    return Array.from(unique.entries()).map(([id, name]) => ({ id, name }))
  }, [annotations])
  const filteredLabels = labelOptions.filter((label) =>
    label.name.toLowerCase().includes(labelFilter.trim().toLowerCase())
  )

  const resetActivityMapState = useCallback(() => {
    setAnnotations([])
    setInterpolationKeyframesByAnnotation({})
    setDraftFps(null)
    setSelectedLabelId(null)
    setCurrentTime(0)
    setDisplayTime(0)
    setDuration(0)
  }, [])

  const handleSelectLabel = useCallback((labelId: string, labelName?: string) => {
    setSelectedLabelId((prev) => {
      if (prev === labelId) return prev
      const labelDisplay = labelName ? `${labelName} (${labelId})` : labelId
      console.log("Selected label:", labelDisplay)
      return labelId
    })
  }, [])

  const updateVideoBounds = useCallback(() => {
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
  }, [])

  const toDisplayRect = useCallback(
    (rect: RectShape): RectShape => {
      if (!isNormalizedRect(rect) || !videoBounds.width || !videoBounds.height) {
        return rect
      }
      return {
        x: rect.x * videoBounds.width,
        y: rect.y * videoBounds.height,
        w: rect.w * videoBounds.width,
        h: rect.h * videoBounds.height,
      }
    },
    [videoBounds.height, videoBounds.width]
  )

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
    resetActivityMapState()
  }, [resetActivityMapState, selectedFileId])

  useEffect(() => {
    if (effectiveDuration && (!duration || duration === 0)) {
      setDuration(effectiveDuration)
    }
  }, [effectiveDuration, duration])

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
      setDisplayTime(video.currentTime)
    }
    const handlePause = () => {
      setDisplayTime(video.currentTime)
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
  }, [isScrubbing, updateVideoBounds])

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
    const video = videoRef.current
    if (!video) return
    video.load()
  }, [videoUrl])

  useEffect(() => {
    if (!videoContainerRef.current) return
    const observer = new ResizeObserver(() => {
      updateVideoBounds()
    })
    observer.observe(videoContainerRef.current)
    return () => {
      observer.disconnect()
    }
  }, [updateVideoBounds])

  useEffect(() => {
    if (!datasetFiles.length) return
    const requested =
      requestedFileId && filesById.has(requestedFileId) ? requestedFileId : null
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
        return
      }

      setAnnotationSetId(response.data.getOrCreateAnnotationSet.id)
    }

    ensureAnnotationSet()

    return () => {
      cancelled = true
    }
  }, [annotationSetId, datasetId])

  const applyDraftPayload = (payload: any) => {
    if (!payload || typeof payload !== "object") {
      setAnnotations([])
      return
    }
    if (Array.isArray(payload.annotations)) {
      setAnnotations(payload.annotations)
    } else {
      setAnnotations([])
    }
    if (
      payload.interpolationKeyframesByAnnotation &&
      typeof payload.interpolationKeyframesByAnnotation === "object"
    ) {
      setInterpolationKeyframesByAnnotation(payload.interpolationKeyframesByAnnotation)
    } else {
      setInterpolationKeyframesByAnnotation({})
    }
    if (typeof payload.duration === "number" && payload.duration > 0) {
      setDuration(payload.duration)
    }
    if (typeof payload.fps === "number" && Number.isFinite(payload.fps)) {
      setDraftFps(payload.fps)
    }
  }

  useEffect(() => {
    if (!annotationSetId || !resolvedDatasetItemId) return

    let cancelled = false
    const loadDraft = async () => {
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
        applyDraftPayload(response.data.annotationDraft.payload)
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
        applyDraftPayload(committedResponse.data.annotationDraft.payload)
        return
      }

      applyDraftPayload(null)
    }

    loadDraft()

    return () => {
      cancelled = true
    }
  }, [annotationSetId, resolvedDatasetItemId])

  const handleTogglePlay = () => {
    const video = videoRef.current
    if (!video) return
    if (video.paused) {
      video.play().catch(() => {
        setVideoUrlError("Unable to play video. Unsupported source.")
      })
    } else {
      video.pause()
    }
  }

  const handleSliderChange = (_: Event, value: number | number[]) => {
    if (Array.isArray(value)) return
    setIsScrubbing(true)
    setCurrentTime(value)
  }

  const handleSliderCommit = (_: Event | React.SyntheticEvent, value: number | number[]) => {
    if (Array.isArray(value)) return
    const video = videoRef.current
    if (!video) return
    const max = video.duration || duration || 0
    const clamped = clamp(value, 0, max)
    video.currentTime = clamped
    setCurrentTime(clamped)
    setDisplayTime(clamped)
    setIsScrubbing(false)
  }

  const handleJump = (delta: number) => {
    const video = videoRef.current
    if (!video) return
    const max = video.duration || duration || 0
    const nextValue = clamp(video.currentTime + delta, 0, max)
    video.currentTime = nextValue
    setCurrentTime(nextValue)
    setDisplayTime(nextValue)
  }

  const handleTimelinePointSelect = (point: TimelinePoint, timeSeconds: number) => {
    const video = videoRef.current
    if (!video) return
    const max = video.duration || duration || 0
    const clamped = clamp(timeSeconds, 0, max)
    video.currentTime = clamped
    setCurrentTime(clamped)
    setDisplayTime(clamped)
  }

  const sortedAnnotations = useMemo(
    () =>
      [...annotations].sort((a, b) =>
        (a.labelName ?? "").localeCompare(b.labelName ?? "")
      ),
    [annotations]
  )

  const buildInterpolationPoints = (annotation: AnnotationRect) =>
    interpolationKeyframesByAnnotation[annotation.id] ?? []

  const accentButtonSx = {
    borderColor: theme.palette.accent1.vibrant,
    color: theme.palette.accent1.vibrant,
    "&:hover": { backgroundColor: theme.palette.accent1.dim },
  }

  return (
    <Box
      sx={{
        height: contentHeight,
        display: "flex",
        minHeight: 0,
        backgroundColor: theme.palette.background.paper,
      }}
    >
      <Box sx={{ width: 280, minWidth: 240, borderRight: `1px solid ${theme.palette.divider}` }}>
        <LabelerFileListPanel
          files={datasetFiles}
          selectedFileId={selectedFileId}
          onSelectFile={(id) => setSelectedFileId(id)}
        />
      </Box>

      <Box sx={{ flex: 1, minWidth: 0, p: 2 }}>
        <Box
          sx={{
            height: "100%",
            minHeight: 0,
            display: "grid",
            gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)",
            gridTemplateRows: "minmax(0, 1fr) minmax(0, 1fr)",
            gap: 2,
          }}
        >
          <Box
            sx={{
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: theme.custom.radii.xs,
              backgroundColor:
                theme.palette.mode === "dark"
                  ? theme.palette.background.default
                  : theme.palette.background.paper,
              boxShadow: theme.palette.boxShadow.light,
              p: 2,
              minHeight: 0,
            }}
          >
            <Stack spacing={2}>
              <Typography variant="h5" sx={{ fontWeight: 200 }}>
                Toggles & Controls
              </Typography>
              <ToggleButtonGroup
                value={groupBy}
                exclusive
                size="small"
                onChange={(_, value) => {
                  if (value) setGroupBy(value)
                }}
              >
                <ToggleButton value="label">Group by Label</ToggleButton>
                <ToggleButton value="tag">Group by Tag</ToggleButton>
              </ToggleButtonGroup>
              <FormControl size="small" fullWidth>
                <InputLabel id="activity-map-datasets-label">Datasets</InputLabel>
                <Select
                  labelId="activity-map-datasets-label"
                  multiple
                  value={
                    selectedDatasetIds.length
                      ? selectedDatasetIds
                      : loaderData.dataset?.id
                      ? [loaderData.dataset.id]
                      : []
                  }
                  onChange={(event) =>
                    setSelectedDatasetIds(event.target.value as string[])
                  }
                  input={<OutlinedInput label="Datasets" />}
                  renderValue={(selected) => {
                    if (!selected.length) return "No datasets"
                    if (selected.length === 1 && loaderData.dataset?.name) {
                      return loaderData.dataset.name
                    }
                    return `${selected.length} datasets selected`
                  }}
                >
                  {loaderData.dataset?.id && (
                    <MenuItem value={loaderData.dataset.id}>
                      {loaderData.dataset.name ?? "Current Dataset"}
                    </MenuItem>
                  )}
                </Select>
              </FormControl>
              <TextField
                size="small"
                label={groupBy === "label" ? "Filter labels" : "Filter tags"}
                value={labelFilter}
                onChange={(event) => setLabelFilter(event.target.value)}
              />
              <Box sx={{ minHeight: 0 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                  Labels
                </Typography>
                {filteredLabels.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    No labels found.
                  </Typography>
                ) : (
                  <FormGroup
                    sx={{
                      maxHeight: 160,
                      overflowY: "auto",
                      overflowX: "hidden",
                      border: `1px solid ${theme.palette.divider}`,
                      borderRadius: theme.custom.radii.xs,
                      p: 1,
                      display: "block",
                    }}
                  >
                    {filteredLabels.map((label) => (
                      <FormControlLabel
                        key={label.id}
                        control={<Checkbox defaultChecked size="small" />}
                        label={label.name}
                      />
                    ))}
                  </FormGroup>
                )}
              </Box>
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                  Tags
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  No tags available yet.
                </Typography>
              </Box>
            </Stack>
          </Box>

          <Box
            sx={{
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: theme.custom.radii.xs,
              backgroundColor:
                theme.palette.mode === "dark"
                  ? theme.palette.background.default
                  : theme.palette.background.paper,
              boxShadow: theme.palette.boxShadow.light,
              p: 2,
              minHeight: 0,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Box
              sx={{
                flex: 1,
                minHeight: 0,
                borderRadius: theme.custom.radii.xs,
                backgroundColor:
                  theme.palette.mode === "dark"
                    ? theme.palette.grey[900]
                    : theme.palette.grey[100],
                position: "relative",
                overflow: "hidden",
              }}
              ref={videoContainerRef}
            >
              <video
                ref={videoRef}
                src={videoUrl}
                style={{ width: "100%", height: "100%", objectFit: "contain" }}
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
              />
              <Box
                sx={{
                  position: "absolute",
                  left: videoBounds.left,
                  top: videoBounds.top,
                  width: videoBounds.width,
                  height: videoBounds.height,
                }}
              >
                {annotations.map((annotation) => {
                  if (!isActiveAtTime(annotation, currentFrame)) return null
                  const rect =
                    getInterpolatedRect(annotation, currentFrame) ??
                    getLastKeyframeRect(annotation, currentFrame)
                  if (!rect) return null
                  const displayRect = toDisplayRect(rect)
                  return (
                    <Box
                      key={`bbox-${annotation.id}`}
                      onClick={() =>
                        handleSelectLabel(annotation.labelId, annotation.labelName)
                      }
                      sx={{
                        position: "absolute",
                        left: clamp(displayRect.x, 0, videoBounds.width),
                        top: clamp(displayRect.y, 0, videoBounds.height),
                        width: Math.max(displayRect.w, 0),
                        height: Math.max(displayRect.h, 0),
                        border: `3px solid ${annotation.color}`,
                        boxShadow:
                          selectedLabelId === annotation.labelId
                            ? `0 0 0 2px ${theme.palette.common.white}`
                            : "none",
                        cursor: "pointer",
                        pointerEvents: "auto",
                      }}
                    />
                  )
                })}
              </Box>
            </Box>
            <Stack spacing={1} sx={{ mt: 1 }}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <IconButton onClick={handleTogglePlay}>
                  {videoRef.current && !videoRef.current.paused ? (
                    <PauseIcon />
                  ) : (
                    <PlayArrowIcon />
                  )}
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
          </Box>

          <Box
            sx={{
              gridColumn: "1 / -1",
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: theme.custom.radii.xs,
              backgroundColor:
                theme.palette.mode === "dark"
                  ? theme.palette.background.default
                  : theme.palette.background.paper,
              boxShadow: theme.palette.boxShadow.light,
              p: 2,
              minHeight: 0,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Typography
              variant="h5"
              sx={{
                fontWeight: 200,
                mb: 1.5,
              }}
            >
              Activity Map
            </Typography>
            {sortedAnnotations.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No annotations available yet.
              </Typography>
            ) : (
              <Stack sx={{ flex: 1, minHeight: 0 }} spacing={0}>
                <Box
                  sx={{
                    flex: 1,
                    minHeight: 0,
                    overflow: "auto",
                  }}
                >
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: "220px minmax(0, 1fr)",
                      gap: 2,
                      minHeight: "100%",
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 0,
                        overflow: "auto",
                        pr: 1,
                        minHeight: 0,
                        height: "100%",
                      }}
                    >
                      {sortedAnnotations.map((annotation) => (
                        <Box
                          key={annotation.id}
                          sx={{
                          display: "flex",
                          alignItems: "center",
                          flex: "1 1 0",
                          minHeight: 48,
                          px: 1,
                        }}
                        >
                          <Typography
                            variant="subtitle2"
                            sx={{
                              fontWeight: theme.custom.font.weight.bold,
                              fontSize: theme.custom.font.size.md,
                              color: theme.palette.text.primary,
                              cursor: "pointer",
                            }}
                            onClick={() =>
                              handleSelectLabel(annotation.labelId, annotation.labelName)
                            }
                          >
                            {annotation.labelName || annotation.labelId}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 0,
                        minHeight: 0,
                        height: "100%",
                        backgroundColor:
                          theme.palette.mode === "dark"
                            ? theme.palette.grey[800]
                            : theme.palette.grey[200],
                        borderRadius: 0,
                        position: "relative",
                        overflow: "hidden",
                      }}
                    >
                    {timelineDuration > 0 && (
                      <Box
                        sx={{
                          position: "absolute",
                          left: `${Math.min(
                            Math.max(displayTime / timelineDuration, 0),
                            1
                          ) * 100}%`,
                          top: 0,
                          bottom: 0,
                          width: 2,
                          backgroundColor: theme.palette.accent1.vibrant,
                          transform: "translateX(-1px)",
                          pointerEvents: "none",
                          zIndex: 1,
                        }}
                      />
                    )}
                    {sortedAnnotations.map((annotation) => {
                      const interpolationPoints = buildInterpolationPoints(annotation)
                      return (
                        <Box
                          key={`graph-${annotation.id}`}
                          sx={{
                            flex: "1 1 0",
                            minHeight: 48,
                            display: "flex",
                            alignItems: "center",
                            px: 0,
                          }}
                          >
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                            <ActivityMapTimeline
                              color={annotation.color}
                              effectiveFps={effectiveFps}
                              durationSeconds={timelineDuration}
                              keyframes={annotation.keyframes}
                              activeKeyframes={annotation.activeKeyframes}
                              interpolationKeyframes={interpolationPoints}
                              currentTimeSeconds={displayTime}
                              showPlayhead={false}
                              onSelectPoint={(frame) => {
                                handleSelectLabel(
                                  annotation.labelId,
                                  annotation.labelName
                                )
                                  handleTimelinePointSelect(
                                    {
                                      annotationId: annotation.id,
                                      frame,
                                      type: "keyframe",
                                    },
                                    frame / effectiveFps
                                  )
                                }}
                              />
                            </Box>
                          </Box>
                        )
                      })}
                    </Box>
                  </Box>
                </Box>
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "220px minmax(0, 1fr)",
                    gap: 2,
                    alignItems: "center",
                    flexShrink: 0,
                    mt: 0,
                    pt: 0,
                  }}
                >
                  <Box />
                  <Box
                    sx={{
                      position: "relative",
                      height: 36,
                      borderRadius: 0,
                      backgroundColor:
                        theme.palette.mode === "dark"
                          ? theme.palette.grey[800]
                          : theme.palette.grey[200],
                    }}
                  >
                    {timelineDuration > 0 && (
                      <Box
                        sx={{
                          position: "absolute",
                          left: `${Math.min(
                            Math.max(displayTime / timelineDuration, 0),
                            1
                          ) * 100}%`,
                          top: 0,
                          bottom: 0,
                          width: 2,
                          backgroundColor: theme.palette.accent1.vibrant,
                          transform: "translateX(-1px)",
                          pointerEvents: "none",
                          zIndex: 1,
                        }}
                      />
                    )}
                    {timelineDuration > 0 && (() => {
                      const total = timelineDuration
                      let minorStep = 1
                      let majorStep = 5
                      if (total > 30 && total <= 120) {
                        minorStep = 5
                        majorStep = 15
                      } else if (total > 120 && total <= 600) {
                        minorStep = 15
                        majorStep = 60
                      } else if (total > 600 && total <= 3600) {
                        minorStep = 60
                        majorStep = 300
                      } else if (total > 3600) {
                        minorStep = 300
                        majorStep = 600
                      }
                      const ticks: number[] = []
                      for (let t = 0; t <= total; t += minorStep) {
                        ticks.push(Number(t.toFixed(4)))
                      }
                      if (ticks[ticks.length - 1] !== total) {
                        ticks.push(total)
                      }
                      return ticks.map((tick, idx) => {
                        const left = Math.min(Math.max(tick / total, 0), 1)
                        const isMajor = tick % majorStep === 0 || tick === total
                        return (
                          <Box key={`map-tick-${tick}-${idx}`}>
                            <Box
                              sx={{
                                position: "absolute",
                                left: `calc(${left * 100}% ${
                                  left <= 0 ? "+ 1px" : left >= 1 ? "- 1px" : ""
                                })`,
                                top: "50%",
                                width: 2,
                                height: isMajor ? 12 : 6,
                                transform: "translate(-50%, -50%)",
                                backgroundColor: theme.palette.grey[500],
                              }}
                            />
                            {isMajor && (
                              <Typography
                                variant="caption"
                                sx={{
                                  position: "absolute",
                                  left: `calc(${left * 100}% ${
                                    left <= 0 ? "+ 1px" : left >= 1 ? "- 1px" : ""
                                  })`,
                                  top: "100%",
                                  transform: "translate(-50%, 0)",
                                  mt: 0.5,
                                  fontSize: theme.custom.font.size.xs,
                                  color: theme.palette.text.secondary,
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {formatTime(tick)}
                              </Typography>
                            )}
                          </Box>
                        )
                      })
                    })()}
                  </Box>
                </Box>
              </Stack>
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

export default DatasetActivityMapPage
