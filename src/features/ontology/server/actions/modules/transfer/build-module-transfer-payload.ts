import { ModuleTransferSchema } from "@/features/ontology/schemas/module-transfer"
import { normalizeOntologyDataTypeOrDefault } from "@/features/ontology/utils/data-types"

import {
  getOntologyClasses,
  getOntologyCQs,
  getOntologyExamplesByOntology,
  getOntologyLocalizedTextsByOntology,
  getOntologyNotesByOntology,
  getOntologyRelations,
  getRelationAttributesByOntology,
} from "../../../queries"
import { sanitizeFileName } from "../shared"
import { getModuleRecord } from "../store"
import {
  buildExportExample,
  buildExportLocalizedText,
  buildExportNote,
} from "./module-transfer-mappers"

function isModuleNote({
  note,
  moduleId,
  moduleClassIds,
  moduleRelationIds,
  moduleAttributeIds,
  moduleRelationAttributeIds,
  moduleCQIds,
}: {
  note: Awaited<ReturnType<typeof getOntologyNotesByOntology>>[number]
  moduleId: string
  moduleClassIds: Set<string>
  moduleRelationIds: Set<string>
  moduleAttributeIds: Set<string>
  moduleRelationAttributeIds: Set<string>
  moduleCQIds: Set<string>
}) {
  return Boolean(
    note.target_module_id === moduleId ||
    (note.target_class_id && moduleClassIds.has(note.target_class_id)) ||
    (note.target_relation_id &&
      moduleRelationIds.has(note.target_relation_id)) ||
    (note.target_attribute_id &&
      moduleAttributeIds.has(note.target_attribute_id)) ||
    (note.target_relation_attribute_id &&
      moduleRelationAttributeIds.has(note.target_relation_attribute_id)) ||
    (note.target_cq_id && moduleCQIds.has(note.target_cq_id))
  )
}

function isModuleLocalizedText({
  text,
  moduleId,
  moduleClassIds,
  moduleRelationIds,
  moduleAttributeIds,
  moduleRelationAttributeIds,
  moduleCQIds,
}: {
  text: Awaited<ReturnType<typeof getOntologyLocalizedTextsByOntology>>[number]
  moduleId: string
  moduleClassIds: Set<string>
  moduleRelationIds: Set<string>
  moduleAttributeIds: Set<string>
  moduleRelationAttributeIds: Set<string>
  moduleCQIds: Set<string>
}) {
  return Boolean(
    text.target_module_id === moduleId ||
    (text.target_class_id && moduleClassIds.has(text.target_class_id)) ||
    (text.target_relation_id &&
      moduleRelationIds.has(text.target_relation_id)) ||
    (text.target_attribute_id &&
      moduleAttributeIds.has(text.target_attribute_id)) ||
    (text.target_relation_attribute_id &&
      moduleRelationAttributeIds.has(text.target_relation_attribute_id)) ||
    (text.target_cq_id && moduleCQIds.has(text.target_cq_id))
  )
}

function isModuleExample({
  example,
  moduleClassIds,
  moduleRelationIds,
  moduleAttributeIds,
  moduleRelationAttributeIds,
  moduleCQIds,
}: {
  example: Awaited<ReturnType<typeof getOntologyExamplesByOntology>>[number]
  moduleClassIds: Set<string>
  moduleRelationIds: Set<string>
  moduleAttributeIds: Set<string>
  moduleRelationAttributeIds: Set<string>
  moduleCQIds: Set<string>
}) {
  return Boolean(
    (example.target_class_id && moduleClassIds.has(example.target_class_id)) ||
    (example.target_attribute_id &&
      moduleAttributeIds.has(example.target_attribute_id)) ||
    (example.target_relation_id &&
      moduleRelationIds.has(example.target_relation_id)) ||
    (example.target_relation_attribute_id &&
      moduleRelationAttributeIds.has(example.target_relation_attribute_id)) ||
    (example.target_cq_id && moduleCQIds.has(example.target_cq_id))
  )
}

