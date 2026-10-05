import type { ModuleTransfer } from "@/features/ontology/schemas/module-transfer"

import {
  buildMissingParentWarning,
  buildMissingRelationWarning,
} from "../shared"

export function analyzeModuleTransfer(payload: ModuleTransfer) {
  const classIds = new Set(payload.classes.map((cls) => cls.id))
  const relationIds = new Set(payload.relations.map((relation) => relation.id))
  const missingRelationWarnings = payload.relations
    .filter(
      (relation) =>
        !classIds.has(relation.domainClassId) ||
        !classIds.has(relation.rangeClassId)
    )
    .map((relation) => buildMissingRelationWarning(relation.name))

  const missingParentWarnings = payload.classes
    .filter(
      (cls) => Boolean(cls.parentClassId) && !classIds.has(cls.parentClassId!)
    )
    .map((cls) => buildMissingParentWarning(cls.name, cls.parentClassId!))

  const missingRelationAttributeWarnings = payload.relationAttributes
    .filter((attribute) => !relationIds.has(attribute.relationId))
    .map(
      (attribute) =>
        `Skipped relation attribute "${attribute.name}" because relation "${attribute.relationId}" is missing from the uploaded module JSON.`
    )

  return {
    missingRelationWarnings,
    missingParentWarnings,
    missingRelationAttributeWarnings,
  }
}
