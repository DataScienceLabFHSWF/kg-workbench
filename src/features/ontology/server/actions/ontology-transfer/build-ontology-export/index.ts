import { ImportOntologySchema } from "@/features/ontology/schemas/import"
import { isAllLanguagesExportLanguage } from "@/features/ontology/utils/export-language"

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
import {
  buildLocalizedTextValueMap,
  resolveExportValue,
  sanitizeFileName,
} from "../helpers"
import { buildOntologyExportPayload } from "./build-ontology-export-payload"
import { isExampleExported, shouldExportCQ } from "./export-filters"

import type {
  BuildOntologyExportInput,
  BuildOntologyExportResult,
} from "../types"

export async function buildOntologyExportInternal({
  exportLanguage,
  missingTranslationBehavior,
  ontologyId,
  moduleIds,
  classIds,
  relationIds,
  includeVisual,
}: BuildOntologyExportInput): Promise<BuildOntologyExportResult> {
  const [
    document,
    classes,
    relations,
    savedPositions,
    savedModuleLayouts,
    languages,
    localizedTexts,
    notes,
    examples,
    cqs,
    relationAttributesByRelation,
  ] = await Promise.all([
    getOntologyDocument(ontologyId),
    getOntologyClasses(ontologyId),
    getOntologyRelations(ontologyId),
    getClassPositions(ontologyId),
    getModuleLayouts(ontologyId),
    getOntologyLanguages(ontologyId),
    getOntologyLocalizedTextsByOntology(ontologyId),
    getOntologyNotesByOntology(ontologyId),
    getOntologyExamplesByOntology(ontologyId),
    getOntologyCQs(ontologyId),
    getRelationAttributesByOntology(ontologyId),
  ])

  const exportAllLanguages = isAllLanguagesExportLanguage(exportLanguage)
  const resolvedExportLanguage = exportAllLanguages
    ? document.default_language
    : exportLanguage
  const selectedModuleIds = new Set(moduleIds)
  const selectedClassIds = new Set(classIds)
  const selectedRelationIds = new Set(relationIds)
  const localizedTextValueMap = buildLocalizedTextValueMap(localizedTexts)
  const moduleById = new Map(
    document.modules.map((ontologyModule) => [
      ontologyModule.id,
      ontologyModule,
    ])
  )
  const exportClasses = classes.filter((cls) => selectedClassIds.has(cls.id))
  const exportClassIds = new Set(exportClasses.map((cls) => cls.id))
  const exportAttributeIds = new Set(
    exportClasses.flatMap((cls) =>
      cls.attributes.map((attribute) => attribute.id)
    )
  )
  const exportRelations = relations
    .filter((relation) => selectedRelationIds.has(relation.id))
    .filter(
      (relation) =>
        exportClassIds.has(relation.domain_class_id) &&
        exportClassIds.has(relation.range_class_id)
    )
  const exportRelationIds = new Set(
    exportRelations.map((relation) => relation.id)
  )
  const exportRelationAttributes = exportRelations.flatMap(
    (relation) => relationAttributesByRelation[relation.id] ?? []
  )
  const exportRelationAttributeIds = new Set(
    exportRelationAttributes.map((attribute) => attribute.id)
  )
  const relevantModuleIds = new Set(selectedModuleIds)

  for (const cls of exportClasses) {
    if (cls.module_id) relevantModuleIds.add(cls.module_id)
  }

  const exportModuleNameById = new Map(
    document.modules.map((ontologyModule) => [
      ontologyModule.id,
      resolveExportValue({
        canonicalValue: ontologyModule.name,
        defaultLanguage: document.default_language,
        exportLanguage: resolvedExportLanguage,
        fieldName: "name",
        localizedTextValueMap,
        missingTranslationBehavior,
        targetId: ontologyModule.id,
        targetType: "module",
      }),
    ])
  )

  const exportCQs = cqs.filter((cq) =>
    shouldExportCQ({
      cq,
      exportClassIds,
      exportRelationIds,
      relevantModuleIds,
    })
  )
  const exportCQIds = new Set(exportCQs.map((cq) => cq.id))
  const exportExamples = examples.filter((example) =>
    isExampleExported({
      example,
      attributeIds: exportAttributeIds,
      classIds: exportClassIds,
      cqIds: exportCQIds,
      relationAttributeIds: exportRelationAttributeIds,
      relationIds: exportRelationIds,
    })
  )
  const exportExampleIds = new Set(exportExamples.map((example) => example.id))
  const exportOntologyName = resolveExportValue({
    canonicalValue: document.name,
    defaultLanguage: document.default_language,
    exportLanguage: resolvedExportLanguage,
    fieldName: "name",
    localizedTextValueMap,
    missingTranslationBehavior,
    targetId: document.id,
    targetType: "ontology",
  })

  const payload = buildOntologyExportPayload({
    document,
    classes: exportClasses,
    classIds: exportClassIds,
    attributeIds: exportAttributeIds,
    relations: exportRelations,
    relationIds: exportRelationIds,
    relationAttributes: exportRelationAttributes,
    relationAttributeIds: exportRelationAttributeIds,
    competencyQuestions: exportCQs,
    cqIds: exportCQIds,
    examples: exportExamples,
    exampleIds: exportExampleIds,
    notes,
    localizedTexts,
    languages,
    moduleById,
    relevantModuleIds,
    exportModuleNameById,
    savedModuleLayouts,
    savedPositions,
    exportAllLanguages,
    resolvedExportLanguage,
    localizedTextValueMap,
    includeVisual,
    missingTranslationBehavior,
  })

  return {
    fileName: `${sanitizeFileName(exportOntologyName || document.name)}.json`,
    payload: ImportOntologySchema.parse(payload),
  }
}
