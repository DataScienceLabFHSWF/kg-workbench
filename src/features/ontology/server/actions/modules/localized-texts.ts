import type { OntologyLocalizedTextInsert } from "@/domain/ontology"

import type { CreateModuleLocalizedTextInput } from "./types"

interface BuildModuleLocalizedTextInsertsInput {
  localizedTexts: CreateModuleLocalizedTextInput[]
  moduleId: string
  ontologyId: string
}

export function buildModuleLocalizedTextInserts({
  localizedTexts,
  moduleId,
  ontologyId,
}: BuildModuleLocalizedTextInsertsInput): OntologyLocalizedTextInsert[] {
  return localizedTexts
    .map((localizedText) => ({
      ontology_id: ontologyId,
      target_module_id: moduleId,
      field_name: localizedText.fieldName,
      language_code: localizedText.languageCode,
      value: localizedText.value,
    }))
    .filter((localizedText) => Boolean(localizedText.value))
}
