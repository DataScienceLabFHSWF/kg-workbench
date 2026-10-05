"use server"

import { revalidatePath } from "next/cache"
import { eq } from "drizzle-orm"

import type { FactRelationAttributeValue } from "@/domain/documents"
import { routes } from "@/lib/routes"
import { assertDocumentRecordAccess } from "@/server/group-access"
import { getDb } from "@/server/database"
import { factRelationAttributeValues } from "@/server/db/schema"
import { resetIncompleteAcceptedFacts } from "./sync-fact-review-status"

export async function upsertRelationAttributeValue(
  factId: string,
  relationAttributeId: string,
  value: string
): Promise<FactRelationAttributeValue> {
  const db = getDb()
  await assertDocumentRecordAccess("facts", factId, db)
  const [data] = await db
    .insert(factRelationAttributeValues)
    .values({
      fact_id: factId,
      relation_attribute_id: relationAttributeId,
      value,
    })
    .onConflictDoUpdate({
      target: [
        factRelationAttributeValues.fact_id,
        factRelationAttributeValues.relation_attribute_id,
      ],
      set: { value },
    })
    .returning()
  if (!data) throw new Error("Failed to save relation attribute value.")
  revalidatePath(routes.knowledgeGraph.root)
  return data
}

export async function deleteRelationAttributeValue(id: string): Promise<void> {
  const db = getDb()
  const accessibleDocumentId = await assertDocumentRecordAccess(
    "fact_relation_attribute_values",
    id,
    db
  )
  const [relationAttributeValue] = await db
    .select({ fact_id: factRelationAttributeValues.fact_id })
    .from(factRelationAttributeValues)
    .where(eq(factRelationAttributeValues.id, id))
    .limit(1)

  await db
    .delete(factRelationAttributeValues)
    .where(eq(factRelationAttributeValues.id, id))

  if (accessibleDocumentId && relationAttributeValue?.fact_id) {
    await resetIncompleteAcceptedFacts({
      documentId: accessibleDocumentId,
      factIds: [relationAttributeValue.fact_id],
    })
    revalidatePath(routes.knowledgeGraph.document(accessibleDocumentId))
    return
  }

  revalidatePath(routes.knowledgeGraph.root)
}
