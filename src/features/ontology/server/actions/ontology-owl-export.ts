"use server"

import {
  buildOntologyExport,
  type BuildOntologyExportInput,
} from "./ontology-transfer"
import { buildOwlOntology } from "../owl-export/owl-builder"

export type BuildOntologyOwlExportInput = Omit<
  BuildOntologyExportInput,
  "includeVisual"
> & {
  baseIri: string
}

export interface BuildOntologyOwlExportResult {
  content: string
  fileName: string
}

export async function buildOntologyOwlExport({
  baseIri,
  exportLanguage,
  missingTranslationBehavior,
  classIds,
  moduleIds,
  ontologyId,
  relationIds,
}: BuildOntologyOwlExportInput): Promise<BuildOntologyOwlExportResult> {
  const jsonExport = await buildOntologyExport({
    exportLanguage,
    missingTranslationBehavior,
    ontologyId,
    moduleIds,
    classIds,
    relationIds,
    includeVisual: false,
  })

  return {
    content: buildOwlOntology({ baseIri, ontology: jsonExport.payload }),
    fileName: jsonExport.fileName.replace(/\.json$/i, ".owl"),
  }
}
