"use server"
import { asc, desc, eq, inArray } from "drizzle-orm"
import type { DocumentParagraph } from "@/domain/documents"
import {
  assertDocumentAccess,
  getCurrentGroupKeyOrThrow,
} from "@/server/group-access"
import { getDb } from "@/server/database"
import {
  documentParagraphs,
  documentSections,
  documents,
  extractionRuns,
  ontologyDocuments,
} from "@/server/db/schema"
import type {
  DocumentListItem,
  DocumentOntologyBaseSummary,
  DocumentWithSections,
  SectionWithParagraphs,
} from "./types"
export async function getDocuments(): Promise<DocumentListItem[]> {
  const db = getDb()
  const groupKey = await getCurrentGroupKeyOrThrow()
  const rows = await db
    .select()
    .from(documents)
    .where(eq(documents.group_key, groupKey))
    .orderBy(desc(documents.uploaded_at))
  if (!rows.length) return []
  const runs = await db
    .select({
      document_id: extractionRuns.document_id,
      ontology_id: extractionRuns.ontology_id,
    })
    .from(extractionRuns)
    .where(eq(extractionRuns.status, "completed"))
    .orderBy(desc(extractionRuns.completed_at))
  const latestOntologyIdByDocumentId = new Map<string, string>()
  const rowIds = new Set(rows.map((row) => row.id))
  for (const run of runs)
    if (
      rowIds.has(run.document_id) &&
      run.ontology_id &&
      !latestOntologyIdByDocumentId.has(run.document_id)
    )
      latestOntologyIdByDocumentId.set(run.document_id, run.ontology_id)
  const ontologyIds = [...new Set(latestOntologyIdByDocumentId.values())]
  const ontologyRows = ontologyIds.length
    ? await db
        .select({
          id: ontologyDocuments.id,
          name: ontologyDocuments.name,
          version: ontologyDocuments.version,
        })
        .from(ontologyDocuments)
        .where(inArray(ontologyDocuments.id, ontologyIds))
    : []
  const ontologyById = new Map(
    ontologyRows.map((ontology) => [
      ontology.id,
      {
        ontologyId: ontology.id,
        ontologyName: ontology.name,
        ontologyVersion: ontology.version,
      } satisfies DocumentOntologyBaseSummary,
    ])
  )
  return rows.map((document) => ({
    ...document,
    ontologyBase:
      ontologyById.get(latestOntologyIdByDocumentId.get(document.id) ?? "") ??
      null,
  })) as DocumentListItem[]
}
async function sectionsWithParagraphs(
  documentId: string
): Promise<SectionWithParagraphs[]> {
  const db = getDb()
  const sections = await db
    .select()
    .from(documentSections)
    .where(eq(documentSections.document_id, documentId))
    .orderBy(asc(documentSections.sort_order))
  if (!sections.length) return []
  const paragraphs = await db
    .select()
    .from(documentParagraphs)
    .where(
      inArray(
        documentParagraphs.section_id,
        sections.map((section) => section.id)
      )
    )
    .orderBy(asc(documentParagraphs.sort_order))
  const paragraphsBySection = new Map<string, DocumentParagraph[]>()
  for (const paragraph of paragraphs) {
    const values = paragraphsBySection.get(paragraph.section_id) ?? []
    values.push(paragraph)
    paragraphsBySection.set(paragraph.section_id, values)
  }
  return sections.map((section) => ({
    ...section,
    paragraphs: paragraphsBySection.get(section.id) ?? [],
  }))
}
export async function getDocument(id: string): Promise<DocumentWithSections> {
  const db = getDb()
  await assertDocumentAccess(id, db)
  const [document] = await db
    .select()
    .from(documents)
    .where(eq(documents.id, id))
    .limit(1)
  if (!document) throw new Error("Document not found.")
  return {
    ...document,
    sections: await sectionsWithParagraphs(id),
  } as DocumentWithSections
}
export async function fetchDocumentWithSections(id: string) {
  return getDocument(id)
}
export async function fetchDocuments() {
  return getDocuments()
}
export async function getDocumentSections(
  documentId: string
): Promise<SectionWithParagraphs[]> {
  const db = getDb()
  await assertDocumentAccess(documentId, db)
  return sectionsWithParagraphs(documentId)
}
