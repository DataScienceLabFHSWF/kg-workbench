import type { ImportOntology } from "@/features/ontology/schemas/import"
import {
  ontologyCompetencyQuestionModules,
  ontologyCompetencyQuestions,
} from "@/server/db/schema"
import { resolveImportedModuleId } from "../helpers"
import type {
  ImportIdMaps,
  PendingCQExampleRef,
  ServerClient,
} from "./shared-types"
import { describeCQ } from "./warning-helpers"
function resolveMappedReference({
  sourceId,
  label,
  refType,
  idMap,
  warnings,
}: {
  sourceId: string | null | undefined
  label: string
  refType: "subject class" | "predicate relation" | "object class"
  idMap: Map<string, string>
  warnings: string[]
}) {
  if (!sourceId) return null
  if (idMap.has(sourceId)) return idMap.get(sourceId) ?? null
  warnings.push(
    `Cleared ${refType} on competency question "${label}" because "${sourceId}" could not be resolved.`
  )
  return null
}
export async function persistCompetencyQuestions({
  db,
  ontologyId,
  parsed,
  idMaps,
  warnings,
}: {
  db: ServerClient
  ontologyId: string
  parsed: ImportOntology
  idMaps: ImportIdMaps
  warnings: string[]
}) {
  const pending: PendingCQExampleRef[] = []
  for (const cq of parsed.competencyQuestions) {
    const label = describeCQ(cq)
    const [row] = await db
      .insert(ontologyCompetencyQuestions)
      .values({
        ontology_id: ontologyId,
        question: cq.question,
        subject_class_id: resolveMappedReference({
          sourceId: cq.subjectClassId,
          label,
          refType: "subject class",
          idMap: idMaps.oldClassIdToNewId,
          warnings,
        }),
        predicate_relation_id: resolveMappedReference({
          sourceId: cq.predicateRelationId,
          label,
          refType: "predicate relation",
          idMap: idMaps.oldRelationIdToNewId,
          warnings,
        }),
        object_class_id: resolveMappedReference({
          sourceId: cq.objectClassId,
          label,
          refType: "object class",
          idMap: idMaps.oldClassIdToNewId,
          warnings,
        }),
        subject_example_id: null,
        predicate_example_id: null,
        object_example_id: null,
        sort_order: cq.sortOrder,
      })
      .returning()
    if (!row) throw new Error("Could not save competency question.")
    if (cq.id) idMaps.oldCQIdToNewId.set(cq.id, row.id)
    pending.push({
      cqId: row.id,
      label,
      objectExampleId: cq.objectExampleId,
      predicateExampleId: cq.predicateExampleId,
      subjectExampleId: cq.subjectExampleId,
    })
    const links = cq.modules.flatMap((ref) => {
      const moduleId = resolveImportedModuleId({
        moduleId: ref.id ?? null,
        moduleName: ref.name,
        moduleIdByLegacyId: idMaps.moduleIdByLegacyId,
        moduleIdByName: idMaps.moduleIdByName,
      })
      if (!moduleId) {
        warnings.push(
          `Dropped module link "${ref.name}" from competency question "${label}" because the module could not be resolved.`
        )
        return []
      }
      return [{ cq_id: row.id, module_id: moduleId }]
    })
    if (links.length)
      await db.insert(ontologyCompetencyQuestionModules).values(links)
  }
  return pending
}
