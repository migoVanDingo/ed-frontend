// uploadResumable.ts
//
// Upload a File/Blob to a Google Cloud Storage resumable session URL.
// - Handles chunked PUTs with Content-Range
// - Resumes from last committed byte (308 + Range header)
// - Exposes progress and an AbortSignal for cancel
//
// Usage:
//   const controller = new AbortController();
//   await uploadResumable({ uploadUrl, file, onProgress, signal: controller.signal });

export type UploadResumableOptions = {
  uploadUrl: string;           // from your backend
  file: Blob;                  // File from input or Blob
  chunkSize?: number;          // default 8MB
  maxRetries?: number;         // per chunk; default 3
  onProgress?: (p: { bytesSent: number; total: number }) => void;
  signal?: AbortSignal;        // pass AbortController.signal to cancel
};

export async function uploadResumable(opts: UploadResumableOptions): Promise<Response> {
  const {
    uploadUrl,
    file,
    chunkSize = 8 * 1024 * 1024, // 8MB
    maxRetries = 3,
    onProgress,
    signal,
  } = opts;

  const total = file.size;
  let nextStart = await queryCommittedOffset(uploadUrl, total, signal);

  // Emit initial progress (in case we’re resuming)
  onProgress?.({ bytesSent: nextStart, total });

  while (nextStart < total) {
    const nextEndExclusive = Math.min(nextStart + chunkSize, total);
    const chunk = file.slice(nextStart, nextEndExclusive);

    // Upload this chunk with retries
    const res = await putChunkWithRetries({
      uploadUrl,
      chunk,
      start: nextStart,
      endExclusive: nextEndExclusive,
      total,
      maxRetries,
      signal,
      onProgress,
    });

    // If the server returns 200/201, upload is complete
    if (res.status === 200 || res.status === 201) {
      onProgress?.({ bytesSent: total, total });
      return res;
    }

    // Otherwise it should be a 308; figure out where to resume
    nextStart = parseRangeFrom308(res) + 1; // last received byte + 1
    onProgress?.({ bytesSent: nextStart, total });
  }

  // If we’re here, the final chunk must have returned 200/201 already.
  // As a fallback, confirm status:
  return await finalizeStatus(uploadUrl, total, signal);
}

async function queryCommittedOffset(uploadUrl: string, total: number, signal?: AbortSignal): Promise<number> {
  // Probe the session to see how much GCS already has:
  // PUT with Content-Length: 0 and Content-Range: bytes */<total>
  const res = await fetch(uploadUrl, {
    method: "PUT",
    headers: {
      "Content-Length": "0",
      "Content-Range": `bytes */${total}`,
    },
    signal,
    credentials: "omit",
    mode: "cors",
  });

  if (res.status === 200 || res.status === 201) {
    // Already complete
    return total;
  }
  if (res.status !== 308) {
    // Session might be new; GCS can also return 308 with no Range (means 0 uploaded)
    return 0;
  }
  return parseRangeFrom308(res) + 1; // last received + 1
}

function parseRangeFrom308(res: Response): number {
  // Range header format: "bytes=0-1048575"
  const range = res.headers.get("Range");
  if (!range) return -1;
  const m = range.match(/bytes=(\d+)-(\d+)/);
  if (!m) return -1;
  return parseInt(m[2], 10);
}

async function putChunkWithRetries(args: {
  uploadUrl: string;
  chunk: Blob;
  start: number;
  endExclusive: number;
  total: number;
  maxRetries: number;
  signal?: AbortSignal;
  onProgress?: (p: { bytesSent: number; total: number }) => void;
}): Promise<Response> {
  const {
    uploadUrl,
    chunk,
    start,
    endExclusive,
    total,
    maxRetries,
    signal,
    onProgress,
  } = args;

  let attempt = 0;
  // Note: we intentionally do NOT set Content-Type on chunk PUTs (GCS guidance).
  // We set it during session initiation via X-Upload-Content-Type.
  const contentLength = endExclusive - start;

  while (true) {
    attempt++;

    const res = await fetch(uploadUrl, {
      method: "PUT",
      headers: {
        "Content-Length": String(contentLength),
        "Content-Range": `bytes ${start}-${endExclusive - 1}/${total}`,
      },
      body: chunk,
      signal,
      credentials: "omit",
      mode: "cors",
    });

    // Success states:
    // - 308: chunk accepted, more to come
    // - 200/201: final chunk accepted, upload complete
    if (res.status === 308 || res.status === 200 || res.status === 201) {
      if (res.status === 308) {
        const lastByte = parseRangeFrom308(res);
        const bytesSent = lastByte >= 0 ? lastByte + 1 : endExclusive;
        onProgress?.({ bytesSent, total });
      }
      return res;
    }

    // Retry on 5xx or transient network issues
    if (shouldRetry(res) && attempt <= maxRetries) {
      await backoff(attempt);
      continue;
    }

    // For 4xx (other than 408/429), treat as fatal
    throw new Error(`Chunk upload failed (status ${res.status}): ${await safeText(res)}`);
  }
}

function shouldRetry(res: Response): boolean {
  if (res.status >= 500) return true;
  return res.status === 408 || res.status === 429;
}

async function backoff(attempt: number): Promise<void> {
  const ms = Math.min(1000 * Math.pow(2, attempt - 1), 8000);
  await new Promise((r) => setTimeout(r, ms));
}

async function safeText(res: Response): Promise<string> {
  try {
    return await res.text();
  } catch {
    return "<no-body>";
  }
}

async function finalizeStatus(uploadUrl: string, total: number, signal?: AbortSignal): Promise<Response> {
  // One last probe to return the final 200/201 response object
  const res = await fetch(uploadUrl, {
    method: "PUT",
    headers: {
      "Content-Length": "0",
      "Content-Range": `bytes */${total}`,
    },
    signal,
    credentials: "omit",
    mode: "cors",
  });
  if (res.status === 200 || res.status === 201) return res;
  if (res.status === 308) {
    // Still not complete? This would be unusual; caller will treat as error.
    throw new Error("Unexpected 308 after finishing upload.");
  }
  throw new Error(`Finalize status probe failed: ${res.status}`);
}
