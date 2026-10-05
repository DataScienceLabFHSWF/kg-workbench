"use server"

import { asc, eq } from "drizzle-orm"

import type { EntityWithAttributes } from "@/domain/documents"
import { assertDocumentAccess } from "@/server/group-access"
import { getDb } from "@/server/database"
import {
  documentEntities,
  entityAttributeValues,
  ontologyAttributes,
} from "@/server/db/schema"

export async function getDocumentEntities(
  documentId: string
): Promise<EntityWithAttributes[]> {
  const db = getDb()
  await assertDocumentAccess(documentId, db)
  const [entities, attributeRows] = await Promise.all([
    db
      .select()
      .from(documentEntities)
      .where(eq(documentEntities.document_id, documentId))
      .orderBy(asc(documentEntities.entity_text)),
    db
      .select({
        entity_id: entityAttributeValues.entity_id,
        id: entityAttributeValues.id,
        attribute_id: entityAttributeValues.attribute_id,
        value: entityAttributeValues.value,
        attribute_name: ontologyAttributes.name,
        data_type: ontologyAttributes.data_type,
      })
      .from(entityAttributeValues)
      .innerJoin(
        documentEntities,
        eq(entityAttributeValues.entity_id, documentEntities.id)
      )
      .leftJoin(
        ontologyAttributes,
        eq(entityAttributeValues.attribute_id, ontologyAttributes.id)
      )
      .where(eq(documentEntities.document_id, documentId)),
  ])
  const attributesByEntity = new Map<
    string,
    EntityWithAttributes["attributes"]
  >()
  for (const attribute of attributeRows) {
    const values = attributesByEntity.get(attribute.entity_id) ?? []
    values.push({
      id: attribute.id,
      attribute_id: attribute.attribute_id,
      attribute_name: attribute.attribute_name ?? "",
      data_type: attribute.data_type ?? "",
      value: attribute.value,
    })
    attributesByEntity.set(attribute.entity_id, values)
  }
  return entities.map((entity) => ({
    ...entity,
    attributes: attributesByEntity.get(entity.id) ?? [],
  }))
}

export async function fetchDocumentEntities(documentId: string) {
  return getDocumentEntities(documentId)
}
