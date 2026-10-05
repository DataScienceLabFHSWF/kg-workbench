import type {
  ImportCompetencyQuestion,
  ImportOntology,
} from "@/features/ontology/schemas/import"
import { normalizeOntologyDataTypeOrDefault } from "@/features/ontology/utils/data-types"

import {
  getClassPositions,
  getModuleLayouts,
  getOntologyClasses,
  getOntologyCQs,
  getOntologyDocument,
  getOntologyExamplesByOntology,
  getOntologyLanguages,
  getOntologyLocalizedTextsByOntology,
  getOntologyNotesByOntology,
  getOntologyRelations,
  getRelationAttributesByOntology,
} from "../../../queries"
import { buildExportLocalizedTexts, resolveExportValue } from "../helpers"
import { buildExportExample, buildExportNote } from "./export-mappers"

type Document = Awaited<ReturnType<typeof getOntologyDocument>>
type ClassRecord = Awaited<ReturnType<typeof getOntologyClasses>>[number]
type RelationRecord = Awaited<ReturnType<typeof getOntologyRelations>>[number]
type RelationAttributeRecord = Awaited<
  ReturnType<typeof getRelationAttributesByOntology>
>[string][number]
type CompetencyQuestionRecord = Awaited<
  ReturnType<typeof getOntologyCQs>
>[number]
type ExampleRecord = Awaited<
  ReturnType<typeof getOntologyExamplesByOntology>
>[number]
type NoteRecord = Awaited<ReturnType<typeof getOntologyNotesByOntology>>[number]
type LocalizedTextRecord = Awaited<
  ReturnType<typeof getOntologyLocalizedTextsByOntology>
>[number]
type LanguageRecord = Awaited<ReturnType<typeof getOntologyLanguages>>[number]
type ModuleLayouts = Awaited<ReturnType<typeof getModuleLayouts>>
type ClassPositions = Awaited<ReturnType<typeof getClassPositions>>

interface BuildOntologyExportPayloadInput {
  document: Document
  classes: ClassRecord[]
  classIds: Set<string>
  attributeIds: Set<string>
  relations: RelationRecord[]
  relationIds: Set<string>
  relationAttributes: RelationAttributeRecord[]
  relationAttributeIds: Set<string>
  competencyQuestions: CompetencyQuestionRecord[]
  cqIds: Set<string>
  examples: ExampleRecord[]
  exampleIds: Set<string>
  notes: NoteRecord[]
  localizedTexts: LocalizedTextRecord[]
  languages: LanguageRecord[]
  moduleById: Map<string, Document["modules"][number]>
  relevantModuleIds: Set<string>
  exportModuleNameById: Map<string, string>
  savedModuleLayouts: ModuleLayouts
  savedPositions: ClassPositions
  exportAllLanguages: boolean
  resolvedExportLanguage: string
  localizedTextValueMap: Map<string, string>
  includeVisual: boolean
  missingTranslationBehavior: "fallback" | "strict"
}

function buildModules(input: BuildOntologyExportPayloadInput) {
  return Array.from(input.relevantModuleIds).flatMap((moduleId) => {
    const ontologyModule = input.moduleById.get(moduleId)
    if (!ontologyModule) return []

    return [
      {
        id: ontologyModule.id,
        name: input.exportModuleNameById.get(moduleId) ?? ontologyModule.name,
        description: resolveExportValue({
          canonicalValue: ontologyModule.description,
          defaultLanguage: input.document.default_language,
          exportLanguage: input.resolvedExportLanguage,
          fieldName: "description",
          localizedTextValueMap: input.localizedTextValueMap,
          missingTranslationBehavior: input.missingTranslationBehavior,
          targetId: ontologyModule.id,
          targetType: "module",
        }),
      },
    ]
  })
}

