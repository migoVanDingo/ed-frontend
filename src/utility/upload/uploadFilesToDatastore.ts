// src/utility/upload/uploadFilesToDatastore.ts

import { UploadSession } from "../../api/UploadSession"
import { uploadResumable } from "./uploadResumable"
import { makeClientFileId } from "./uploadUIHelpers"

export interface UploadRequest {
  datastoreId: string
  files: File[]
  tags: string[]
  onFileProgress?: (args: {
    fileId: string
    bytesSent: number
    total: number | null
    percent: number
  }) => void
}

export interface OpenUploadSessionRow {
  client_token: string
  upload_url: string
  suggested_chunk_bytes?: number
  // backend fields
  session_id?: string
  file_id?: string
  object_key?: string
  filename?: string
  size_bytes?: number
}

export interface UploadResultFile {
  fileId: string
  clientFileId: string
  filename: string
  sizeBytes: number
  sessionId?: string
  objectKey?: string
}

export interface UploadResult {
  sessionId?: string | null
  files: UploadResultFile[]
  rawResponse: any
}

/**
 * High-level client upload helper:
 * - Calls openUploadSession to get real file IDs + resumable URLs
 * - Starts uploads, reports progress via fileId
 * - Returns immediately after starting uploads (does NOT await completion)
 */
export async function uploadFilesToDatastore({
  datastoreId,
  files,
  tags,
  onFileProgress,
}: UploadRequest): Promise<UploadResult> {
  if (!files || files.length === 0) {
    return { sessionId: null, files: [], rawResponse: null }
  }

  // 1) Stable client tokens for correlation (not used by UI directly)
  const picked = Array.from(files).map((file) => ({
    clientFileId: makeClientFileId(file),
    file,
  }))

  const fileSpecs = picked.map(({ clientFileId, file }) => ({
    client_token: clientFileId,
    filename: file.name,
    content_type: file.type || "application/octet-stream",
    size_bytes: file.size,
  }))

  const payload = {
    datastore_id: datastoreId,
    files: fileSpecs,
    tags,
  }

  // 2) Ask backend for resumable upload URLs + real file IDs
  const res: any = await UploadSession.openUploadSession(payload)

  if (!res?.success || !Array.isArray(res.data)) {
    throw new Error(res?.message || "Failed to create upload sessions")
  }

  const rows = res.data as OpenUploadSessionRow[]

  // 3) Map client_token -> File
  const pickedMap = new Map(
    picked.map((entry) => [entry.clientFileId, entry.file])
  )

  // 4) Start uploads in the background (fire-and-forget)
  const uploads = rows.map((row) => {
    const targetFile = pickedMap.get(row.client_token)
    if (!targetFile) {
      throw new Error(
        `No local file found for client token ${row.client_token}`
      )
    }

    const fileId = row.file_id
    if (!fileId) {
      throw new Error(
        `Backend did not return file_id for client_token=${row.client_token}`
      )
    }

    return uploadResumable({
      uploadUrl: row.upload_url,
      file: targetFile,
      chunkSize: row.suggested_chunk_bytes ?? undefined,
      onProgress: ({ bytesSent, total }) => {
        const percent = total ? Math.round((bytesSent / total) * 100) : 0
        onFileProgress?.({
          fileId,
          bytesSent,
          total,
          percent,
        })
      },
    })
  })

  // We intentionally do NOT await these; let them run.
  uploads.forEach((p) =>
    p.catch((err) => {
      // TODO: surface this somewhere better later
      console.error("Upload failed for one file:", err)
    })
  )

  // 5) Build a structured result for callers (for the grid rows)
  const firstRow = rows[0]
  const sessionId = firstRow?.session_id ?? null

  const filesResult: UploadResultFile[] = rows.map((row) => {
    const fileId = row.file_id
    if (!fileId) {
      throw new Error(
        `Backend did not return file_id for client_token=${row.client_token}`
      )
    }

    // we know the original file too
    const file = pickedMap.get(row.client_token)

    return {
      fileId,
      clientFileId: row.client_token,
      filename: row.filename ?? file?.name ?? fileId,
      sizeBytes: row.size_bytes ?? file?.size ?? 0,
      sessionId: row.session_id,
      objectKey: row.object_key,
    }
  })

  return {
    sessionId,
    files: filesResult,
    rawResponse: res,
  }
}
