import type { FactWithAnchors } from "../../server/queries"
import type { DialogType, FactEntityRole, PendingEntityClass } from "./types"

type RelationConstraint = {
  domain_class_id: string | null
  range_class_id: string | null
}

interface PendingEntityClassDialogState {
  dialogType: DialogType
  affectedFacts: FactWithAnchors[]
  pendingEntityClass: PendingEntityClass
}

interface GetPendingEntityClassDialogStateParams {
  fact: FactWithAnchors
  role: FactEntityRole
  classId: string | null
  allFacts: FactWithAnchors[]
  relationMap: Map<string, RelationConstraint>
}

export function getPendingEntityClassDialogState({
  fact,
  role,
  classId,
  allFacts,
  relationMap,
}: GetPendingEntityClassDialogStateParams): PendingEntityClassDialogState | null {
  const entityId =
    role === "subject" ? fact.subject_entity_id : fact.object_entity_id

  if (!entityId) {
    return null
  }

  if (classId === null) {
    const currentClassId =
      role === "subject" ? fact.subject_class_id : fact.object_class_id

    if (currentClassId === null) {
      return null
    }

    const referencedFacts = findFactsReferencingEntity(allFacts, entityId)
    if (referencedFacts.length === 0) {
      return null
    }

    return {
      dialogType: "class-clear",
      affectedFacts: referencedFacts,
      pendingEntityClass: { role, classId },
    }
  }

  const conflicts = findRelationConflicts({
    allFacts,
    entityId,
    newClassId: classId,
    relationMap,
  })

  if (conflicts.length > 0) {
    return {
      dialogType: "relation-break",
      affectedFacts: conflicts,
      pendingEntityClass: { role, classId },
    }
  }

  const currentClassId =
    role === "subject" ? fact.subject_class_id : fact.object_class_id

  if (currentClassId !== null) {
    return null
  }

  const referencedFacts = findFactsReferencingEntity(allFacts, entityId)
  if (referencedFacts.length === 0) {
    return null
  }

  return {
    dialogType: "class-assign",
    affectedFacts: referencedFacts,
    pendingEntityClass: { role, classId },
  }
}

function findRelationConflicts({
  allFacts,
  entityId,
  newClassId,
  relationMap,
}: {
  allFacts: FactWithAnchors[]
  entityId: string
  newClassId: string
  relationMap: Map<string, RelationConstraint>
}): FactWithAnchors[] {
  return allFacts.filter((candidateFact) => {
    if (!candidateFact.relation_type_id) return false

    const relation = relationMap.get(candidateFact.relation_type_id)
    if (!relation) return false

    const isSubject = candidateFact.subject_entity_id === entityId
    const isObject = candidateFact.object_entity_id === entityId

    if (!isSubject && !isObject) return false
    if (isSubject && relation.domain_class_id !== newClassId) return true
    if (isObject && relation.range_class_id !== newClassId) return true

    return false
  })
}

function findFactsReferencingEntity(
  allFacts: FactWithAnchors[],
  entityId: string
): FactWithAnchors[] {
  return allFacts.filter(
    (candidateFact) =>
      candidateFact.subject_entity_id === entityId ||
      candidateFact.object_entity_id === entityId
  )
}