function buildClasses(input: BuildOntologyExportPayloadInput) {
  return input.classes.map((cls) => ({
    id: cls.id,
    name: resolveExportValue({
      canonicalValue: cls.name,
      defaultLanguage: input.document.default_language,
      exportLanguage: input.resolvedExportLanguage,
      fieldName: "name",
      localizedTextValueMap: input.localizedTextValueMap,
      missingTranslationBehavior: input.missingTranslationBehavior,
      targetId: cls.id,
      targetType: "class",
    }),
    moduleId: cls.module_id,
    module: cls.module_id
      ? (input.exportModuleNameById.get(cls.module_id) ?? null)
      : null,
    description: resolveExportValue({
      canonicalValue: cls.description,
      defaultLanguage: input.document.default_language,
      exportLanguage: input.resolvedExportLanguage,
      fieldName: "description",
      localizedTextValueMap: input.localizedTextValueMap,
      missingTranslationBehavior: input.missingTranslationBehavior,
      targetId: cls.id,
      targetType: "class",
    }),
    parentClassId: input.classIds.has(cls.parent_class_id ?? "")
      ? cls.parent_class_id
      : null,
    attributes: cls.attributes.map((attribute) => ({
      id: attribute.id,
      name: resolveExportValue({
        canonicalValue: attribute.name,
        defaultLanguage: input.document.default_language,
        exportLanguage: input.resolvedExportLanguage,
        fieldName: "name",
        localizedTextValueMap: input.localizedTextValueMap,
        missingTranslationBehavior: input.missingTranslationBehavior,
        targetId: attribute.id,
        targetType: "attribute",
      }),
      dataType: normalizeOntologyDataTypeOrDefault(attribute.data_type),
      required: attribute.required ?? false,
      description: resolveExportValue({
        canonicalValue: attribute.description,
        defaultLanguage: input.document.default_language,
        exportLanguage: input.resolvedExportLanguage,
        fieldName: "description",
        localizedTextValueMap: input.localizedTextValueMap,
        missingTranslationBehavior: input.missingTranslationBehavior,
        targetId: attribute.id,
        targetType: "attribute",
      }),
    })),
  }))
}

function buildRelations(input: BuildOntologyExportPayloadInput) {
  return input.relations.map((relation) => ({
    id: relation.id,
    name: resolveExportValue({
      canonicalValue: relation.name,
      defaultLanguage: input.document.default_language,
      exportLanguage: input.resolvedExportLanguage,
      fieldName: "name",
      localizedTextValueMap: input.localizedTextValueMap,
      missingTranslationBehavior: input.missingTranslationBehavior,
      targetId: relation.id,
      targetType: "relation",
    }),
    domainClassId: relation.domain_class_id,
    rangeClassId: relation.range_class_id,
    description: resolveExportValue({
      canonicalValue: relation.description,
      defaultLanguage: input.document.default_language,
      exportLanguage: input.resolvedExportLanguage,
      fieldName: "description",
      localizedTextValueMap: input.localizedTextValueMap,
      missingTranslationBehavior: input.missingTranslationBehavior,
      targetId: relation.id,
      targetType: "relation",
    }),
    inverseName: resolveExportValue({
      canonicalValue: relation.inverse_name,
      defaultLanguage: input.document.default_language,
      exportLanguage: input.resolvedExportLanguage,
      fieldName: "inverseName",
      localizedTextValueMap: input.localizedTextValueMap,
      missingTranslationBehavior: input.missingTranslationBehavior,
      targetId: relation.id,
      targetType: "relation",
    }),
    cardinality: relation.cardinality,
  }))
}

function buildRelationAttributes(input: BuildOntologyExportPayloadInput) {
  return input.relationAttributes.map((attribute) => ({
    id: attribute.id,
    relationId: attribute.relation_id,
    name: resolveExportValue({
      canonicalValue: attribute.name,
      defaultLanguage: input.document.default_language,
      exportLanguage: input.resolvedExportLanguage,
      fieldName: "name",
      localizedTextValueMap: input.localizedTextValueMap,
      missingTranslationBehavior: input.missingTranslationBehavior,
      targetId: attribute.id,
      targetType: "relation_attribute",
    }),
    dataType: normalizeOntologyDataTypeOrDefault(attribute.data_type),
    required: attribute.required ?? false,
    description: resolveExportValue({
      canonicalValue: attribute.description,
      defaultLanguage: input.document.default_language,
      exportLanguage: input.resolvedExportLanguage,
      fieldName: "description",
      localizedTextValueMap: input.localizedTextValueMap,
      missingTranslationBehavior: input.missingTranslationBehavior,
      targetId: attribute.id,
      targetType: "relation_attribute",
    }),
    sortOrder: attribute.sort_order,
  }))
}

function buildCompetencyQuestions(
  input: BuildOntologyExportPayloadInput
): ImportCompetencyQuestion[] {
  return input.competencyQuestions.map((cq) => ({
    id: cq.id,
    question: resolveExportValue({
      canonicalValue: cq.question,
      defaultLanguage: input.document.default_language,
      exportLanguage: input.resolvedExportLanguage,
      fieldName: "question",
      localizedTextValueMap: input.localizedTextValueMap,
      missingTranslationBehavior: input.missingTranslationBehavior,
      targetId: cq.id,
      targetType: "cq",
    }),
    subjectClassId: input.classIds.has(cq.subject_class_id ?? "")
      ? cq.subject_class_id
      : null,
    predicateRelationId: input.relationIds.has(cq.predicate_relation_id ?? "")
      ? cq.predicate_relation_id
      : null,
    objectClassId: input.classIds.has(cq.object_class_id ?? "")
      ? cq.object_class_id
      : null,
    subjectExampleId: input.exampleIds.has(cq.subject_example_id ?? "")
      ? cq.subject_example_id
      : null,
    predicateExampleId: input.exampleIds.has(cq.predicate_example_id ?? "")
      ? cq.predicate_example_id
      : null,
    objectExampleId: input.exampleIds.has(cq.object_example_id ?? "")
      ? cq.object_example_id
      : null,
    sortOrder: cq.sort_order,
    modules: cq.modules.map((module) => ({
      id: module.id,
      name: module.name,
      isCurrentModule: false,
    })),
  }))
}

