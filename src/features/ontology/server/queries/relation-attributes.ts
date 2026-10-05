"use server"

import type { OntologyRelationAttribute } from "@/domain/ontology"
import { asc, eq, inArray } from "drizzle-orm"
import {
  assertOntologyDocumentAccess,
  assertOntologyRecordAccess,
} from "@/server/group-access"
import { getDb } from "@/server/database"
import {
  ontologyRelationAttributes,
  ontologyRelations,
} from "@/server/db/schema"

export async function getRelationAttributes(
  relationId: string
): Promise<OntologyRelationAttribute[]> {
  const db = getDb()
  await assertOntologyRecordAccess("ontology_relations", relationId, db)
  return db
    .select()
    .from(ontologyRelationAttributes)
    .where(eq(ontologyRelationAttributes.relation_id, relationId))
    .orderBy(asc(ontologyRelationAttributes.sort_order))
}

export async function getRelationAttributesByOntology(
  ontologyId: string
): Promise<Record<string, OntologyRelationAttribute[]>> {
  const db = getDb()
  await assertOntologyDocumentAccess(ontologyId, db)
  const relations = await db
    .select({ id: ontologyRelations.id })
    .from(ontologyRelations)
    .where(eq(ontologyRelations.ontology_id, ontologyId))
  if (relations.length === 0) return {}

  const relationIds = relations.map((r) => r.id)
  const data = await db
    .select()
    .from(ontologyRelationAttributes)
    .where(inArray(ontologyRelationAttributes.relation_id, relationIds))
    .orderBy(asc(ontologyRelationAttributes.sort_order))

  const result: Record<string, OntologyRelationAttribute[]> = {}
  for (const attr of data) {
    if (!result[attr.relation_id]) result[attr.relation_id] = []
    result[attr.relation_id].push(attr)
  }
  return result
}
