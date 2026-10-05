import type { EntityWithAttributes } from "@/domain/documents"

import type {
  DocumentOntology,
  DocumentOntologyAttribute,
  DocumentOntologyRelationAttribute,
  FactWithAnchors,
} from "../server/queries"

export interface MissingEntityAttribute {
  entityId: string
  entityText: string
  attribute: DocumentOntologyAttribute
}

export interface FactCompletenessResult {
  missingRelationAttributes: DocumentOntologyRelationAttribute[]
  missingSubjectAttributes: MissingEntityAttribute[]
  missingObjectAttributes: MissingEntityAttribute[]
  isComplete: boolean
}

export function getEntityMissingRequiredAttributes(
  entity: EntityWithAttributes | null | undefined,
  ontologyAttributes: DocumentOntology["attributes"]
): DocumentOntologyAttribute[] {
  if (!entity?.class_id) return []

  const assignedAttributeIds = new Set(
    entity.attributes.map((attribute) => attribute.attribute_id)
  )

  return ontologyAttributes.filter(
    (attribute) =>
      attribute.classId === entity.class_id &&
      attribute.required &&
      !assignedAttributeIds.has(attribute.id)
  )
}

export function getFactCompleteness(
  fact: FactWithAnchors,
  ontology:
    | Pick<DocumentOntology, "attributes" | "relationAttributes">
    | null
    | undefined,
  entitiesById: Map<string, EntityWithAttributes>
): FactCompletenessResult {
  if (!ontology) {
    return {
      missingRelationAttributes: [],
      missingSubjectAttributes: [],
      missingObjectAttributes: [],
      isComplete: true,
    }
  }

  const factRelationAttributeIds = new Set(
    fact.relation_attribute_values.map((value) => value.relation_attribute_id)
  )
  const missingRelationAttributes =
    fact.relation_type_id === null
      ? []
      : ontology.relationAttributes.filter(
          (attribute) =>
            attribute.relationId === fact.relation_type_id &&
            attribute.required &&
            !factRelationAttributeIds.has(attribute.id)
        )

  const subjectEntity = fact.subject_entity_id
    ? (entitiesById.get(fact.subject_entity_id) ?? null)
    : null
  const objectEntity = fact.object_entity_id
    ? (entitiesById.get(fact.object_entity_id) ?? null)
    : null

  const missingSubjectAttributes = getEntityMissingRequiredAttributes(
    subjectEntity,
    ontology.attributes
  ).map((attribute) => ({
    entityId: subjectEntity!.id,
    entityText: subjectEntity!.entity_text,
    attribute,
  }))
  const missingObjectAttributes = getEntityMissingRequiredAttributes(
    objectEntity,
    ontology.attributes
  ).map((attribute) => ({
    entityId: objectEntity!.id,
    entityText: objectEntity!.entity_text,
    attribute,
  }))

  return {
    missingRelationAttributes,
    missingSubjectAttributes,
    missingObjectAttributes,
    isComplete:
      missingRelationAttributes.length === 0 &&
      missingSubjectAttributes.length === 0 &&
      missingObjectAttributes.length === 0,
  }
}
