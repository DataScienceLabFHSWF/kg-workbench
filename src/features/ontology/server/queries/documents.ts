"use server"

import type { OntologyDocument } from "@/domain/ontology"
import { desc, eq } from "drizzle-orm"
import {
  assertOntologyDocumentAccess,
  getCurrentGroupKeyOrThrow,
} from "@/server/group-access"
import { getDb } from "@/server/database"
import { ontologyDocuments, ontologyModules } from "@/server/db/schema"

import type { OntologyDocumentWithModules } from "./types"

export async function getOntologyDocuments(): Promise<OntologyDocument[]> {
  const db = getDb()
  const groupKey = await getCurrentGroupKeyOrThrow()
  return db
    .select()
    .from(ontologyDocuments)
    .where(eq(ontologyDocuments.group_key, groupKey))
    .orderBy(desc(ontologyDocuments.created_at))
}

export async function getOntologyDocumentsForPicker(): Promise<
  { id: string; name: string; default_language: string; usecase: string }[]
> {
  const db = getDb()
  const groupKey = await getCurrentGroupKeyOrThrow()
  return db
    .select({
      id: ontologyDocuments.id,
      name: ontologyDocuments.name,
      default_language: ontologyDocuments.default_language,
      usecase: ontologyDocuments.usecase,
    })
    .from(ontologyDocuments)
    .where(eq(ontologyDocuments.group_key, groupKey))
    .orderBy(desc(ontologyDocuments.created_at))
}

export async function getOntologyDocument(
  id: string
): Promise<OntologyDocumentWithModules> {
  const db = getDb()
  await assertOntologyDocumentAccess(id, db)
  const [doc] = await db
    .select()
    .from(ontologyDocuments)
    .where(eq(ontologyDocuments.id, id))
    .limit(1)
  if (!doc) throw new Error("Ontology document was not found.")
  const modules = await db
    .select()
    .from(ontologyModules)
    .where(eq(ontologyModules.ontology_id, id))
  return { ...doc, modules }
}
