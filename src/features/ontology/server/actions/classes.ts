"use server"

import { revalidatePath } from "next/cache"
import { eq } from "drizzle-orm"

import type {
  OntologyClass,
  OntologyLocalizedTextInsert,
} from "@/domain/ontology"
import { routes } from "@/lib/routes"
import {
  assertOntologyDocumentAccess,
  assertOntologyRecordAccess,
} from "@/server/group-access"
import { getDb } from "@/server/database"
import { ontologyClasses, ontologyLocalizedTexts } from "@/server/db/schema"

export async function createClass(
  ontologyId: string,
  moduleId: string,
  data: {
    name: string
    description?: string
    parentClassId?: string | null
    localizedTexts?: Array<{
      fieldName: string
      languageCode: string
      value: string
    }>
  }
): Promise<OntologyClass> {
  const db = getDb()
  await assertOntologyDocumentAccess(ontologyId, db)
  await assertOntologyRecordAccess("ontology_modules", moduleId, db)
  const [row] = await db
    .insert(ontologyClasses)
    .values({
      ontology_id: ontologyId,
      module_id: moduleId,
      name: data.name,
      description: data.description ?? "",
      parent_class_id: data.parentClassId ?? null,
    })
    .returning()
  if (!row) throw new Error("Failed to create ontology class.")

  const localizedTextInserts: OntologyLocalizedTextInsert[] = (
    data.localizedTexts ?? []
  )
    .map((localizedText) => ({
      ontology_id: ontologyId,
      target_class_id: row.id,
      field_name: localizedText.fieldName,
      language_code: localizedText.languageCode,
      value: localizedText.value.trim(),
    }))
    .filter((localizedText) => Boolean(localizedText.value))

  if (localizedTextInserts.length > 0) {
    try {
      await db.insert(ontologyLocalizedTexts).values(localizedTextInserts)
    } catch (error) {
      await db.delete(ontologyClasses).where(eq(ontologyClasses.id, row.id))
      throw error
    }
  }

  revalidatePath(routes.ontology.root)
  return row
}

export async function updateClass(
  id: string,
  data: {
    name?: string
    description?: string
    moduleId?: string | null
    parentClassId?: string | null
    instancePolicy?: string
  }
): Promise<OntologyClass> {
  const db = getDb()
  await assertOntologyRecordAccess("ontology_classes", id, db)
  if (data.moduleId) {
    await assertOntologyRecordAccess("ontology_modules", data.moduleId, db)
  }
  const [row] = await db
    .update(ontologyClasses)
    .set({
      ...(data.name !== undefined && { name: data.name }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.moduleId !== undefined && { module_id: data.moduleId }),
      ...(data.parentClassId !== undefined && {
        parent_class_id: data.parentClassId,
      }),
      ...(data.instancePolicy !== undefined && {
        instance_policy: data.instancePolicy,
      }),
    })
    .where(eq(ontologyClasses.id, id))
    .returning()
  if (!row) throw new Error("Ontology class was not found.")
  revalidatePath(routes.ontology.root)
  return row
}

export async function deleteClass(id: string): Promise<void> {
  const db = getDb()
  await assertOntologyRecordAccess("ontology_classes", id, db)
  await db.delete(ontologyClasses).where(eq(ontologyClasses.id, id))
  revalidatePath(routes.ontology.root)
}
