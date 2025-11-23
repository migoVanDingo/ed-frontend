// src/utility/upload/uploadFilesToDatastore.ts

import { UploadSession } from "../../api/UploadSession"
import { makeClientId } from "./uploadClientId"
import { uploadResumable } from "./uploadResumable"

export interface UploadRequest {
  datastoreId: string
  files: File[]
  tags: string[]
  onFileProgress?: (args: {
    clientFileId: string
    file: File
    bytesSent: number
    total: number | null
    percent: number
  }) => void
}

export interface OpenUploadSessionRow {
  client_token: string
  upload_url: string
  suggested_chunk_bytes?: number
  // new fields from backend; optional so we don’t blow up if backend changes
  session_id?: string
  file_id?: string
  object_key?: string
}

export interface UploadResultFile {
  clientFileId: string
  fileId?: string
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
 * - Generates client IDs
 * - Calls openUploadSession
 * - Starts resumable uploads via uploadResumable
 * - Reports per-file progress via callback
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

  // 1) Attach a stable client ID to each File object
  const picked = Array.from(files).map((file) => ({
    clientFileId: makeClientId(),
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

  // 2) Ask backend for resumable upload URLs
  const res: any = await UploadSession.openUploadSession(payload)

  if (!res?.success || !Array.isArray(res.data)) {
    throw new Error(res?.message || "Failed to create upload sessions")
  }

  const rows = res.data as OpenUploadSessionRow[]

  // 3) Map client tokens back to real File objects
  const pickedMap = new Map(
    picked.map((entry) => [entry.clientFileId, entry.file])
  )

  // 4) Kick off uploads in parallel
  const uploads = rows.map((row: any) => {
    const targetFile = pickedMap.get(row.client_token)
    if (!targetFile) {
      throw new Error(
        `No local file found for client token ${row.client_token}`
      )
    }

    return uploadResumable({
      uploadUrl: row.upload_url,
      file: targetFile,
      chunkSize: row.suggested_chunk_bytes ?? undefined,
      onProgress: ({ bytesSent, total }) => {
        const percent = total ? Math.round((bytesSent / total) * 100) : 0
        onFileProgress?.({
          clientFileId: row.client_token,
          file: targetFile,
          bytesSent,
          total,
          percent,
        })
      },
    })
  })

  await Promise.all(uploads)

  // 5) Build a structured result for callers
  const firstRow = rows[0]
  const sessionId = firstRow?.session_id ?? null

  const filesResult: UploadResultFile[] = rows.map((row) => ({
    clientFileId: row.client_token,
    fileId: row.file_id,
    sessionId: row.session_id,
    objectKey: row.object_key,
  }))

  return {
    sessionId,
    files: filesResult,
    rawResponse: res,
  }
}
