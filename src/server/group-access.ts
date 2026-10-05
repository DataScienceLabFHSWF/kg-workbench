import "server-only"

import { and, eq, inArray } from "drizzle-orm"
import { cookies } from "next/headers"

import {
  type AppAccessGroup,
  getAppAccessCookie,
  getAppAccessGroupCookie,
  getCurrentAppAccessGroup,
} from "@/lib/app-access"
import { getDb } from "@/server/database"
import {
  documentEntities,
  documentParagraphs,
  documentSections,
  documents,
  entityAttributeValues,
  evidenceAnchors,
  extractionRuns,
  factRelationAttributeValues,
  facts,
  ontologyAttributes,
  ontologyClassPositions,
  ontologyClasses,
  ontologyCompetencyQuestions,
  ontologyDocuments,
  ontologyExamples,
  ontologyLanguages,
  ontologyLocalizedTexts,
  ontologyModuleLayout,
  ontologyModules,
  ontologyNotes,
  ontologyRelationAttributes,
  ontologyRelations,
} from "@/server/db/schema"

type ServerDb = ReturnType<typeof getDb>

type OntologyScopedRecord =
  | "ontology_documents"
  | "ontology_modules"
  | "ontology_classes"
  | "ontology_attributes"
  | "ontology_relations"
  | "ontology_relation_attributes"
  | "ontology_competency_questions"
  | "ontology_languages"
  | "ontology_notes"
  | "ontology_localized_texts"
  | "ontology_examples"
  | "ontology_module_layout"
  | "ontology_class_positions"

type DocumentScopedRecord =
  | "documents"
  | "document_sections"
  | "document_paragraphs"
  | "extraction_runs"
  | "document_entities"
  | "entity_attribute_values"
  | "evidence_anchors"
  | "facts"
  | "fact_relation_attribute_values"

function throwAccessDenied(message: string): never {
  throw new Error(message)
}

export async function getCurrentGroupOrThrow(): Promise<AppAccessGroup> {
  const cookieStore = await cookies()
  const group = await getCurrentAppAccessGroup(
    cookieStore.get(getAppAccessCookie().name)?.value,
    cookieStore.get(getAppAccessGroupCookie().name)?.value
  )

  if (!group) throwAccessDenied("No valid app access group is active.")
  return group
}

export async function getCurrentGroupKeyOrThrow(): Promise<string> {
  return (await getCurrentGroupOrThrow()).key
}

export async function assertOntologyDocumentAccess(
  ontologyId: string,
  db: ServerDb = getDb()
): Promise<string> {
  const groupKey = await getCurrentGroupKeyOrThrow()
  const [row] = await db
    .select({ id: ontologyDocuments.id })
    .from(ontologyDocuments)
    .where(
      and(
        eq(ontologyDocuments.id, ontologyId),
        eq(ontologyDocuments.group_key, groupKey)
      )
    )
    .limit(1)

  if (!row) {
    throwAccessDenied(
      "Ontology document is not accessible for the current group."
    )
  }
  return ontologyId
}

export async function assertDocumentAccess(
  documentId: string,
  db: ServerDb = getDb()
): Promise<string> {
  const groupKey = await getCurrentGroupKeyOrThrow()
  const [row] = await db
    .select({ id: documents.id })
    .from(documents)
    .where(and(eq(documents.id, documentId), eq(documents.group_key, groupKey)))
    .limit(1)

  if (!row)
    throwAccessDenied("Document is not accessible for the current group.")
  return documentId
}

async function selectOntologyId(
  db: ServerDb,
  table:
    | typeof ontologyModules
    | typeof ontologyClasses
    | typeof ontologyRelations
    | typeof ontologyCompetencyQuestions
    | typeof ontologyLanguages
    | typeof ontologyNotes
    | typeof ontologyLocalizedTexts
    | typeof ontologyExamples,
  id: string
): Promise<string | null> {
  const [row] = await db
    .select({ ontology_id: table.ontology_id })
    .from(table)
    .where(eq(table.id, id))
    .limit(1)
  return row?.ontology_id ?? null
}

