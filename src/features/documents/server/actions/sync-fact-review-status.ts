"use server"

import { revalidatePath } from "next/cache"
import { inArray } from "drizzle-orm"

import { routes } from "@/lib/routes"
import { assertDocumentAccess } from "@/server/group-access"
import { getDb } from "@/server/database"
import { facts as factsTable } from "@/server/db/schema"

import { getDocumentEntities } from "../queries/entities"
import { getDocumentFacts } from "../queries/facts"
import { getOntologyForDocument } from "../queries/ontology"
import { getFactCompleteness } from "../../utils/fact-completeness"

interface ResetIncompleteAcceptedFactsOptions {
  documentId: string
  entityIds?: string[]
  factIds?: string[]
}

export async function resetIncompleteAcceptedFacts({
  documentId,
  entityIds,
  factIds,
}: ResetIncompleteAcceptedFactsOptions): Promise<void> {
  await assertDocumentAccess(documentId)
  const entityIdSet =
    entityIds && entityIds.length > 0 ? new Set(entityIds) : null
  const factIdSet = factIds && factIds.length > 0 ? new Set(factIds) : null

  const [facts, entities, ontology] = await Promise.all([
    getDocumentFacts(documentId),
    getDocumentEntities(documentId),
    getOntologyForDocument(documentId),
  ])

  const entitiesById = new Map(entities.map((entity) => [entity.id, entity]))
  const factIdsToReset = facts
    .filter((fact) => fact.review_status === "accepted")
    .filter((fact) => {
      if (factIdSet?.has(fact.id)) return true
      if (!entityIdSet) return factIdSet === null

      return (
        (fact.subject_entity_id !== null &&
          entityIdSet.has(fact.subject_entity_id)) ||
        (fact.object_entity_id !== null &&
          entityIdSet.has(fact.object_entity_id))
      )
    })
    .filter(
      (fact) => !getFactCompleteness(fact, ontology, entitiesById).isComplete
    )
    .map((fact) => fact.id)

  if (factIdsToReset.length === 0) {
    return
  }

  const db = getDb()
  await db
    .update(factsTable)
    .set({ review_status: "pending" })
    .where(inArray(factsTable.id, factIdsToReset))

  revalidatePath(routes.knowledgeGraph.document(documentId))
}
