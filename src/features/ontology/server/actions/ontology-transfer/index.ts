"use server"

import { buildOntologyExportInternal } from "./build-ontology-export"
import { importOntologyFromJsonInternal } from "./import-ontology-from-json"
import type {
  BuildOntologyExportInput,
  BuildOntologyExportResult,
  ImportOntologyFromJsonResult,
} from "./types"

export type {
  BuildOntologyExportInput,
  BuildOntologyExportResult,
  ImportOntologyFromJsonResult,
} from "./types"

export async function buildOntologyExport(
  input: BuildOntologyExportInput
): Promise<BuildOntologyExportResult> {
  return buildOntologyExportInternal(input)
}

export async function importOntologyFromJson(
  file: File
): Promise<ImportOntologyFromJsonResult> {
  return importOntologyFromJsonInternal(file)
}
