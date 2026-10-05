"use server"

import { revalidatePath } from "next/cache"
import { eq } from "drizzle-orm"

import type { OntologyAttribute } from "@/domain/ontology"
import type { OntologyDataTypeId } from "@/features/ontology/utils/data-types"
import { routes } from "@/lib/routes"
import { assertOntologyRecordAccess } from "@/server/group-access"
import { getDb } from "@/server/database"
import { ontologyAttributes } from "@/server/db/schema"

export async function addAttribute(
  classId: string,
  data: {
    name: string
    dataType: OntologyDataTypeId
    required?: boolean
    description?: string
  }
): Promise<OntologyAttribute> {
  const db = getDb()
  await assertOntologyRecordAccess("ontology_classes", classId, db)
  const [row] = await db
    .insert(ontologyAttributes)
    .values({
      class_id: classId,
      name: data.name,
      data_type: data.dataType,
      required: data.required ?? false,
      description: data.description ?? "",
    })
    .returning()
  if (!row) throw new Error("Failed to create ontology attribute.")
  revalidatePath(routes.ontology.root)
  return row
}

export async function updateAttribute(
  id: string,
  data: {
    name?: string
    dataType?: OntologyDataTypeId
    required?: boolean
    description?: string
  }
): Promise<OntologyAttribute> {
  const db = getDb()
  await assertOntologyRecordAccess("ontology_attributes", id, db)
  const [row] = await db
    .update(ontologyAttributes)
    .set({
      ...(data.name !== undefined && { name: data.name }),
      ...(data.dataType !== undefined && { data_type: data.dataType }),
      ...(data.required !== undefined && { required: data.required }),
      ...(data.description !== undefined && { description: data.description }),
    })
    .where(eq(ontologyAttributes.id, id))
    .returning()
  if (!row) throw new Error("Ontology attribute was not found.")
  revalidatePath(routes.ontology.root)
  return row
}

export async function deleteAttribute(id: string): Promise<void> {
  const db = getDb()
  await assertOntologyRecordAccess("ontology_attributes", id, db)
  await db.delete(ontologyAttributes).where(eq(ontologyAttributes.id, id))
  revalidatePath(routes.ontology.root)
}
