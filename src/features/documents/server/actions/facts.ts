"use server"

import { revalidatePath } from "next/cache"
import { eq, inArray } from "drizzle-orm"

import type { Fact } from "@/domain/documents"
import { routes } from "@/lib/routes"
import type { FactReviewStatus } from "@/lib/types"
import {
  assertDocumentAccess,
  assertDocumentRecordAccess,
} from "@/server/group-access"
import { getDb } from "@/server/database"
import { facts } from "@/server/db/schema"

export async function reviewFact(
  factId: string,
  status: FactReviewStatus
): Promise<Fact> {
  const db = getDb()
  await assertDocumentRecordAccess("facts", factId, db)
  const [data] = await db
    .update(facts)
    .set({ review_status: status })
    .where(eq(facts.id, factId))
    .returning()
  if (!data) throw new Error("Fact was not found.")
  revalidatePath(routes.knowledgeGraph.root)
  return data as Fact
}

export async function bulkReviewFacts(
  factIds: string[],
  status: FactReviewStatus
): Promise<void> {
  if (factIds.length === 0) return
  const db = getDb()
  const accessibleDocumentIds = await Promise.all(
    factIds.map((factId) => assertDocumentRecordAccess("facts", factId, db))
  )
  if (new Set(accessibleDocumentIds).size > 1) {
    throw new Error("Facts from multiple documents cannot be updated together.")
  }
  await db
    .update(facts)
    .set({ review_status: status })
    .where(inArray(facts.id, factIds))
  revalidatePath(routes.knowledgeGraph.root)
}

export async function renameFactPart(
  factId: string,
  field: "subject_text" | "relation_text" | "object_text",
  newText: string
): Promise<Fact> {
  const db = getDb()
  await assertDocumentRecordAccess("facts", factId, db)

  const update =
    field === "subject_text"
      ? { subject_text: newText, review_status: "pending" as const }
      : field === "relation_text"
        ? { relation_text: newText, review_status: "pending" as const }
        : { object_text: newText, review_status: "pending" as const }

  const [data] = await db
    .update(facts)
    .set(update)
    .where(eq(facts.id, factId))
    .returning()
  if (!data) throw new Error("Fact was not found.")
  revalidatePath(routes.knowledgeGraph.root)
  return data as Fact
}

export async function clearRelationTypeOnFacts(
  factIds: string[],
  documentId: string
): Promise<void> {
  if (factIds.length === 0) return
  const db = getDb()
  await assertDocumentAccess(documentId, db)
  const accessibleDocumentIds = await Promise.all(
    factIds.map((factId) => assertDocumentRecordAccess("facts", factId, db))
  )
  if (!accessibleDocumentIds.every((id) => id === documentId)) {
    throw new Error("Some facts do not belong to the selected document.")
  }
  await db
    .update(facts)
    .set({ relation_type_id: null, review_status: "pending" })
    .where(inArray(facts.id, factIds))
  revalidatePath(routes.knowledgeGraph.document(documentId))
}

export async function remapFactField(
  factId: string,
  field: "relation_type_id",
  newId: string | null
): Promise<Fact> {
  const db = getDb()
  await assertDocumentRecordAccess("facts", factId, db)
  const [data] = await db
    .update(facts)
    .set({ relation_type_id: newId, review_status: "pending" })
    .where(eq(facts.id, factId))
    .returning()
  if (!data) throw new Error("Fact was not found.")
  revalidatePath(routes.knowledgeGraph.root)
  return data as Fact
}
