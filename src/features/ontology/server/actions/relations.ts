"use server"
import { eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import type {
  OntologyLocalizedTextInsert,
  OntologyRelation,
} from "@/domain/ontology"
import { routes } from "@/lib/routes"
import {
  assertOntologyDocumentAccess,
  assertOntologyRecordAccess,
} from "@/server/group-access"
import { getDb } from "@/server/database"
import { ontologyLocalizedTexts, ontologyRelations } from "@/server/db/schema"

export async function createRelation(
  ontologyId: string,
  data: {
    name: string
    domainClassId: string
    rangeClassId: string
    description?: string
    inverseName?: string | null
    cardinality?: string | null
    localizedTexts?: Array<{
      fieldName: string
      languageCode: string
      value: string
    }>
  }
): Promise<OntologyRelation> {
  const db = getDb()
  await assertOntologyDocumentAccess(ontologyId, db)
  await assertOntologyRecordAccess("ontology_classes", data.domainClassId, db)
  await assertOntologyRecordAccess("ontology_classes", data.rangeClassId, db)
  const [row] = await db
    .insert(ontologyRelations)
    .values({
      ontology_id: ontologyId,
      name: data.name,
      domain_class_id: data.domainClassId,
      range_class_id: data.rangeClassId,
      description: data.description ?? "",
      inverse_name: data.inverseName ?? null,
      cardinality: data.cardinality ?? null,
    })
    .returning()
  if (!row) throw new Error("Could not create relation.")
  const localizedTextInserts: OntologyLocalizedTextInsert[] = (
    data.localizedTexts ?? []
  )
    .map((text) => ({
      ontology_id: ontologyId,
      target_relation_id: row.id,
      field_name: text.fieldName,
      language_code: text.languageCode,
      value: text.value.trim(),
    }))
    .filter((text) => Boolean(text.value))
  if (localizedTextInserts.length > 0) {
    try {
      await db.insert(ontologyLocalizedTexts).values(localizedTextInserts)
    } catch (error) {
      await db.delete(ontologyRelations).where(eq(ontologyRelations.id, row.id))
      throw error
    }
  }
  revalidatePath(routes.ontology.root)
  return row
}

export async function updateRelation(
  id: string,
  data: {
    name?: string
    domainClassId?: string
    rangeClassId?: string
    description?: string
    inverseName?: string | null
    cardinality?: string | null
    instancePolicy?: string
  }
): Promise<OntologyRelation> {
  const db = getDb()
  await assertOntologyRecordAccess("ontology_relations", id, db)
  const [row] = await db
    .update(ontologyRelations)
    .set({
      ...(data.name !== undefined && { name: data.name }),
      ...(data.domainClassId !== undefined && {
        domain_class_id: data.domainClassId,
      }),
      ...(data.rangeClassId !== undefined && {
        range_class_id: data.rangeClassId,
      }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.inverseName !== undefined && { inverse_name: data.inverseName }),
      ...(data.cardinality !== undefined && { cardinality: data.cardinality }),
      ...(data.instancePolicy !== undefined && {
        instance_policy: data.instancePolicy,
      }),
    })
    .where(eq(ontologyRelations.id, id))
    .returning()
  if (!row) throw new Error("Relation not found.")
  revalidatePath(routes.ontology.root)
  return row
}

export async function deleteRelation(id: string): Promise<void> {
  const db = getDb()
  await assertOntologyRecordAccess("ontology_relations", id, db)
  await db.delete(ontologyRelations).where(eq(ontologyRelations.id, id))
  revalidatePath(routes.ontology.root)
}