function buildNotes(input: BuildOntologyExportPayloadInput) {
  return input.notes
    .filter(
      (note) =>
        note.target_ontology_id === input.document.id ||
        (note.target_module_id &&
          input.relevantModuleIds.has(note.target_module_id)) ||
        (note.target_class_id && input.classIds.has(note.target_class_id)) ||
        (note.target_relation_id &&
          input.relationIds.has(note.target_relation_id)) ||
        (note.target_attribute_id &&
          input.attributeIds.has(note.target_attribute_id)) ||
        (note.target_relation_attribute_id &&
          input.relationAttributeIds.has(note.target_relation_attribute_id)) ||
        (note.target_cq_id && input.cqIds.has(note.target_cq_id))
    )
    .map(buildExportNote)
}

function buildVisual(
  input: BuildOntologyExportPayloadInput
): ImportOntology["visual"] {
  return {
    moduleLayouts: Array.from(input.relevantModuleIds).flatMap((moduleId) => {
      const ontologyModule = input.moduleById.get(moduleId)
      const layout = input.savedModuleLayouts[moduleId]
      if (!ontologyModule || !layout) return []

      return [
        {
          moduleId,
          module:
            input.exportModuleNameById.get(moduleId) ?? ontologyModule.name,
          x: layout.x,
          y: layout.y,
          width: layout.width,
          height: layout.height,
        },
      ]
    }),
    classPositions: input.classes.flatMap((cls) => {
      if (!cls.module_id) return []
      const ontologyModule = input.moduleById.get(cls.module_id)
      const position = input.savedPositions[cls.module_id]?.[cls.id]
      if (!ontologyModule || !position) return []

      return [
        {
          classId: cls.id,
          moduleId: cls.module_id,
          module:
            input.exportModuleNameById.get(cls.module_id) ??
            ontologyModule.name,
          x: position.x,
          y: position.y,
        },
      ]
    }),
  }
}

export function buildOntologyExportPayload(
  input: BuildOntologyExportPayloadInput
): ImportOntology {
  const exportOntologyName = resolveExportValue({
    canonicalValue: input.document.name,
    defaultLanguage: input.document.default_language,
    exportLanguage: input.resolvedExportLanguage,
    fieldName: "name",
    localizedTextValueMap: input.localizedTextValueMap,
    missingTranslationBehavior: input.missingTranslationBehavior,
    targetId: input.document.id,
    targetType: "ontology",
  })

  const payload: ImportOntology = {
    defaultLanguage: input.exportAllLanguages
      ? input.document.default_language
      : input.resolvedExportLanguage,
    languages: input.exportAllLanguages
      ? input.languages.map((language) => ({
          code: language.language_code,
          label: language.label || language.language_code,
        }))
      : [],
    name: exportOntologyName,
    usecase: resolveExportValue({
      canonicalValue: input.document.usecase,
      defaultLanguage: input.document.default_language,
      exportLanguage: input.resolvedExportLanguage,
      fieldName: "usecase",
      localizedTextValueMap: input.localizedTextValueMap,
      missingTranslationBehavior: input.missingTranslationBehavior,
      targetId: input.document.id,
      targetType: "ontology",
    }),
    version: input.document.version,
    modules: buildModules(input),
    classes: buildClasses(input),
    relations: buildRelations(input),
    relationAttributes: buildRelationAttributes(input),
    competencyQuestions: buildCompetencyQuestions(input),
    notes: buildNotes(input),
    examples: input.examples.map(buildExportExample),
    localizedTexts: input.exportAllLanguages
      ? buildExportLocalizedTexts({
          localizedTexts: input.localizedTexts,
          ontologyId: input.document.id,
          moduleIds: input.relevantModuleIds,
          classIds: input.classIds,
          relationIds: input.relationIds,
          attributeIds: input.attributeIds,
          relationAttributeIds: input.relationAttributeIds,
          cqIds: input.cqIds,
        })
      : [],
  }

  if (input.includeVisual) {
    payload.visual = buildVisual(input)
  }

  return payload
}
