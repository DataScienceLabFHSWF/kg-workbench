"use server"

import type { FactRelationAttributeValue } from "@/domain/documents"
import { eq } from "drizzle-orm"
import { assertDocumentRecordAccess } from "@/server/group-access"
import { getDb } from "@/server/database"
import { factRelationAttributeValues } from "@/server/db/schema"

export async function getFactRelationAttributeValues(
  factId: string
): Promise<FactRelationAttributeValue[]> {
  const db = getDb()
  await assertDocumentRecordAccess("facts", factId, db)
  return db
    .select()
    .from(factRelationAttributeValues)
    .where(eq(factRelationAttributeValues.fact_id, factId))
}
