import { ontologyImportExample } from "@/features/ontology/schemas/import-format"
import type { ExternalExtractionRequest } from "@/server/external/extraction-api"

export const externalExtractionRequestExample = {
  runId: "run_01HZX6Y6E2VQ2P9K3W8A6J4M9T",
  documentId: "document_01HZX6Y1HQ0P4PDF",
  ontologyId: "ontology_01HZX6XGRH8V2JY4V1X2Z7K9QN",
  file: {
    name: "example.txt",
    contentType: "text/plain",
    base64: "QWNtZSBHbWJIIHNoaXBzIGJhdHRlcmllcy4=",
  },
  ontology: ontologyImportExample,
} satisfies ExternalExtractionRequest

export const externalExtractionRequestExampleJson = JSON.stringify(
  externalExtractionRequestExample,
  null,
  2
)
