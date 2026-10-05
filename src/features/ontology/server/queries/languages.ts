"use server"

import type { OntologyLanguage } from "@/domain/ontology"
import { assertOntologyDocumentAccess } from "@/server/group-access"
import { getDb } from "@/server/database"
import { ontologyLanguages } from "@/server/db/schema"
import { asc, eq } from "drizzle-orm"

export async function getOntologyLanguages(
  ontologyId: string
): Promise<OntologyLanguage[]> {
  const db = getDb()
  await assertOntologyDocumentAccess(ontologyId, db)
  return db
    .select()
    .from(ontologyLanguages)
    .where(eq(ontologyLanguages.ontology_id, ontologyId))
    .orderBy(asc(ontologyLanguages.language_code))
}
