"use server"

import type { ExtractionRun } from "@/domain/documents"
import { desc, eq } from "drizzle-orm"
import {
  assertDocumentAccess,
  assertDocumentRecordAccess,
} from "@/server/group-access"
import { getDb } from "@/server/database"
import { extractionRuns } from "@/server/db/schema"

export async function getExtractionRuns(
  documentId: string
): Promise<ExtractionRun[]> {
  const db = getDb()
  await assertDocumentAccess(documentId, db)
  return db
    .select()
    .from(extractionRuns)
    .where(eq(extractionRuns.document_id, documentId))
    .orderBy(desc(extractionRuns.created_at))
}

export async function getExtractionRun(id: string): Promise<ExtractionRun> {
  const db = getDb()
  await assertDocumentRecordAccess("extraction_runs", id, db)
  const [data] = await db
    .select()
    .from(extractionRuns)
    .where(eq(extractionRuns.id, id))
    .limit(1)
  if (!data) throw new Error("Extraction run was not found.")
  return data
}
