"use server"

import { revalidatePath } from "next/cache"
import { eq } from "drizzle-orm"

import type { OntologyRelationAttribute } from "@/domain/ontology"
import {
  DEFAULT_ONTOLOGY_DATA_TYPE,
  type OntologyDataTypeId,
} from "@/features/ontology/utils/data-types"
import { routes } from "@/lib/routes"
import { assertOntologyRecordAccess } from "@/server/group-access"
import { getDb } from "@/server/database"
import { ontologyRelationAttributes } from "@/server/db/schema"

export async function createRelationAttribute(
  relationId: string,
  data: {
    name: string
    dataType?: OntologyDataTypeId
    description?: string
    required?: boolean
    sortOrder?: number
  }
): Promise<OntologyRelationAttribute> {
  const db = getDb()
  await assertOntologyRecordAccess("ontology_relations", relationId, db)
  const [row] = await db
    .insert(ontologyRelationAttributes)
    .values({
      relation_id: relationId,
      name: data.name,
      data_type: data.dataType ?? DEFAULT_ONTOLOGY_DATA_TYPE,
      description: data.description ?? "",
      required: data.required ?? false,
      sort_order: data.sortOrder ?? 0,
    })
    .returning()
  if (!row) throw new Error("Failed to create relation attribute.")
  revalidatePath(routes.ontology.root)
  return row
}

export async function updateRelationAttribute(
  id: string,
  data: {
    name?: string
    dataType?: OntologyDataTypeId
    description?: string
    required?: boolean
    sortOrder?: number
  }
): Promise<OntologyRelationAttribute> {
  const db = getDb()
  await assertOntologyRecordAccess("ontology_relation_attributes", id, db)
  const [row] = await db
    .update(ontologyRelationAttributes)
    .set({
      ...(data.name !== undefined && { name: data.name }),
      ...(data.dataType !== undefined && { data_type: data.dataType }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.required !== undefined && { required: data.required }),
      ...(data.sortOrder !== undefined && { sort_order: data.sortOrder }),
    })
    .where(eq(ontologyRelationAttributes.id, id))
    .returning()
  if (!row) throw new Error("Relation attribute was not found.")
  revalidatePath(routes.ontology.root)
  return row
}

export async function deleteRelationAttribute(id: string): Promise<void> {
  const db = getDb()
  await assertOntologyRecordAccess("ontology_relation_attributes", id, db)
  await db
    .delete(ontologyRelationAttributes)
    .where(eq(ontologyRelationAttributes.id, id))
  revalidatePath(routes.ontology.root)
}
