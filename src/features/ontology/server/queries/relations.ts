"use server"

import type { OntologyRelation } from "@/domain/ontology"
import {
  assertOntologyDocumentAccess,
  assertOntologyRecordAccess,
} from "@/server/group-access"
import { getDb } from "@/server/database"
import { ontologyClasses, ontologyRelations } from "@/server/db/schema"
import { asc, eq, inArray, or } from "drizzle-orm"

export async function getOntologyRelations(
  ontologyId: string
): Promise<OntologyRelation[]> {
  const db = getDb()
  await assertOntologyDocumentAccess(ontologyId, db)
  return db
    .select()
    .from(ontologyRelations)
    .where(eq(ontologyRelations.ontology_id, ontologyId))
    .orderBy(asc(ontologyRelations.name))
}

export async function getOntologyRelationsByModule(
  moduleId: string
): Promise<OntologyRelation[]> {
  const db = getDb()
  await assertOntologyRecordAccess("ontology_modules", moduleId, db)

  const classes = await db
    .select({ id: ontologyClasses.id })
    .from(ontologyClasses)
    .where(eq(ontologyClasses.module_id, moduleId))
  if (classes.length === 0) return []

  const classIds = classes.map((c) => c.id)
  return db
    .select()
    .from(ontologyRelations)
    .where(
      or(
        inArray(ontologyRelations.domain_class_id, classIds),
        inArray(ontologyRelations.range_class_id, classIds)
      )
    )
    .orderBy(asc(ontologyRelations.name))
}

export async function getOntologyRelation(
  id: string
): Promise<OntologyRelation> {
  const db = getDb()
  await assertOntologyRecordAccess("ontology_relations", id, db)
  const [data] = await db
    .select()
    .from(ontologyRelations)
    .where(eq(ontologyRelations.id, id))
    .limit(1)
  if (!data) throw new Error("Ontology relation was not found.")
  return data
}
