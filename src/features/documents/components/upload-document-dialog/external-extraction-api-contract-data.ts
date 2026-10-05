import {
  EXTERNAL_EXTRACTION_REQUEST_EXAMPLE_FILE_NAME,
  EXTERNAL_EXTRACTION_REQUEST_SCHEMA_FILE_NAME,
  externalExtractionRequestExampleJson,
  externalExtractionRequestSchemaJson,
} from "@/features/documents/schemas/external-extraction-request-format"
import {
  EXTERNAL_EXTRACTION_RESPONSE_EXAMPLE_FILE_NAME,
  EXTERNAL_EXTRACTION_RESPONSE_SCHEMA_FILE_NAME,
  externalExtractionResponseExampleJson,
  externalExtractionResponseSchemaJson,
} from "@/features/documents/schemas/external-extraction-response-format"

export type EndpointId = "trigger" | "status" | "results"
export type ContractSectionId = "request" | "response"

export interface CodeReference {
  title: string
  description: string
  fileName: string
  content: string
}

export interface ContractSection {
  title: string
  description: string
  example: CodeReference
  schema: CodeReference
}

interface EndpointContract {
  id: EndpointId
  label: string
  method: "POST" | "GET"
  path: string
  description: string
  request: ContractSection
  response: ContractSection
}

const runIdPathRequestExampleJson = JSON.stringify(
  {
    pathParams: {
      runId: "run_01HZX6Y6E2VQ2P9K3W8A6J4M9T",
    },
    headers: {
      Authorization: "Bearer <api-key>",
    },
    body: null,
  },
  null,
  2
)

const runIdPathRequestSchemaJson = JSON.stringify(
  {
    title: "Extraction Run Path Request",
    description:
      "Path parameters and optional bearer authorization for extraction polling endpoints. These GET endpoints do not accept a request body.",
    type: "object",
    additionalProperties: false,
    required: ["pathParams"],
    properties: {
      pathParams: {
        type: "object",
        additionalProperties: false,
        required: ["runId"],
        properties: {
          runId: {
            type: "string",
            description:
              "Workbench extraction run id returned by POST /api/extract.",
          },
        },
      },
      headers: {
        type: "object",
        additionalProperties: false,
        properties: {
          Authorization: {
            type: "string",
            description:
              "Optional bearer token when the external extractor requires an API key.",
          },
        },
      },
      body: {
        type: "null",
        description: "No request body is sent for this GET endpoint.",
      },
    },
  },
  null,
  2
)

const triggerResponseExampleJson = JSON.stringify(
  {
    runId: "run_01HZX6Y6E2VQ2P9K3W8A6J4M9T",
  },
  null,
  2
)

const triggerResponseSchemaJson = JSON.stringify(
  {
    title: "External Extraction Trigger Response",
    description:
      "Response body returned by POST /api/extract after the external extractor accepts the run.",
    type: "object",
    additionalProperties: false,
    required: ["runId"],
    properties: {
      runId: {
        type: "string",
        description:
          "The same extraction run id supplied by KG Workbench in the trigger request.",
      },
    },
  },
  null,
  2
)

const statusResponseExampleJson = JSON.stringify(
  {
    runId: "run_01HZX6Y6E2VQ2P9K3W8A6J4M9T",
    status: "running",
    progress: 42,
  },
  null,
  2
)

const statusResponseSchemaJson = JSON.stringify(
  {
    title: "External Extraction Status Response",
    description:
      "Response body returned by GET /api/extract/{runId}/status while KG Workbench polls the external extractor.",
    type: "object",
    additionalProperties: false,
    required: ["runId", "status"],
    properties: {
      runId: {
        type: "string",
        description: "Workbench extraction run id.",
      },
      status: {
        type: "string",
        enum: ["pending", "running", "completed", "failed"],
      },
      progress: {
        type: "number",
        minimum: 0,
        maximum: 100,
        description: "Optional progress percentage.",
      },
      error: {
        type: "string",
        description: "Optional failure message when status is failed.",
      },
    },
  },
  null,
  2
)

