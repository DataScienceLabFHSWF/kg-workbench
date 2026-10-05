"use server"

import { revalidatePath } from "next/cache"
import { eq } from "drizzle-orm"

import type { OntologyDocument } from "@/domain/ontology"
import { routes } from "@/lib/routes"
import {
  assertOntologyDocumentAccess,
  getCurrentGroupKeyOrThrow,
} from "@/server/group-access"
import { getDb } from "@/server/database"
import { ontologyDocuments, ontologyLanguages } from "@/server/db/schema"

export async function createOntologyDocument(fields: {
  defaultLanguage: string
  defaultLanguageLabel?: string
  name: string
  usecase?: string
}): Promise<OntologyDocument> {
  const db = getDb()
  const groupKey = await getCurrentGroupKeyOrThrow()
  const [data] = await db
    .insert(ontologyDocuments)
    .values({
      default_language: fields.defaultLanguage,
      group_key: groupKey,
      name: fields.name,
      usecase: fields.usecase ?? "",
    })
    .returning()
  if (!data) throw new Error("Failed to create ontology document.")

  await db.insert(ontologyLanguages).values({
    ontology_id: data.id,
    language_code: fields.defaultLanguage,
    label: fields.defaultLanguageLabel || fields.defaultLanguage,
  })

  revalidatePath(routes.ontology.root)
  return data
}

export async function updateOntologyDocument(
  id: string,
  fields: { name?: string; usecase?: string; defaultLanguage?: string }
): Promise<OntologyDocument> {
  const db = getDb()
  await assertOntologyDocumentAccess(id, db)
  const [data] = await db
    .update(ontologyDocuments)
    .set({
      ...(fields.name !== undefined && { name: fields.name }),
      ...(fields.usecase !== undefined && { usecase: fields.usecase }),
      ...(fields.defaultLanguage !== undefined && {
        default_language: fields.defaultLanguage,
      }),
    })
    .where(eq(ontologyDocuments.id, id))
    .returning()
  if (!data) throw new Error("Ontology document was not found.")
  revalidatePath(routes.ontology.root)
  return data
}

export async function deleteOntologyDocument(id: string): Promise<void> {
  const db = getDb()
  await assertOntologyDocumentAccess(id, db)
  await db.delete(ontologyDocuments).where(eq(ontologyDocuments.id, id))
  revalidatePath(routes.ontology.root)
}