async function resolveOntologyIdForRecord(
  recordType: OntologyScopedRecord,
  id: string,
  db: ServerDb
): Promise<string | null> {
  switch (recordType) {
    case "ontology_documents":
      return id
    case "ontology_modules":
      return selectOntologyId(db, ontologyModules, id)
    case "ontology_classes":
      return selectOntologyId(db, ontologyClasses, id)
    case "ontology_relations":
      return selectOntologyId(db, ontologyRelations, id)
    case "ontology_competency_questions":
      return selectOntologyId(db, ontologyCompetencyQuestions, id)
    case "ontology_languages":
      return selectOntologyId(db, ontologyLanguages, id)
    case "ontology_notes":
      return selectOntologyId(db, ontologyNotes, id)
    case "ontology_localized_texts":
      return selectOntologyId(db, ontologyLocalizedTexts, id)
    case "ontology_examples":
      return selectOntologyId(db, ontologyExamples, id)
    case "ontology_attributes": {
      const [row] = await db
        .select({ ontology_id: ontologyClasses.ontology_id })
        .from(ontologyAttributes)
        .innerJoin(
          ontologyClasses,
          eq(ontologyAttributes.class_id, ontologyClasses.id)
        )
        .where(eq(ontologyAttributes.id, id))
        .limit(1)
      return row?.ontology_id ?? null
    }
    case "ontology_relation_attributes": {
      const [row] = await db
        .select({ ontology_id: ontologyRelations.ontology_id })
        .from(ontologyRelationAttributes)
        .innerJoin(
          ontologyRelations,
          eq(ontologyRelationAttributes.relation_id, ontologyRelations.id)
        )
        .where(eq(ontologyRelationAttributes.id, id))
        .limit(1)
      return row?.ontology_id ?? null
    }
    case "ontology_module_layout": {
      const [row] = await db
        .select({ ontology_id: ontologyModuleLayout.ontology_id })
        .from(ontologyModuleLayout)
        .where(eq(ontologyModuleLayout.module_id, id))
        .limit(1)
      return row?.ontology_id ?? null
    }
    case "ontology_class_positions": {
      const [row] = await db
        .select({ ontology_id: ontologyClassPositions.ontology_id })
        .from(ontologyClassPositions)
        .where(eq(ontologyClassPositions.class_id, id))
        .limit(1)
      return row?.ontology_id ?? null
    }
  }
}

async function selectDocumentId(
  db: ServerDb,
  table:
    | typeof documentSections
    | typeof extractionRuns
    | typeof documentEntities
    | typeof evidenceAnchors
    | typeof facts,
  id: string
): Promise<string | null> {
  const [row] = await db
    .select({ document_id: table.document_id })
    .from(table)
    .where(eq(table.id, id))
    .limit(1)
  return row?.document_id ?? null
}

async function resolveDocumentIdForRecord(
  recordType: DocumentScopedRecord,
  id: string,
  db: ServerDb
): Promise<string | null> {
  switch (recordType) {
    case "documents":
      return id
    case "document_sections":
      return selectDocumentId(db, documentSections, id)
    case "extraction_runs":
      return selectDocumentId(db, extractionRuns, id)
    case "document_entities":
      return selectDocumentId(db, documentEntities, id)
    case "evidence_anchors":
      return selectDocumentId(db, evidenceAnchors, id)
    case "facts":
      return selectDocumentId(db, facts, id)
    case "document_paragraphs": {
      const [row] = await db
        .select({ document_id: documentSections.document_id })
        .from(documentParagraphs)
        .innerJoin(
          documentSections,
          eq(documentParagraphs.section_id, documentSections.id)
        )
        .where(eq(documentParagraphs.id, id))
        .limit(1)
      return row?.document_id ?? null
    }
    case "entity_attribute_values": {
      const [row] = await db
        .select({ document_id: documentEntities.document_id })
        .from(entityAttributeValues)
        .innerJoin(
          documentEntities,
          eq(entityAttributeValues.entity_id, documentEntities.id)
        )
        .where(eq(entityAttributeValues.id, id))
        .limit(1)
      return row?.document_id ?? null
    }
    case "fact_relation_attribute_values": {
      const [row] = await db
        .select({ document_id: facts.document_id })
        .from(factRelationAttributeValues)
        .innerJoin(facts, eq(factRelationAttributeValues.fact_id, facts.id))
        .where(eq(factRelationAttributeValues.id, id))
        .limit(1)
      return row?.document_id ?? null
    }
  }
}

export async function assertOntologyRecordAccess(
  recordType: OntologyScopedRecord,
  id: string,
  db: ServerDb = getDb()
): Promise<string> {
  const ontologyId = await resolveOntologyIdForRecord(recordType, id, db)
  if (!ontologyId) {
    throwAccessDenied(
      "Ontology record is not accessible for the current group."
    )
  }
  await assertOntologyDocumentAccess(ontologyId, db)
  return ontologyId
}

export async function assertDocumentRecordAccess(
  recordType: DocumentScopedRecord,
  id: string,
  db: ServerDb = getDb()
): Promise<string> {
  const documentId = await resolveDocumentIdForRecord(recordType, id, db)
  if (!documentId) {
    throwAccessDenied(
      "Document record is not accessible for the current group."
    )
  }
  await assertDocumentAccess(documentId, db)
  return documentId
}

export async function getAccessibleOntologyIds(
  ontologyIds: string[],
  db: ServerDb = getDb()
): Promise<string[]> {
  if (ontologyIds.length === 0) return []
  const groupKey = await getCurrentGroupKeyOrThrow()
  const rows = await db
    .select({ id: ontologyDocuments.id })
    .from(ontologyDocuments)
    .where(
      and(
        inArray(ontologyDocuments.id, ontologyIds),
        eq(ontologyDocuments.group_key, groupKey)
      )
    )
  return rows.map((row) => row.id)
}

export async function getAccessibleDocumentIds(
  documentIds: string[],
  db: ServerDb = getDb()
): Promise<string[]> {
  if (documentIds.length === 0) return []
  const groupKey = await getCurrentGroupKeyOrThrow()
  const rows = await db
    .select({ id: documents.id })
    .from(documents)
    .where(
      and(inArray(documents.id, documentIds), eq(documents.group_key, groupKey))
    )
  return rows.map((row) => row.id)
}
