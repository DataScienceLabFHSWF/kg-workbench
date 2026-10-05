import type {
  OntologyExampleInsert,
  OntologyLocalizedTextInsert,
  OntologyNoteInsert,
} from "@/domain/ontology"
import type { ImportOntology } from "@/features/ontology/schemas/import"

import type { ImportIdMaps } from "./shared-types"

interface ResolveInsertBaseInput extends ImportIdMaps {
  ontologyId: string
  warnings: string[]
}

function resolveModuleId({
  targetId,
  moduleIdByLegacyId,
  moduleIdByName,
}: {
  targetId: string
  moduleIdByLegacyId: Map<string, string>
  moduleIdByName: Map<string, string>
}) {
  return (
    moduleIdByLegacyId.get(targetId) ?? moduleIdByName.get(targetId) ?? null
  )
}

export function resolveLocalizedTextInsert({
  localizedText,
  moduleIdByLegacyId,
  moduleIdByName,
  oldAttributeIdToNewId,
  oldClassIdToNewId,
  oldCQIdToNewId,
  oldRelationAttributeIdToNewId,
  oldRelationIdToNewId,
  ontologyId,
  warnings,
}: ResolveInsertBaseInput & {
  localizedText: ImportOntology["localizedTexts"][number]
}): OntologyLocalizedTextInsert | null {
  const trimmedValue = localizedText.value.trim()
  if (!trimmedValue) return null

  switch (localizedText.targetType) {
    case "ontology":
      return {
        ontology_id: ontologyId,
        target_ontology_id: ontologyId,
        field_name: localizedText.fieldName,
        language_code: localizedText.languageCode,
        value: trimmedValue,
      }
    case "module": {
      const moduleId = resolveModuleId({
        targetId: localizedText.targetId,
        moduleIdByLegacyId,
        moduleIdByName,
      })
      if (!moduleId) {
        warnings.push(
          `Skipped localized text for unresolved module target "${localizedText.targetId}".`
        )
        return null
      }

      return {
        ontology_id: ontologyId,
        target_module_id: moduleId,
        field_name: localizedText.fieldName,
        language_code: localizedText.languageCode,
        value: trimmedValue,
      }
    }
    case "class": {
      const classId = oldClassIdToNewId.get(localizedText.targetId)
      if (!classId) {
        warnings.push(
          `Skipped localized text for unresolved class target "${localizedText.targetId}".`
        )
        return null
      }

      return {
        ontology_id: ontologyId,
        target_class_id: classId,
        field_name: localizedText.fieldName,
        language_code: localizedText.languageCode,
        value: trimmedValue,
      }
    }
    case "relation": {
      const relationId = oldRelationIdToNewId.get(localizedText.targetId)
      if (!relationId) {
        warnings.push(
          `Skipped localized text for unresolved relation target "${localizedText.targetId}".`
        )
        return null
      }

      return {
        ontology_id: ontologyId,
        target_relation_id: relationId,
        field_name: localizedText.fieldName,
        language_code: localizedText.languageCode,
        value: trimmedValue,
      }
    }
    case "attribute": {
      const attributeId = oldAttributeIdToNewId.get(localizedText.targetId)
      if (!attributeId) {
        warnings.push(
          `Skipped localized text for unresolved attribute target "${localizedText.targetId}".`
        )
        return null
      }

      return {
        ontology_id: ontologyId,
        target_attribute_id: attributeId,
        field_name: localizedText.fieldName,
        language_code: localizedText.languageCode,
        value: trimmedValue,
      }
    }
    case "relation_attribute": {
      const relationAttributeId = oldRelationAttributeIdToNewId.get(
        localizedText.targetId
      )
      if (!relationAttributeId) {
        warnings.push(
          `Skipped localized text for unresolved relation attribute target "${localizedText.targetId}".`
        )
        return null
      }

      return {
        ontology_id: ontologyId,
        target_relation_attribute_id: relationAttributeId,
        field_name: localizedText.fieldName,
        language_code: localizedText.languageCode,
        value: trimmedValue,
      }
    }
    case "cq": {
      const cqId = oldCQIdToNewId.get(localizedText.targetId)
      if (!cqId) {
        warnings.push(
          `Skipped localized text for unresolved competency question target "${localizedText.targetId}".`
        )
        return null
      }

      return {
        ontology_id: ontologyId,
        target_cq_id: cqId,
        field_name: localizedText.fieldName,
        language_code: localizedText.languageCode,
        value: trimmedValue,
      }
    }
  }
}

