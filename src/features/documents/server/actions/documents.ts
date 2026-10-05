"use server"

import { revalidatePath } from "next/cache"
import { eq } from "drizzle-orm"

import type { Document, DocumentInsert } from "@/domain/documents"
import { routes } from "@/lib/routes"
import {
  assertDocumentAccess,
  getCurrentGroupKeyOrThrow,
} from "@/server/group-access"
import { getDb } from "@/server/database"
import { documents } from "@/server/db/schema"

export async function uploadDocument(data: {
  title: string
  language?: string
  page_count?: number
  excerpt?: string
  tags?: string[]
}): Promise<Document> {
  const db = getDb()
  const groupKey = await getCurrentGroupKeyOrThrow()
  const [row] = await db
    .insert(documents)
    .values({
      title: data.title,
      language: data.language ?? "en",
      page_count: data.page_count ?? 0,
      excerpt: data.excerpt ?? "",
      tags: data.tags ?? [],
      group_key: groupKey,
    })
    .returning()
  if (!row) throw new Error("Failed to create document.")
  revalidatePath(routes.knowledgeGraph.root)
  return row as Document
}

export async function updateDocument(
  id: string,
  data: Partial<
    Pick<
      DocumentInsert,
      "title" | "language" | "page_count" | "excerpt" | "tags"
    >
  >
): Promise<Document> {
  const db = getDb()
  await assertDocumentAccess(id, db)
  const [row] = await db
    .update(documents)
    .set(data)
    .where(eq(documents.id, id))
    .returning()
  if (!row) throw new Error("Document was not found.")
  revalidatePath(routes.knowledgeGraph.root)
  return row as Document
}

export async function deleteDocument(id: string): Promise<void> {
  const db = getDb()
  await assertDocumentAccess(id, db)
  await db.delete(documents).where(eq(documents.id, id))
  revalidatePath(routes.knowledgeGraph.root)
}
