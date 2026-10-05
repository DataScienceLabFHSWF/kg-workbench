"use server"

import { revalidatePath } from "next/cache"
import { eq } from "drizzle-orm"

import type { OntologyLanguage } from "@/domain/ontology"
import { routes } from "@/lib/routes"
import {
  assertOntologyDocumentAccess,
  assertOntologyRecordAccess,
} from "@/server/group-access"
import { getDb } from "@/server/database"
import { ontologyLanguages } from "@/server/db/schema"

export async function createLanguage(
  ontologyId: string,
  languageCode: string,
  label: string
): Promise<OntologyLanguage> {
  const db = getDb()
  await assertOntologyDocumentAccess(ontologyId, db)
  const [data] = await db
    .insert(ontologyLanguages)
    .values({ ontology_id: ontologyId, language_code: languageCode, label })
    .returning()
  if (!data) throw new Error("Failed to create ontology language.")
  revalidatePath(routes.ontology.root)
  return data
}

export async function updateLanguage(
  id: string,
  label: string
): Promise<OntologyLanguage> {
  const db = getDb()
  await assertOntologyRecordAccess("ontology_languages", id, db)
  const [data] = await db
    .update(ontologyLanguages)
    .set({ label })
    .where(eq(ontologyLanguages.id, id))
    .returning()
  if (!data) throw new Error("Ontology language was not found.")
  revalidatePath(routes.ontology.root)
  return data
}

export async function deleteLanguage(id: string): Promise<void> {
  const db = getDb()
  await assertOntologyRecordAccess("ontology_languages", id, db)
  await db.delete(ontologyLanguages).where(eq(ontologyLanguages.id, id))
  revalidatePath(routes.ontology.root)
}
