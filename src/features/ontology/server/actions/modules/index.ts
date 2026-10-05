"use server"

import { eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"

import type {
  OntologyLocalizedTextInsert,
  OntologyModule,
} from "@/domain/ontology"
import { ModuleTransferSchema } from "@/features/ontology/schemas/module-transfer"
import { routes } from "@/lib/routes"
import {
  assertOntologyDocumentAccess,
  assertOntologyRecordAccess,
} from "@/server/group-access"
import { getDb } from "@/server/database"
import {
  ontologyClasses,
  ontologyLocalizedTexts,
  ontologyModules,
} from "@/server/db/schema"

import { getOntologyClasses, getOntologyRelations } from "../../queries"
import { buildModuleLocalizedTextInserts } from "./localized-texts"
import { buildCopyModuleName } from "./shared"
import {
  assertModuleNameAvailable,
  createUniqueModuleName,
  getModuleRecord,
} from "./store"
import {
  analyzeModuleTransfer,
  buildModuleTransferPayload,
  persistModuleTransferPayload,
} from "./transfer"
import type {
  BuildModuleExportResult,
  CreateModuleInput,
  DuplicateModuleResult,
  ImportModuleFromJsonInput,
  ImportModuleFromJsonResult,
  ModuleDeleteImpact,
} from "./types"

export type {
  BuildModuleExportResult,
  CreateModuleInput,
  CreateModuleLocalizedTextInput,
  DuplicateModuleResult,
  ImportModuleFromJsonInput,
  ImportModuleFromJsonResult,
  ModuleDeleteImpact,
} from "./types"

export async function createModule({
  ontologyId,
  name,
  description,
  localizedTexts = [],
}: CreateModuleInput): Promise<OntologyModule> {
  const db = getDb()
  await assertOntologyDocumentAccess(ontologyId, db)
  const [moduleRow] = await db
    .insert(ontologyModules)
    .values({
      ontology_id: ontologyId,
      name: await assertModuleNameAvailable(ontologyId, name),
      description: description ?? "",
    })
    .returning()
  if (!moduleRow) throw new Error("Could not create module.")

  const texts: OntologyLocalizedTextInsert[] = buildModuleLocalizedTextInserts({
    ontologyId,
    moduleId: moduleRow.id,
    localizedTexts,
  })
  if (texts.length) {
    try {
      await db.insert(ontologyLocalizedTexts).values(texts)
    } catch (error) {
      await db
        .delete(ontologyModules)
        .where(eq(ontologyModules.id, moduleRow.id))
      throw error
    }
  }
  revalidatePath(routes.ontology.root)
  return moduleRow
}

export async function updateModule(
  id: string,
  data: string | { name?: string; description?: string }
): Promise<OntologyModule> {
  const ontologyModule = await getModuleRecord(id)
  const input = typeof data === "string" ? { name: data } : data
  const name =
    input.name === undefined
      ? undefined
      : await assertModuleNameAvailable(
          ontologyModule.ontology_id,
          input.name,
          id
        )
  const [row] = await getDb()
    .update(ontologyModules)
    .set({
      ...(name !== undefined && { name }),
      ...(input.description !== undefined && {
        description: input.description,
      }),
    })
    .where(eq(ontologyModules.id, id))
    .returning()
  if (!row) throw new Error("Module not found.")
  revalidatePath(routes.ontology.root)
  return row
}

export async function renameModule(id: string, name: string) {
  return updateModule(id, { name })
}

export async function getModuleDeleteImpact(
  moduleId: string
): Promise<ModuleDeleteImpact> {
  const ontologyModule = await getModuleRecord(moduleId)
  const [classes, relations] = await Promise.all([
    getOntologyClasses(ontologyModule.ontology_id),
    getOntologyRelations(ontologyModule.ontology_id),
  ])
  const classIds = new Set(
    classes.filter((cls) => cls.module_id === moduleId).map((cls) => cls.id)
  )
  return {
    classCount: classIds.size,
    relationCount: relations.filter(
      (relation) =>
        classIds.has(relation.domain_class_id) ||
        classIds.has(relation.range_class_id)
    ).length,
  }
}

export async function deleteModule(id: string): Promise<void> {
  const db = getDb()
  await assertOntologyRecordAccess("ontology_modules", id, db)
  await db.delete(ontologyClasses).where(eq(ontologyClasses.module_id, id))
  await db.delete(ontologyModules).where(eq(ontologyModules.id, id))
  revalidatePath(routes.ontology.root)
}

export async function buildModuleExport(
  moduleId: string
): Promise<BuildModuleExportResult> {
  await assertOntologyRecordAccess("ontology_modules", moduleId)
  return buildModuleTransferPayload(moduleId)
}

export async function duplicateModule(
  moduleId: string
): Promise<DuplicateModuleResult> {
  await assertOntologyRecordAccess("ontology_modules", moduleId)
  const ontologyModule = await getModuleRecord(moduleId)
  const exported = await buildModuleTransferPayload(moduleId)
  const duplicated = await persistModuleTransferPayload({
    ontologyId: ontologyModule.ontology_id,
    name: await createUniqueModuleName(
      ontologyModule.ontology_id,
      buildCopyModuleName(ontologyModule.name)
    ),
    description: exported.payload.description,
    payload: exported.payload,
  })
  revalidatePath(routes.ontology.root)
  return {
    module: duplicated.module,
    warnings: [...exported.warnings, ...duplicated.warnings],
  }
}

export async function importModuleFromJson({
  ontologyId,
  file,
  name,
  description,
  localizedTexts = [],
  confirmWarnings = false,
}: ImportModuleFromJsonInput): Promise<ImportModuleFromJsonResult> {
  await assertOntologyDocumentAccess(ontologyId)
  const parsed = ModuleTransferSchema.parse(JSON.parse(await file.text()))
  const finalName = await assertModuleNameAvailable(
    ontologyId,
    name?.trim() || parsed.name
  )
  const analysis = analyzeModuleTransfer(parsed)
  const warnings = [
    ...analysis.missingRelationWarnings,
    ...analysis.missingParentWarnings,
    ...analysis.missingRelationAttributeWarnings,
  ]
  if (!confirmWarnings && analysis.missingRelationWarnings.length) {
    return { status: "needs-confirmation", name: finalName, warnings }
  }
  const result = await persistModuleTransferPayload({
    ontologyId,
    name: finalName,
    description,
    localizedTexts,
    payload: parsed,
  })
  revalidatePath(routes.ontology.root)
  return {
    status: "imported",
    module: result.module,
    warnings: result.warnings,
  }
}