export const ENDPOINT_CONTRACTS = [
  {
    id: "trigger",
    label: "POST trigger",
    method: "POST",
    path: "/api/extract",
    description:
      "Starts an extraction run with the uploaded file and canonical ontology payload.",
    request: {
      title: "Request",
      description:
        "Body sent by KG Workbench when the user starts an external extraction.",
      example: {
        title: "Request example",
        description:
          "A compact trigger request with workbench ids, the uploaded file, and the ontology import payload.",
        fileName: EXTERNAL_EXTRACTION_REQUEST_EXAMPLE_FILE_NAME,
        content: externalExtractionRequestExampleJson,
      },
      schema: {
        title: "Request schema",
        description:
          "A machine-readable reference for the external extractor trigger request.",
        fileName: EXTERNAL_EXTRACTION_REQUEST_SCHEMA_FILE_NAME,
        content: externalExtractionRequestSchemaJson,
      },
    },
    response: {
      title: "Response",
      description:
        "Return the accepted run id so later status and results calls resolve the same extraction run.",
      example: {
        title: "Response example",
        description: "The trigger endpoint returns the accepted run id.",
        fileName: "external-extraction-trigger-response-example.json",
        content: triggerResponseExampleJson,
      },
      schema: {
        title: "Response schema",
        description:
          "A machine-readable reference for the trigger response payload.",
        fileName: "external-extraction-trigger-response-schema.json",
        content: triggerResponseSchemaJson,
      },
    },
  },
  {
    id: "status",
    label: "GET status",
    method: "GET",
    path: "/api/extract/{runId}/status",
    description:
      "Lets KG Workbench poll whether the external extraction is still pending, running, completed, or failed.",
    request: {
      title: "Request",
      description:
        "The status endpoint uses the extraction run id in the path and does not accept a request body.",
      example: {
        title: "Request example",
        description:
          "The status request uses path params, optional bearer auth, and no body.",
        fileName: "external-extraction-status-request-example.json",
        content: runIdPathRequestExampleJson,
      },
      schema: {
        title: "Request schema",
        description:
          "A machine-readable reference for path params and the empty request body.",
        fileName: "external-extraction-status-request-schema.json",
        content: runIdPathRequestSchemaJson,
      },
    },
    response: {
      title: "Response",
      description:
        "Return current lifecycle state, optional progress, and an error message when failed.",
      example: {
        title: "Response example",
        description: "A running extraction status response.",
        fileName: "external-extraction-status-response-example.json",
        content: statusResponseExampleJson,
      },
      schema: {
        title: "Response schema",
        description:
          "A machine-readable reference for the external extractor status response.",
        fileName: "external-extraction-status-response-schema.json",
        content: statusResponseSchemaJson,
      },
    },
  },
  {
    id: "results",
    label: "GET results",
    method: "GET",
    path: "/api/extract/{runId}/results",
    description:
      "Returns extracted sections, entities, facts, and evidence anchors after the run completes.",
    request: {
      title: "Request",
      description:
        "The results endpoint uses the extraction run id in the path and does not accept a request body.",
      example: {
        title: "Request example",
        description:
          "The results request uses path params, optional bearer auth, and no body.",
        fileName: "external-extraction-results-request-example.json",
        content: runIdPathRequestExampleJson,
      },
      schema: {
        title: "Request schema",
        description:
          "A machine-readable reference for path params and the empty request body.",
        fileName: "external-extraction-results-request-schema.json",
        content: runIdPathRequestSchemaJson,
      },
    },
    response: {
      title: "Response",
      description:
        "Return the normalized extraction result payload KG Workbench persists for review.",
      example: {
        title: "Response example",
        description:
          "A compact extraction result with sections, temporary entities, facts, and evidence anchors.",
        fileName: EXTERNAL_EXTRACTION_RESPONSE_EXAMPLE_FILE_NAME,
        content: externalExtractionResponseExampleJson,
      },
      schema: {
        title: "Response schema",
        description:
          "A machine-readable reference for the external extractor results payload.",
        fileName: EXTERNAL_EXTRACTION_RESPONSE_SCHEMA_FILE_NAME,
        content: externalExtractionResponseSchemaJson,
      },
    },
  },
] as const satisfies EndpointContract[]
