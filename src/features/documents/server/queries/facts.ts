"use server"

import { asc, eq, inArray } from "drizzle-orm"

import {
  assertDocumentAccess,
  getAccessibleDocumentIds,
} from "@/server/group-access"
import { getDb } from "@/server/database"
import {
  documentEntities,
  evidenceAnchors,
  factAnchors,
  factRelationAttributeValues,
  facts,
} from "@/server/db/schema"

import type { FactStatusSummary, FactWithAnchors } from "./types"

export async function getDocumentFacts(
  documentId: string
): Promise<FactWithAnchors[]> {
  const db = getDb()
  await assertDocumentAccess(documentId, db)
  const factRows = await db
    .select()
    .from(facts)
    .where(eq(facts.document_id, documentId))
    .orderBy(asc(facts.created_at))
  if (factRows.length === 0) return []
  const factIds = factRows.map((fact) => fact.id)
  const [anchorRows, relationAttributeRows, entityRows] = await Promise.all([
    db
      .select({ fact_id: factAnchors.fact_id, anchor: evidenceAnchors })
      .from(factAnchors)
      .innerJoin(evidenceAnchors, eq(factAnchors.anchor_id, evidenceAnchors.id))
      .where(inArray(factAnchors.fact_id, factIds)),
    db
      .select()
      .from(factRelationAttributeValues)
      .where(inArray(factRelationAttributeValues.fact_id, factIds)),
    db
      .select({ id: documentEntities.id, class_id: documentEntities.class_id })
      .from(documentEntities)
      .where(
        inArray(
          documentEntities.id,
          factRows.flatMap((fact) =>
            [fact.subject_entity_id, fact.object_entity_id].filter(
              (id): id is string => Boolean(id)
            )
          )
        )
      ),
  ])
  const anchorsByFact = new Map<
    string,
    (typeof evidenceAnchors.$inferSelect)[]
  >()
  for (const row of anchorRows) {
    const anchors = anchorsByFact.get(row.fact_id) ?? []
    anchors.push(row.anchor)
    anchorsByFact.set(row.fact_id, anchors)
  }
  const relationAttributesByFact = new Map<
    string,
    (typeof factRelationAttributeValues.$inferSelect)[]
  >()
  for (const row of relationAttributeRows) {
    const values = relationAttributesByFact.get(row.fact_id) ?? []
    values.push(row)
    relationAttributesByFact.set(row.fact_id, values)
  }
  const classIdByEntityId = new Map(
    entityRows.map((entity) => [entity.id, entity.class_id])
  )
  return factRows.map(
    (fact) =>
      ({
        ...fact,
        anchors: anchorsByFact.get(fact.id) ?? [],
        relation_attribute_values: relationAttributesByFact.get(fact.id) ?? [],
        subject_class_id:
          classIdByEntityId.get(fact.subject_entity_id ?? "") ?? null,
        object_class_id:
          classIdByEntityId.get(fact.object_entity_id ?? "") ?? null,
      }) as FactWithAnchors
  )
}

export async function fetchDocumentFacts(documentId: string) {
  return getDocumentFacts(documentId)
}

export async function fetchDocumentFactSummaries(
  documentIds: string[]
): Promise<Record<string, FactStatusSummary>> {
  if (documentIds.length === 0) return {}
  const db = getDb()
  const accessibleDocumentIds = await getAccessibleDocumentIds(documentIds, db)
  if (accessibleDocumentIds.length === 0) return {}
  const factRows = await db
    .select({
      document_id: facts.document_id,
      review_status: facts.review_status,
      relation_type_id: facts.relation_type_id,
      subject_entity_id: facts.subject_entity_id,
      object_entity_id: facts.object_entity_id,
    })
    .from(facts)
    .where(inArray(facts.document_id, accessibleDocumentIds))
  const entityIds = factRows.flatMap((fact) =>
    [fact.subject_entity_id, fact.object_entity_id].filter((id): id is string =>
      Boolean(id)
    )
  )
  const entityRows =
    entityIds.length === 0
      ? []
      : await db
          .select({
            id: documentEntities.id,
            class_id: documentEntities.class_id,
          })
          .from(documentEntities)
          .where(inArray(documentEntities.id, entityIds))
  const classIdByEntityId = new Map(
    entityRows.map((entity) => [entity.id, entity.class_id])
  )
  const result: Record<string, FactStatusSummary> = {}
  for (const row of factRows) {
    const summary = (result[row.document_id] ??= {
      pending: 0,
      accepted: 0,
      rejected: 0,
      unmapped: 0,
    })
    const isUnmapped =
      !classIdByEntityId.get(row.subject_entity_id ?? "") ||
      !row.relation_type_id ||
      !classIdByEntityId.get(row.object_entity_id ?? "")
    if (isUnmapped) summary.unmapped++
    else if (row.review_status === "accepted") summary.accepted++
    else if (row.review_status === "rejected") summary.rejected++
    else summary.pending++
  }
  return result
}