export async function buildModuleTransferPayload(moduleId: string) {
  const ontologyModule = await getModuleRecord(moduleId)
  const [
    classes,
    relations,
    relationAttributesByRelation,
    localizedTexts,
    notes,
    examples,
    cqs,
  ] = await Promise.all([
    getOntologyClasses(ontologyModule.ontology_id),
    getOntologyRelations(ontologyModule.ontology_id),
    getRelationAttributesByOntology(ontologyModule.ontology_id),
    getOntologyLocalizedTextsByOntology(ontologyModule.ontology_id),
    getOntologyNotesByOntology(ontologyModule.ontology_id),
    getOntologyExamplesByOntology(ontologyModule.ontology_id),
    getOntologyCQs(ontologyModule.ontology_id),
  ])

  const warnings: string[] = []
  const moduleClasses = classes.filter((cls) => cls.module_id === moduleId)
  const moduleClassIds = new Set(moduleClasses.map((cls) => cls.id))
  const moduleRelations = relations.filter(
    (relation) =>
      moduleClassIds.has(relation.domain_class_id) &&
      moduleClassIds.has(relation.range_class_id)
  )
  const moduleRelationIds = new Set(
    moduleRelations.map((relation) => relation.id)
  )
  const moduleAttributeIds = new Set(
    moduleClasses.flatMap((cls) =>
      cls.attributes.map((attribute) => attribute.id)
    )
  )
  const moduleRelationAttributes = moduleRelations.flatMap(
    (relation) => relationAttributesByRelation[relation.id] ?? []
  )
  const moduleRelationAttributeIds = new Set(
    moduleRelationAttributes.map((attribute) => attribute.id)
  )
  const moduleCQs = cqs.filter((cq) =>
    cq.modules.some((linkedModule) => linkedModule.id === moduleId)
  )
  const moduleCQIds = new Set(moduleCQs.map((cq) => cq.id))
  const moduleExamples = examples.filter((example) =>
    isModuleExample({
      example,
      moduleClassIds,
      moduleRelationIds,
      moduleAttributeIds,
      moduleRelationAttributeIds,
      moduleCQIds,
    })
  )

  const payload = ModuleTransferSchema.parse({
    id: ontologyModule.id,
    name: ontologyModule.name,
    description: ontologyModule.description ?? "",
    classes: moduleClasses.map((cls) => {
      const parentClassId =
        cls.parent_class_id && moduleClassIds.has(cls.parent_class_id)
          ? cls.parent_class_id
          : null

      if (cls.parent_class_id && !parentClassId) {
        warnings.push(
          `Dropped parent link from "${cls.name}" because the parent class is outside module "${ontologyModule.name}".`
        )
      }

      return {
        id: cls.id,
        name: cls.name,
        description: cls.description ?? "",
        parentClassId,
        attributes: cls.attributes.map((attribute) => ({
          id: attribute.id,
          name: attribute.name,
          dataType: normalizeOntologyDataTypeOrDefault(attribute.data_type),
          required: attribute.required,
          description: attribute.description ?? "",
        })),
      }
    }),
    relations: moduleRelations.map((relation) => ({
      id: relation.id,
      name: relation.name,
      domainClassId: relation.domain_class_id,
      rangeClassId: relation.range_class_id,
      description: relation.description ?? "",
      inverseName: relation.inverse_name,
      cardinality: relation.cardinality,
    })),
    relationAttributes: moduleRelationAttributes.map((attribute) => ({
      id: attribute.id,
      relationId: attribute.relation_id,
      name: attribute.name,
      dataType: normalizeOntologyDataTypeOrDefault(attribute.data_type),
      required: attribute.required,
      description: attribute.description ?? "",
      sortOrder: attribute.sort_order,
    })),
    competencyQuestions: moduleCQs.map((cq) => ({
      id: cq.id,
      question: cq.question,
      subjectClassId: cq.subject_class_id,
      predicateRelationId: cq.predicate_relation_id,
      objectClassId: cq.object_class_id,
      subjectExampleId: cq.subject_example_id,
      predicateExampleId: cq.predicate_example_id,
      objectExampleId: cq.object_example_id,
      sortOrder: cq.sort_order,
      modules: cq.modules.map((linkedModule) => ({
        id: linkedModule.id,
        name: linkedModule.name,
        isCurrentModule: linkedModule.id === moduleId,
      })),
    })),
    notes: notes
      .filter((note) =>
        isModuleNote({
          note,
          moduleId,
          moduleClassIds,
          moduleRelationIds,
          moduleAttributeIds,
          moduleRelationAttributeIds,
          moduleCQIds,
        })
      )
      .map(buildExportNote),
    examples: moduleExamples.map(buildExportExample),
    localizedTexts: localizedTexts
      .filter((text) =>
        isModuleLocalizedText({
          text,
          moduleId,
          moduleClassIds,
          moduleRelationIds,
          moduleAttributeIds,
          moduleRelationAttributeIds,
          moduleCQIds,
        })
      )
      .map(buildExportLocalizedText),
  })

  return {
    fileName: `${sanitizeFileName(ontologyModule.name)}-module.json`,
    payload,
    warnings,
  }
}
