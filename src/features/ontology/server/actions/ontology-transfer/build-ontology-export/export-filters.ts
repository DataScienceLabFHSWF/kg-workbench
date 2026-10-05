import { getOntologyCQs, getOntologyExamplesByOntology } from "../../../queries"

export function shouldExportCQ({
  cq,
  exportClassIds,
  exportRelationIds,
  relevantModuleIds,
}: {
  cq: Awaited<ReturnType<typeof getOntologyCQs>>[number]
  exportClassIds: Set<string>
  exportRelationIds: Set<string>
  relevantModuleIds: Set<string>
}) {
  if (cq.modules.some((module) => relevantModuleIds.has(module.id))) {
    return true
  }

  if (cq.modules.length > 0) {
    return false
  }

  const classRefs = [cq.subject_class_id, cq.object_class_id]
  const relationRefs = [cq.predicate_relation_id]

  return (
    classRefs.every((classId) => !classId || exportClassIds.has(classId)) &&
    relationRefs.every(
      (relationId) => !relationId || exportRelationIds.has(relationId)
    )
  )
}

export function isExampleExported({
  example,
  attributeIds,
  classIds,
  cqIds,
  relationAttributeIds,
  relationIds,
}: {
  example: Awaited<ReturnType<typeof getOntologyExamplesByOntology>>[number]
  attributeIds: Set<string>
  classIds: Set<string>
  cqIds: Set<string>
  relationAttributeIds: Set<string>
  relationIds: Set<string>
}) {
  return Boolean(
    (example.target_class_id && classIds.has(example.target_class_id)) ||
    (example.target_attribute_id &&
      attributeIds.has(example.target_attribute_id)) ||
    (example.target_relation_id &&
      relationIds.has(example.target_relation_id)) ||
    (example.target_relation_attribute_id &&
      relationAttributeIds.has(example.target_relation_attribute_id)) ||
    (example.target_cq_id && cqIds.has(example.target_cq_id))
  )
}
