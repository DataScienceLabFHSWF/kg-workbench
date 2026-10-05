import type { ModuleTransfer } from "@/features/ontology/schemas/module-transfer"
import type { OntologyModule } from "@/domain/ontology"

export interface BuildModuleExportResult {
  fileName: string
  payload: ModuleTransfer
  warnings: string[]
}

export interface DuplicateModuleResult {
  module: OntologyModule
  warnings: string[]
}

export interface ModuleDeleteImpact {
  classCount: number
  relationCount: number
}

export interface ImportModuleFromJsonInput {
  ontologyId: string
  file: File
  name?: string
  description?: string
  localizedTexts?: CreateModuleLocalizedTextInput[]
  confirmWarnings?: boolean
}

export interface CreateModuleLocalizedTextInput {
  fieldName: string
  languageCode: string
  value: string
}

export interface CreateModuleInput {
  ontologyId: string
  name: string
  description?: string
  localizedTexts?: CreateModuleLocalizedTextInput[]
}

export type ImportModuleFromJsonResult =
  | {
      status: "needs-confirmation"
      name: string
      warnings: string[]
    }
  | {
      status: "imported"
      module: OntologyModule
      warnings: string[]
    }
