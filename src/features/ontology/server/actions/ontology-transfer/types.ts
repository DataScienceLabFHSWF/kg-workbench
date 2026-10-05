import type { ImportOntology } from "@/features/ontology/schemas/import"

export interface ImportOntologyFromJsonResult {
  ontologyId: string
  warnings: string[]
}

export interface BuildOntologyExportInput {
  exportLanguage: string
  missingTranslationBehavior: "fallback" | "strict"
  ontologyId: string
  moduleIds: string[]
  classIds: string[]
  relationIds: string[]
  includeVisual: boolean
}

export interface BuildOntologyExportResult {
  fileName: string
  payload: ImportOntology
}
