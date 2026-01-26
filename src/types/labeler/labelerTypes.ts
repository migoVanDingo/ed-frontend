export type LabelMeta = {
  name: string
  tags: string[]
  color: string
  notes: string
}

export type Point = { x: number; y: number }

export type RectShape = { x: number; y: number; w: number; h: number }

export type Keyframe = RectShape & { frame: number }

export type ActiveKeyframe = { frame: number; active: boolean }

export type NoteEntry = {
  id: string
  frame: number
  text: string
  anchorX: number
  anchorY: number
}

export type DatasetLabelerFile = {
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

export type DatasetLabelerLoaderData = {
  dataset: {
    id: string
    name: string
    description?: string | null
    datastoreId: string
  }
  datasetFiles: DatasetLabelerFile[]
}

export type AnnotationRect = {
  id: string
  labelId: string
  labelName: string
  color: string
  keyframes: Keyframe[]
  activeKeyframes: ActiveKeyframe[]
}

export type VideoBounds = {
  left: number
  top: number
  width: number
  height: number
}

export type DragHandle =
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

export type TimelinePoint = {
  annotationId: string
  frame: number
  type: "keyframe" | "toggle" | "interpolation"
  active?: boolean
}
