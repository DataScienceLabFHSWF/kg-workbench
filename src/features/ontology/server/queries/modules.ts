"use server"

import type { OntologyModule } from "@/domain/ontology"
import { assertOntologyDocumentAccess } from "@/server/group-access"
import { getDb } from "@/server/database"
import { ontologyModules } from "@/server/db/schema"
import { asc, eq } from "drizzle-orm"

export async function getOntologyModules(
  ontologyId: string
): Promise<OntologyModule[]> {
  const db = getDb()
  await assertOntologyDocumentAccess(ontologyId, db)
  return db
    .select()
    .from(ontologyModules)
    .where(eq(ontologyModules.ontology_id, ontologyId))
    .orderBy(asc(ontologyModules.name))
}
