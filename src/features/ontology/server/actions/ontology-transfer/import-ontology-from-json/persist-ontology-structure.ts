import { eq } from "drizzle-orm"

import type { ImportOntology } from "@/features/ontology/schemas/import"
import { getCurrentGroupKeyOrThrow } from "@/server/group-access"
import {
  ontologyAttributes,
  ontologyClasses,
  ontologyDocuments,
  ontologyLanguages,
  ontologyModules,
  ontologyRelationAttributes,
  ontologyRelations,
} from "@/server/db/schema"

import { collectImportModules, resolveImportedModuleId } from "../helpers"
import type {
  ImportIdMaps,
  PersistOntologyStructureResult,
  ServerClient,
} from "./shared-types"
import {
  buildMissingParentWarning,
  buildMissingRelationWarning,
} from "./warning-helpers"

function createIdMaps(): ImportIdMaps {
  return {
    moduleIdByLegacyId: new Map(),
    moduleIdByName: new Map(),
    oldAttributeIdToNewId: new Map(),
    oldClassIdToNewId: new Map(),
    oldClassIdToNewModuleId: new Map(),
    oldCQIdToNewId: new Map(),
    oldRelationAttributeIdToNewId: new Map(),
    oldRelationIdToNewId: new Map(),
  }
}

export async function persistOntologyStructure({
  db,
  parsed,
  fileName,
  warnings,
}: {
  db: ServerClient
  parsed: ImportOntology
  fileName: string
  warnings: string[]
}): Promise<PersistOntologyStructureResult> {
  const [document] = await db
    .insert(ontologyDocuments)
    .values({
      default_language: parsed.defaultLanguage,
      group_key: await getCurrentGroupKeyOrThrow(),
      name: parsed.name,
      version: parsed.version ?? null,
      source_file: fileName || null,
      usecase: parsed.usecase,
    })
    .returning()
  if (!document) throw new Error("Could not create ontology document.")

  const ontologyId = document.id
  const idMaps = createIdMaps()
  const languageRows = new Map(
    parsed.languages.map((language) => [
      language.code,
      {
        ontology_id: ontologyId,
        language_code: language.code,
        label: language.label || language.code,
      },
    ])
  )
  if (!languageRows.has(parsed.defaultLanguage)) {
    languageRows.set(parsed.defaultLanguage, {
      ontology_id: ontologyId,
      language_code: parsed.defaultLanguage,
      label: parsed.defaultLanguage,
    })
  }
  await db.insert(ontologyLanguages).values([...languageRows.values()])

  const importedModules = collectImportModules(parsed)
  if (importedModules.length) {
    const moduleRows = await db
      .insert(ontologyModules)
      .values(
        importedModules.map((importModule) => ({
          ontology_id: ontologyId,
          name: importModule.name,
          description: importModule.description,
        }))
      )
      .returning()
    const moduleRowByName = new Map(
      moduleRows.map((moduleRow) => [moduleRow.name, moduleRow])
    )
    for (const moduleRow of moduleRows) {
      idMaps.moduleIdByName.set(moduleRow.name, moduleRow.id)
    }
    for (const importModule of importedModules) {
      const moduleRow = moduleRowByName.get(importModule.name)
      if (moduleRow) {
        idMaps.moduleIdByLegacyId.set(importModule.id, moduleRow.id)
      }
    }
  }

  for (const source of parsed.classes) {
    const moduleId = resolveImportedModuleId({
      moduleId: source.moduleId,
      moduleName: source.module,
      moduleIdByLegacyId: idMaps.moduleIdByLegacyId,
      moduleIdByName: idMaps.moduleIdByName,
    })
    const [row] = await db
      .insert(ontologyClasses)
      .values({
        ontology_id: ontologyId,
        module_id: moduleId,
        name: source.name,
        description: source.description,
        parent_class_id: null,
      })
      .returning()
    if (!row) throw new Error("Could not save class.")
    idMaps.oldClassIdToNewId.set(source.id, row.id)
    idMaps.oldClassIdToNewModuleId.set(source.id, moduleId)
  }
  for (const source of parsed.classes) {
    if (!source.parentClassId) continue
    const classId = idMaps.oldClassIdToNewId.get(source.id)
    const parentId = idMaps.oldClassIdToNewId.get(source.parentClassId)
    if (!classId || !parentId) {
      warnings.push(
        buildMissingParentWarning(source.name, source.parentClassId)
      )
      continue
    }
    await db
      .update(ontologyClasses)
      .set({ parent_class_id: parentId })
      .where(eq(ontologyClasses.id, classId))
  }
  for (const source of parsed.classes) {
    const classId = idMaps.oldClassIdToNewId.get(source.id)
    if (!classId) continue
    for (const attribute of source.attributes) {
      const [row] = await db
        .insert(ontologyAttributes)
        .values({
          class_id: classId,
          name: attribute.name,
          data_type: attribute.dataType,
          required: attribute.required,
          description: attribute.description,
        })
        .returning()
      if (!row) throw new Error("Could not save attribute.")
      if (attribute.id) idMaps.oldAttributeIdToNewId.set(attribute.id, row.id)
    }
  }
  for (const source of parsed.relations) {
    const domainId = idMaps.oldClassIdToNewId.get(source.domainClassId)
    const rangeId = idMaps.oldClassIdToNewId.get(source.rangeClassId)
    if (!domainId || !rangeId) {
      warnings.push(buildMissingRelationWarning(source.name))
      continue
    }
    const [row] = await db
      .insert(ontologyRelations)
      .values({
        ontology_id: ontologyId,
        name: source.name,
        domain_class_id: domainId,
        range_class_id: rangeId,
        description: source.description,
        inverse_name: source.inverseName ?? null,
        cardinality: source.cardinality ?? null,
      })
      .returning()
    if (!row) throw new Error("Could not save relation.")
    if (source.id) idMaps.oldRelationIdToNewId.set(source.id, row.id)
  }

  const relationAttributes = parsed.relationAttributes.flatMap((attribute) => {
    const relationId = idMaps.oldRelationIdToNewId.get(attribute.relationId)
    if (!relationId) {
      warnings.push(
        `Skipped relation attribute "${attribute.name}" because relation "${attribute.relationId}" could not be resolved.`
      )
      return []
    }
    return [{ attribute, relationId }]
  })
  if (relationAttributes.length) {
    const rows = await db
      .insert(ontologyRelationAttributes)
      .values(
        relationAttributes.map(({ attribute, relationId }) => ({
          relation_id: relationId,
          name: attribute.name,
          data_type: attribute.dataType,
          description: attribute.description,
          required: attribute.required,
          sort_order: attribute.sortOrder,
        }))
      )
      .returning()
    relationAttributes.forEach(({ attribute }, index) => {
      const row = rows[index]
      if (attribute.id && row) {
        idMaps.oldRelationAttributeIdToNewId.set(attribute.id, row.id)
      }
    })
  }
  return { ontologyId, idMaps }
}