export function resolveNoteInsert({
  note,
  moduleIdByLegacyId,
  moduleIdByName,
  oldAttributeIdToNewId,
  oldClassIdToNewId,
  oldCQIdToNewId,
  oldRelationAttributeIdToNewId,
  oldRelationIdToNewId,
  ontologyId,
  warnings,
}: ResolveInsertBaseInput & {
  note: ImportOntology["notes"][number]
}): OntologyNoteInsert | null {
  const trimmedBody = note.body.trim()
  if (!trimmedBody) return null

  const base = {
    ontology_id: ontologyId,
    body: trimmedBody,
    author_name: note.authorName || "",
    sort_order: note.sortOrder,
  }

  switch (note.targetType) {
    case "ontology":
      return { ...base, target_ontology_id: ontologyId }
    case "module": {
      const moduleId = resolveModuleId({
        targetId: note.targetId,
        moduleIdByLegacyId,
        moduleIdByName,
      })
      if (!moduleId) {
        warnings.push(
          `Skipped note for unresolved module target "${note.targetId}".`
        )
        return null
      }

      return { ...base, target_module_id: moduleId }
    }
    case "class": {
      const classId = oldClassIdToNewId.get(note.targetId)
      if (!classId) {
        warnings.push(
          `Skipped note for unresolved class target "${note.targetId}".`
        )
        return null
      }

      return { ...base, target_class_id: classId }
    }
    case "relation": {
      const relationId = oldRelationIdToNewId.get(note.targetId)
      if (!relationId) {
        warnings.push(
          `Skipped note for unresolved relation target "${note.targetId}".`
        )
        return null
      }

      return { ...base, target_relation_id: relationId }
    }
    case "attribute": {
      const attributeId = oldAttributeIdToNewId.get(note.targetId)
      if (!attributeId) {
        warnings.push(
          `Skipped note for unresolved attribute target "${note.targetId}".`
        )
        return null
      }

      return { ...base, target_attribute_id: attributeId }
    }
    case "relation_attribute": {
      const relationAttributeId = oldRelationAttributeIdToNewId.get(
        note.targetId
      )
      if (!relationAttributeId) {
        warnings.push(
          `Skipped note for unresolved relation attribute target "${note.targetId}".`
        )
        return null
      }

      return { ...base, target_relation_attribute_id: relationAttributeId }
    }
    case "cq": {
      const cqId = oldCQIdToNewId.get(note.targetId)
      if (!cqId) {
        warnings.push(
          `Skipped note for unresolved competency question target "${note.targetId}".`
        )
        return null
      }

      return { ...base, target_cq_id: cqId }
    }
  }
}

export function resolveExampleInsert({
  example,
  oldAttributeIdToNewId,
  oldClassIdToNewId,
  oldCQIdToNewId,
  oldRelationAttributeIdToNewId,
  oldRelationIdToNewId,
  ontologyId,
  warnings,
}: ResolveInsertBaseInput & {
  example: ImportOntology["examples"][number]
}): OntologyExampleInsert | null {
  const trimmedValue = example.value.trim()
  if (!trimmedValue) return null

  const base = {
    ontology_id: ontologyId,
    value: trimmedValue,
    subject_label: example.subjectLabel ?? null,
    predicate_label: example.predicateLabel ?? null,
    object_label: example.objectLabel ?? null,
    is_instance_candidate: example.isInstanceCandidate,
    sort_order: example.sortOrder,
  }

  switch (example.targetType) {
    case "class": {
      const classId = oldClassIdToNewId.get(example.targetId)
      if (!classId) {
        warnings.push(
          `Skipped example "${trimmedValue}" for unresolved class target "${example.targetId}".`
        )
        return null
      }

      return { ...base, target_class_id: classId }
    }
    case "attribute": {
      const attributeId = oldAttributeIdToNewId.get(example.targetId)
      if (!attributeId) {
        warnings.push(
          `Skipped example "${trimmedValue}" for unresolved attribute target "${example.targetId}".`
        )
        return null
      }

      return { ...base, target_attribute_id: attributeId }
    }
    case "relation": {
      const relationId = oldRelationIdToNewId.get(example.targetId)
      if (!relationId) {
        warnings.push(
          `Skipped example "${trimmedValue}" for unresolved relation target "${example.targetId}".`
        )
        return null
      }

      return { ...base, target_relation_id: relationId }
    }
    case "relation_attribute": {
      const relationAttributeId = oldRelationAttributeIdToNewId.get(
        example.targetId
      )
      if (!relationAttributeId) {
        warnings.push(
          `Skipped example "${trimmedValue}" for unresolved relation attribute target "${example.targetId}".`
        )
        return null
      }

      return { ...base, target_relation_attribute_id: relationAttributeId }
    }
    case "cq": {
      const cqId = oldCQIdToNewId.get(example.targetId)
      if (!cqId) {
        warnings.push(
          `Skipped example "${trimmedValue}" for unresolved competency question target "${example.targetId}".`
        )
        return null
      }

      return { ...base, target_cq_id: cqId }
    }
  }
}
