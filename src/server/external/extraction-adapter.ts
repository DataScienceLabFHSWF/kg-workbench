import type {
  ExtractorBackend,
  ExternalExtractionRequest,
  ExternalExtractionOptions,
  ExtractionResponse,
  ExtractionResultsResponse,
  ExtractionStatusResponse,
  ExtractionTriggerResult,
  InternalExtractionRequest,
  InternalExtractionOptions,
} from "./extraction-api"

export function normalizeExtractorBaseUrl(url: string): string {
  const trimmed = url.trim()
  if (!trimmed) throw new Error("Extractor URL is required.")

  let parsed: URL
  try {
    parsed = new URL(trimmed)
  } catch {
    throw new Error("Extractor URL must be a valid URL.")
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new Error("Extractor URL must use http or https.")
  }

  return trimmed.replace(/\/$/, "")
}

export function getConfiguredExternalBaseUrl(): string {
  const url = process.env.EXTRACTION_API_URL
  if (!url) throw new Error("Missing EXTRACTION_API_URL env variable")
  return normalizeExtractorBaseUrl(url)
}

function getExternalBaseUrl(options?: ExternalExtractionOptions): string {
  if (options?.baseUrl) return normalizeExtractorBaseUrl(options.baseUrl)
  return getConfiguredExternalBaseUrl()
}

function getInternalBaseUrl(): string {
  const url = process.env.INTERNAL_EXTRACTION_API_URL
  if (!url) throw new Error("Missing INTERNAL_EXTRACTION_API_URL env variable")
  return url.replace(/\/$/, "")
}

function getExternalHeaders(options?: ExternalExtractionOptions) {
  return {
    "Content-Type": "application/json",
    ...(options?.apiKey ? { Authorization: `Bearer ${options.apiKey}` } : {}),
  }
}

async function triggerExternalExtraction(
  req: ExternalExtractionRequest,
  options?: ExternalExtractionOptions
): Promise<ExtractionResponse> {
  const baseUrl = getExternalBaseUrl(options)
  const url = `${baseUrl}/api/extract`
  const res = await fetch(url, {
    method: "POST",
    headers: getExternalHeaders(options),
    body: JSON.stringify(req),
  }).catch((error: unknown) => {
    throw new Error(`Could not reach external extractor at ${url}`, {
      cause: error,
    })
  })
  if (!res.ok) throw new Error(`triggerExtraction failed: ${res.status}`)
  return res.json() as Promise<ExtractionResponse>
}

async function triggerInternalExtraction(
  req: InternalExtractionRequest,
  options: InternalExtractionOptions
): Promise<ExtractionResponse> {
  const url = `${getInternalBaseUrl()}/api/extract`
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...req, ...options }),
  }).catch((error: unknown) => {
    throw new Error(`Could not reach internal extractor at ${url}`, {
      cause: error,
    })
  })
  if (!res.ok)
    throw new Error(`triggerInternalExtraction failed: ${res.status}`)
  return res.json() as Promise<ExtractionResponse>
}

export async function triggerExtraction(
  req: ExternalExtractionRequest | InternalExtractionRequest,
  backend: ExtractorBackend,
  options:
    | { external?: ExternalExtractionOptions }
    | { internal: InternalExtractionOptions }
): Promise<ExtractionTriggerResult> {
  if (backend === "external") {
    const response = await triggerExternalExtraction(
      req as ExternalExtractionRequest,
      "external" in options ? options.external : undefined
    )
    return { backend: "external", response }
  }

  if (!("internal" in options)) {
    throw new Error("Internal extraction options are required.")
  }

  const response = await triggerInternalExtraction(
    req as InternalExtractionRequest,
    options.internal
  )
  return { backend: "internal", response }
}

export async function getExtractionStatus(
  runId: string,
  backend: ExtractorBackend,
  options?: ExternalExtractionOptions
): Promise<ExtractionStatusResponse> {
  const baseUrl =
    backend === "internal" ? getInternalBaseUrl() : getExternalBaseUrl(options)

  const res = await fetch(`${baseUrl}/api/extract/${runId}/status`, {
    headers: backend === "external" ? getExternalHeaders(options) : undefined,
  })
  if (!res.ok) throw new Error(`getExtractionStatus failed: ${res.status}`)
  return res.json() as Promise<ExtractionStatusResponse>
}

export async function getExtractionResults(
  runId: string,
  backend: ExtractorBackend,
  options?: ExternalExtractionOptions
): Promise<ExtractionResultsResponse> {
  const baseUrl =
    backend === "internal" ? getInternalBaseUrl() : getExternalBaseUrl(options)

  const res = await fetch(`${baseUrl}/api/extract/${runId}/results`, {
    headers: backend === "external" ? getExternalHeaders(options) : undefined,
  })
  if (!res.ok) throw new Error(`getExtractionResults failed: ${res.status}`)
  return res.json() as Promise<ExtractionResultsResponse>
}
