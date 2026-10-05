import { ontologyImportJsonSchema } from "@/features/ontology/schemas/import-format"

export const externalExtractionRequestSchema = {
  $id: "https://kg-workbench.local/schema/external-extraction-request.json",
  title: "KG Workbench External Extraction Request",
  description:
    "Request body sent to POST /api/extract for a compatible external extractor.",
  type: "object",
  additionalProperties: false,
  required: ["runId", "documentId", "ontologyId", "file", "ontology"],
  properties: {
    runId: {
      type: "string",
      description:
        "Workbench extraction run id. Use this id for GET /api/extract/{runId}/status and GET /api/extract/{runId}/results.",
    },
    documentId: {
      type: "string",
      description: "Workbench document id for the uploaded source document.",
    },
    ontologyId: {
      type: "string",
      description: "Workbench ontology id selected for the extraction.",
    },
    file: {
      type: "object",
      additionalProperties: false,
      required: ["name", "contentType", "base64"],
      description: "Uploaded source document content encoded inline.",
      properties: {
        name: {
          type: "string",
          description: "Original uploaded file name.",
        },
        contentType: {
          type: "string",
          description:
            "MIME type of the uploaded file, for example application/pdf or text/plain.",
        },
        base64: {
          type: "string",
          contentEncoding: "base64",
          description: "Base64-encoded file bytes.",
        },
      },
    },
    ontology: {
      ...ontologyImportJsonSchema,
      description:
        "Ontology payload serialized in the canonical KG Workbench ontology import format.",
    },
  },
} as const

export const externalExtractionRequestSchemaJson = JSON.stringify(
  externalExtractionRequestSchema,
  null,
  2
)
