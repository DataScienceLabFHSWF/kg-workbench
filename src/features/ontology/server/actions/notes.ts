"use server"

import { revalidatePath } from "next/cache"
import { eq } from "drizzle-orm"

import type { OntologyNote, OntologyNoteInsert } from "@/domain/ontology"
import type { OntologyMetadataTarget } from "@/features/ontology/server/queries"
import { routes } from "@/lib/routes"
import {
  assertOntologyDocumentAccess,
  assertOntologyRecordAccess,
} from "@/server/group-access"
import { getDb } from "@/server/database"
import { ontologyNotes } from "@/server/db/schema"

type NoteTargetFields = Pick<
  OntologyNoteInsert,
  | "target_ontology_id"
  | "target_module_id"
  | "target_class_id"
  | "target_relation_id"
  | "target_attribute_id"
  | "target_relation_attribute_id"
  | "target_cq_id"
>

function resolveNoteTarget(target: OntologyMetadataTarget): NoteTargetFields {
  switch (target.type) {
    case "ontology":
      return { target_ontology_id: target.id }
    case "module":
      return { target_module_id: target.id }
    case "class":
      return { target_class_id: target.id }
    case "relation":
      return { target_relation_id: target.id }
    case "attribute":
      return { target_attribute_id: target.id }
    case "relation_attribute":
      return { target_relation_attribute_id: target.id }
    case "cq":
      return { target_cq_id: target.id }
  }
}

function resolveOntologyRecordType(targetType: OntologyMetadataTarget["type"]) {
  switch (targetType) {
    case "ontology":
      return "ontology_documents" as const
    case "module":
      return "ontology_modules" as const
    case "class":
      return "ontology_classes" as const
    case "relation":
      return "ontology_relations" as const
    case "attribute":
      return "ontology_attributes" as const
    case "relation_attribute":
      return "ontology_relation_attributes" as const
    case "cq":
      return "ontology_competency_questions" as const
  }
}

export async function createNote(
  ontologyId: string,
  target: OntologyMetadataTarget,
  body: string,
  authorName: string,
  sortOrder?: number
): Promise<OntologyNote> {
  const db = getDb()
  await assertOntologyDocumentAccess(ontologyId, db)
  await assertOntologyRecordAccess(
    resolveOntologyRecordType(target.type),
    target.id,
    db
  )
  const [data] = await db
    .insert(ontologyNotes)
    .values({
      ontology_id: ontologyId,
      body,
      author_name: authorName,
      sort_order: sortOrder ?? 0,
      ...resolveNoteTarget(target),
    })
    .returning()
  if (!data) throw new Error("Failed to create ontology note.")
  revalidatePath(routes.ontology.root)
  return data
}

export async function updateNote(
  id: string,
  data: { body?: string; authorName?: string; sortOrder?: number }
): Promise<OntologyNote> {
  const db = getDb()
  await assertOntologyRecordAccess("ontology_notes", id, db)
  const [row] = await db
    .update(ontologyNotes)
    .set({
      ...(data.body !== undefined && { body: data.body }),
      ...(data.authorName !== undefined && { author_name: data.authorName }),
      ...(data.sortOrder !== undefined && { sort_order: data.sortOrder }),
    })
    .where(eq(ontologyNotes.id, id))
    .returning()
  if (!row) throw new Error("Ontology note was not found.")
  revalidatePath(routes.ontology.root)
  return row
}

export async function deleteNote(id: string): Promise<void> {
  const db = getDb()
  await assertOntologyRecordAccess("ontology_notes", id, db)
  await db.delete(ontologyNotes).where(eq(ontologyNotes.id, id))
  revalidatePath(routes.ontology.root)
}
