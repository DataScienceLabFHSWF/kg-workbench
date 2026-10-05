import { eq } from "drizzle-orm"
import type { OntologyLocalizedTextInsert } from "@/domain/ontology"
import type { ModuleTransfer } from "@/features/ontology/schemas/module-transfer"
import { getDb } from "@/server/database"
import {
  ontologyAttributes,
  ontologyClasses,
  ontologyCompetencyQuestionModules,
  ontologyCompetencyQuestions,
  ontologyExamples,
  ontologyLocalizedTexts,
  ontologyModules,
  ontologyNotes,
  ontologyRelationAttributes,
  ontologyRelations,
} from "@/server/db/schema"
import { buildModuleLocalizedTextInserts } from "../localized-texts"
import {
  buildMissingParentWarning,
  buildMissingRelationWarning,
} from "../shared"
import { assertModuleNameAvailable } from "../store"
import type {
  CreateModuleLocalizedTextInput,
  DuplicateModuleResult,
} from "../types"
import { describeCQ } from "./module-transfer-mappers"
import {
  resolveExampleInsert,
  resolveLocalizedTextInsert,
  resolveModuleTargetId,
  resolveNoteInsert,
} from "./resolve-module-transfer-inserts"
type Maps = {
  oldAttributeIdToNewId: Map<string, string>
  oldClassIdToNewId: Map<string, string>
  oldCQIdToNewId: Map<string, string>
  oldRelationAttributeIdToNewId: Map<string, string>
  oldRelationIdToNewId: Map<string, string>
}
function mapRef(
  sourceId: string | null | undefined,
  label: string,
  type: "subject class" | "predicate relation" | "object class",
  map: Map<string, string>,
  warnings: string[]
) {
  if (!sourceId) return null
  const id = map.get(sourceId)
  if (id) return id
  warnings.push(
    `Cleared ${type} on competency question "${label}" because "${sourceId}" could not be resolved.`
  )
  return null
}
export async function persistModuleTransferPayload({
  ontologyId,
  name,
  description,
  localizedTexts = [],
  payload,
}: {
  ontologyId: string
  name: string
  description?: string
  localizedTexts?: CreateModuleLocalizedTextInput[]
  payload: ModuleTransfer
}): Promise<DuplicateModuleResult> {
  const db = getDb()
  const [module] = await db
    .insert(ontologyModules)
    .values({
      ontology_id: ontologyId,
      name: await assertModuleNameAvailable(ontologyId, name),
      description: description ?? payload.description ?? "",
    })
    .returning()
  if (!module) throw new Error("Could not create module.")
  const existingModules = await db
    .select({ id: ontologyModules.id, name: ontologyModules.name })
    .from(ontologyModules)
    .where(eq(ontologyModules.ontology_id, ontologyId))
  const moduleIds = new Set(existingModules.map((row) => row.id)),
    moduleByName = new Map(existingModules.map((row) => [row.name, row.id])),
    warnings: string[] = [],
    maps: Maps = {
      oldAttributeIdToNewId: new Map(),
      oldClassIdToNewId: new Map(),
      oldCQIdToNewId: new Map(),
      oldRelationAttributeIdToNewId: new Map(),
      oldRelationIdToNewId: new Map(),
    }
  for (const source of payload.classes) {
    const [row] = await db
      .insert(ontologyClasses)
      .values({
        ontology_id: ontologyId,
        module_id: module.id,
        name: source.name,
        description: source.description ?? "",
        parent_class_id: null,
      })
      .returning()
    if (!row) throw new Error("Could not save class.")
    maps.oldClassIdToNewId.set(source.id, row.id)
  }
  for (const source of payload.classes) {
    if (!source.parentClassId) continue
    const id = maps.oldClassIdToNewId.get(source.id),
      parent = maps.oldClassIdToNewId.get(source.parentClassId)
    if (!id || !parent) {
      warnings.push(
        buildMissingParentWarning(source.name, source.parentClassId)
      )
      continue
    }
    await db
      .update(ontologyClasses)
      .set({ parent_class_id: parent })
      .where(eq(ontologyClasses.id, id))
  }
  for (const source of payload.classes) {
    const classId = maps.oldClassIdToNewId.get(source.id)
    if (!classId) continue
    for (const attribute of source.attributes) {
      const [row] = await db
        .insert(ontologyAttributes)
        .values({
          class_id: classId,
          name: attribute.name,
          data_type: attribute.dataType,
          required: attribute.required,
          description: attribute.description ?? "",
        })
        .returning()
      if (!row) throw new Error("Could not save attribute.")
      if (attribute.id) maps.oldAttributeIdToNewId.set(attribute.id, row.id)
    }
  }
  for (const source of payload.relations) {
    const domain = maps.oldClassIdToNewId.get(source.domainClassId),
      range = maps.oldClassIdToNewId.get(source.rangeClassId)
    if (!domain || !range) {
      warnings.push(buildMissingRelationWarning(source.name))
      continue
    }
    const [row] = await db
      .insert(ontologyRelations)
      .values({
        ontology_id: ontologyId,
        name: source.name,
        domain_class_id: domain,
        range_class_id: range,
        description: source.description ?? "",
        inverse_name: source.inverseName ?? null,
        cardinality: source.cardinality ?? null,
      })
      .returning()
    if (!row) throw new Error("Could not save relation.")
    if (source.id) maps.oldRelationIdToNewId.set(source.id, row.id)
  }
  for (const source of payload.relationAttributes) {
    const relationId = maps.oldRelationIdToNewId.get(source.relationId)
    if (!relationId) {
      warnings.push(
        `Skipped relation attribute "${source.name}" because relation "${source.relationId}" could not be resolved.`
      )
      continue
    }
    const [row] = await db
      .insert(ontologyRelationAttributes)
      .values({
        relation_id: relationId,
        name: source.name,
        data_type: source.dataType,
        description: source.description ?? "",
        required: source.required,
        sort_order: source.sortOrder,
      })
      .returning()
    if (!row) throw new Error("Could not save relation attribute.")
    if (source.id) maps.oldRelationAttributeIdToNewId.set(source.id, row.id)
  }
  const pending: Array<{
    id: string
    label: string
    subject?: string | null
    predicate?: string | null
    object?: string | null
  }> = []
  for (const source of payload.competencyQuestions) {
    const label = describeCQ(source)
    const [row] = await db
      .insert(ontologyCompetencyQuestions)
      .values({
        ontology_id: ontologyId,
        question: source.question,
        subject_class_id: mapRef(
          source.subjectClassId,
          label,
          "subject class",
          maps.oldClassIdToNewId,
          warnings
        ),
        predicate_relation_id: mapRef(
          source.predicateRelationId,
          label,
          "predicate relation",
          maps.oldRelationIdToNewId,
          warnings
        ),
        object_class_id: mapRef(
          source.objectClassId,
          label,
          "object class",
          maps.oldClassIdToNewId,
          warnings
        ),
        subject_example_id: null,
        predicate_example_id: null,
        object_example_id: null,
        sort_order: source.sortOrder,
      })
      .returning()
    if (!row) throw new Error("Could not save competency question.")
    if (source.id) maps.oldCQIdToNewId.set(source.id, row.id)
    pending.push({
      id: row.id,
      label,
      subject: source.subjectExampleId,
      predicate: source.predicateExampleId,
      object: source.objectExampleId,
    })
    const links = source.modules.flatMap((ref) => {
      const moduleId = resolveModuleTargetId({
        moduleRef: ref,
        currentModuleId: module.id,
        existingModuleIdByName: moduleByName,
        existingModuleIdSet: moduleIds,
        payloadModuleId: payload.id,
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
  const texts: OntologyLocalizedTextInsert[] = payload.localizedTexts.flatMap(
    (text) => {
      const insert = resolveLocalizedTextInsert({
        localizedText: text,
        moduleRowId: module.id,
        payloadModuleId: payload.id,
        ontologyId,
        warnings,
        ...maps,
      })
      return insert ? [insert] : []
    }
  )
  texts.push(
    ...buildModuleLocalizedTextInserts({
      ontologyId,
      moduleId: module.id,
      localizedTexts,
    })
  )
  if (texts.length) await db.insert(ontologyLocalizedTexts).values(texts)
  const notes = payload.notes.flatMap((note) => {
    const insert = resolveNoteInsert({
      note,
      moduleRowId: module.id,
      payloadModuleId: payload.id,
      ontologyId,
      warnings,
      ...maps,
    })
    return insert ? [insert] : []
  })
  if (notes.length) await db.insert(ontologyNotes).values(notes)
  const examples = new Map<string, string>()
  for (const source of payload.examples) {
    const insert = resolveExampleInsert({
      example: source,
      ontologyId,
      warnings,
      ...maps,
    })
    if (!insert) continue
    const [row] = await db.insert(ontologyExamples).values(insert).returning()
    if (!row) throw new Error("Could not save example.")
    if (source.id) examples.set(source.id, row.id)
  }
  for (const ref of pending)
    await db
      .update(ontologyCompetencyQuestions)
      .set({
        subject_example_id: ref.subject
          ? (examples.get(ref.subject) ?? null)
          : null,
        predicate_example_id: ref.predicate
          ? (examples.get(ref.predicate) ?? null)
          : null,
        object_example_id: ref.object
          ? (examples.get(ref.object) ?? null)
          : null,
      })
      .where(eq(ontologyCompetencyQuestions.id, ref.id))
  return { module, warnings }
}
