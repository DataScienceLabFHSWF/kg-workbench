import type { ImportLocalizedText } from "@/features/ontology/schemas/import"

import { getOntologyLocalizedTextsByOntology } from "../../../queries"
import type { LocalizedTextTargetType } from "./types"

export function createLocalizedTextKey(
  targetType: LocalizedTextTargetType,
  targetId: string,
  fieldName: string,
  languageCode: string
) {
  return `${targetType}:${targetId}:${fieldName}:${languageCode}`
}

export function buildLocalizedTextValueMap(
  localizedTexts: Awaited<
    ReturnType<typeof getOntologyLocalizedTextsByOntology>
  >
) {
  return new Map(
    localizedTexts.flatMap((text) => {
      if (text.target_ontology_id) {
        return [
          [
            createLocalizedTextKey(
              "ontology",
              text.target_ontology_id,
              text.field_name,
              text.language_code
            ),
            text.value,
          ] as const,
        ]
      }

      if (text.target_module_id) {
        return [
          [
            createLocalizedTextKey(
              "module",
              text.target_module_id,
              text.field_name,
              text.language_code
            ),
            text.value,
          ] as const,
        ]
      }

      if (text.target_class_id) {
        return [
          [
            createLocalizedTextKey(
              "class",
              text.target_class_id,
              text.field_name,
              text.language_code
            ),
            text.value,
          ] as const,
        ]
      }

      if (text.target_relation_id) {
        return [
          [
            createLocalizedTextKey(
              "relation",
              text.target_relation_id,
              text.field_name,
              text.language_code
            ),
            text.value,
          ] as const,
        ]
      }

      if (text.target_attribute_id) {
        return [
          [
            createLocalizedTextKey(
              "attribute",
              text.target_attribute_id,
              text.field_name,
              text.language_code
            ),
            text.value,
          ] as const,
        ]
      }

      if (text.target_relation_attribute_id) {
        return [
          [
            createLocalizedTextKey(
              "relation_attribute",
              text.target_relation_attribute_id,
              text.field_name,
              text.language_code
            ),
            text.value,
          ] as const,
        ]
      }

      if (text.target_cq_id) {
        return [
          [
            createLocalizedTextKey(
              "cq",
              text.target_cq_id,
              text.field_name,
              text.language_code
            ),
            text.value,
          ] as const,
        ]
      }

      return []
    })
  )
}

export function buildExportLocalizedTexts({
  localizedTexts,
  ontologyId,
  moduleIds,
  classIds,
  relationIds,
  attributeIds,
  relationAttributeIds,
  cqIds,
}: {
  localizedTexts: Awaited<
    ReturnType<typeof getOntologyLocalizedTextsByOntology>
  >
  ontologyId: string
  moduleIds: Set<string>
  classIds: Set<string>
  relationIds: Set<string>
  attributeIds: Set<string>
  relationAttributeIds: Set<string>
  cqIds: Set<string>
}): ImportLocalizedText[] {
  const next: ImportLocalizedText[] = []

  for (const text of localizedTexts) {
    if (!text.value.trim()) continue

    if (text.target_ontology_id === ontologyId) {
      next.push({
        targetType: "ontology",
        targetId: text.target_ontology_id,
        fieldName: text.field_name,
        languageCode: text.language_code,
        value: text.value,
      })
      continue
    }

    if (text.target_module_id && moduleIds.has(text.target_module_id)) {
      next.push({
        targetType: "module",
        targetId: text.target_module_id,
        fieldName: text.field_name,
        languageCode: text.language_code,
        value: text.value,
      })
      continue
    }

    if (text.target_class_id && classIds.has(text.target_class_id)) {
      next.push({
        targetType: "class",
        targetId: text.target_class_id,
        fieldName: text.field_name,
        languageCode: text.language_code,
        value: text.value,
      })
      continue
    }

    if (text.target_relation_id && relationIds.has(text.target_relation_id)) {
      next.push({
        targetType: "relation",
        targetId: text.target_relation_id,
        fieldName: text.field_name,
        languageCode: text.language_code,
        value: text.value,
      })
      continue
    }

    if (
      text.target_attribute_id &&
      attributeIds.has(text.target_attribute_id)
    ) {
      next.push({
        targetType: "attribute",
        targetId: text.target_attribute_id,
        fieldName: text.field_name,
        languageCode: text.language_code,
        value: text.value,
      })
      continue
    }

    if (
      text.target_relation_attribute_id &&
      relationAttributeIds.has(text.target_relation_attribute_id)
    ) {
      next.push({
        targetType: "relation_attribute",
        targetId: text.target_relation_attribute_id,
        fieldName: text.field_name,
        languageCode: text.language_code,
        value: text.value,
      })
      continue
    }

    if (text.target_cq_id && cqIds.has(text.target_cq_id)) {
      next.push({
        targetType: "cq",
        targetId: text.target_cq_id,
        fieldName: text.field_name,
        languageCode: text.language_code,
        value: text.value,
      })
    }
  }

  return next
}
