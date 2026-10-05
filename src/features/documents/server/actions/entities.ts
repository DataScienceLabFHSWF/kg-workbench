"use server"

import { revalidatePath } from "next/cache"
import { eq } from "drizzle-orm"

import { routes } from "@/lib/routes"
import {
  assertDocumentAccess,
  assertDocumentRecordAccess,
} from "@/server/group-access"
import { getDb } from "@/server/database"
import {
  documentEntities,
  entityAttributeValues,
  facts,
} from "@/server/db/schema"
import { resetIncompleteAcceptedFacts } from "./sync-fact-review-status"

export async function updateEntityClass(
  entityId: string,
  classId: string | null,
  documentId: string
): Promise<void> {
  const db = getDb()
  const accessibleDocumentId = await assertDocumentRecordAccess(
    "document_entities",
    entityId,
    db
  )
  await assertDocumentAccess(documentId, db)
  await db
    .update(documentEntities)
    .set({ class_id: classId })
    .where(eq(documentEntities.id, entityId))
  revalidatePath(routes.knowledgeGraph.document(accessibleDocumentId))
}

export async function upsertAttributeValue(
  entityId: string,
  attributeId: string,
  value: string,
  documentId: string
): Promise<void> {
  const db = getDb()
  const accessibleDocumentId = await assertDocumentRecordAccess(
    "document_entities",
    entityId,
    db
  )
  await assertDocumentAccess(documentId, db)
  await db
    .insert(entityAttributeValues)
    .values({ entity_id: entityId, attribute_id: attributeId, value })
    .onConflictDoUpdate({
      target: [
        entityAttributeValues.entity_id,
        entityAttributeValues.attribute_id,
      ],
      set: { value },
    })
  revalidatePath(routes.knowledgeGraph.document(accessibleDocumentId))
}

export async function deleteAttributeValue(
  attributeValueId: string,
  documentId: string
): Promise<void> {
  const db = getDb()
  const accessibleDocumentId = await assertDocumentRecordAccess(
    "entity_attribute_values",
    attributeValueId,
    db
  )
  await assertDocumentAccess(documentId, db)
  const [attributeValue] = await db
    .select({ entity_id: entityAttributeValues.entity_id })
    .from(entityAttributeValues)
    .where(eq(entityAttributeValues.id, attributeValueId))
    .limit(1)

  await db
    .delete(entityAttributeValues)
    .where(eq(entityAttributeValues.id, attributeValueId))

  if (attributeValue?.entity_id) {
    await resetIncompleteAcceptedFacts({
      documentId: accessibleDocumentId,
      entityIds: [attributeValue.entity_id],
    })
  }

  revalidatePath(routes.knowledgeGraph.document(accessibleDocumentId))
}

export async function remapEntityClassFromFact(
  factId: string,
  role: "subject" | "object",
  classId: string | null,
  documentId: string
): Promise<void> {
  const db = getDb()
  await assertDocumentRecordAccess("facts", factId, db)
  await assertDocumentAccess(documentId, db)
  const [fact] = await db
    .select({
      subject_entity_id: facts.subject_entity_id,
      object_entity_id: facts.object_entity_id,
    })
    .from(facts)
    .where(eq(facts.id, factId))
    .limit(1)
  if (!fact) throw new Error("Fact was not found.")
  const entityId =
    role === "subject" ? fact.subject_entity_id : fact.object_entity_id
  if (!entityId) return
  await updateEntityClass(entityId, classId, documentId)
}
