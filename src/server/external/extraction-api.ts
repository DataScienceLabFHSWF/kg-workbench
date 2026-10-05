// ── External extraction API contract ─────────────────────────────────────────
// Extraction API contract.
// External base URL: EXTRACTION_API_URL.
// Internal base URL: INTERNAL_EXTRACTION_API_URL.

import type { ImportOntology } from "@/features/ontology/schemas/import"

export const EXTRACTOR_BACKENDS = ["external", "internal"] as const
export type ExtractorBackend = (typeof EXTRACTOR_BACKENDS)[number]

export const INTERNAL_EXTRACTOR_PROVIDERS = [
  "openai",
  "anthropic",
  "ollama",
] as const
export type InternalExtractorProvider =
  (typeof INTERNAL_EXTRACTOR_PROVIDERS)[number]

export type InternalExtractionRequest = {
  documentId: string
  ontologyId: string
  modelName?: string
}

export type ExtractionFile = {
  name: string
  contentType: string
  base64: string
}

export type ExternalExtractionRequest = {
  runId: string
  documentId: string
  ontologyId: string
  file: ExtractionFile
  ontology: ImportOntology
}

export type ExternalExtractionOptions = {
  baseUrl?: string | null
  apiKey?: string
}

export type InternalExtractionSchemaAttribute = {
  name: string
  type: string
  description?: string
  required?: boolean
}

export type InternalExtractionSchemaNode = {
  label: string
  description?: string
  properties: InternalExtractionSchemaAttribute[]
}

export type InternalExtractionSchemaRelationship = {
  label: string
  description?: string
}

export type InternalExtractionSchema = {
  nodeTypes: InternalExtractionSchemaNode[]
  relationshipTypes: InternalExtractionSchemaRelationship[]
  patterns: [string, string, string][]
}

export type InternalExtractionOptions = {
  provider: InternalExtractorProvider
  apiKey?: string
  file: ExtractionFile
  schema: InternalExtractionSchema
}

export type ExtractionResponse = {
  runId: string
}

export type ExtractionTriggerResult = {
  backend: ExtractorBackend
  response: ExtractionResponse
}

export type ExtractionStatusResponse = {
  runId: string
  status: "pending" | "running" | "completed" | "failed"
  progress?: number
  error?: string
}

export type ParagraphResult = {
  id: string
  content: string
}

export type SectionResult = {
  id: string
  title: string
  paragraphs: ParagraphResult[]
}

export type ExtractionEntityAttribute = {
  attribute_name: string
  value: string
}

export type ExtractionEntityResult = {
  temp_id: string
  text: string
  className: string
  attributes: ExtractionEntityAttribute[]
}

export type ExtractionFactResult = {
  subject_temp_id: string
  relation_text: string
  object_temp_id: string
  subjectClassName: string
  objectClassName: string
  relationName: string
  confidence: number
  isCrossChapter?: boolean
  evidence: {
    quote: string
    sectionTitle: string
    paragraphId: string | null
    pageFrom?: number
    pageTo?: number
  } | null
}

export type ExtractionResultsResponse = {
  sections: SectionResult[]
  entities: ExtractionEntityResult[]
  facts: ExtractionFactResult[]
}

export type ExtractionResultPayload = ExtractionResultsResponse
