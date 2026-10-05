import type { DocumentOntology } from "../server/queries"
import type { DocumentFiltersState } from "./document-filters"
import { DOCUMENT_FILTER_ALL } from "./document-filters"

export function applyCQToFilters(
  filters: DocumentFiltersState,
  cq: DocumentOntology["cqs"][number],
  ontology: DocumentOntology | null | undefined
): DocumentFiltersState {
  const classById = new Map(
    (ontology?.classes ?? []).map((cls) => [cls.id, cls])
  )
  const relationById = new Map(
    (ontology?.relations ?? []).map((relation) => [relation.id, relation])
  )
  const exampleById = new Map(
    (ontology?.examples ?? []).map((example) => [example.id, example])
  )

  const subjectClass = cq.subjectClassId
    ? {
        id: cq.subjectClassId,
        name: classById.get(cq.subjectClassId)?.name ?? cq.subjectClassId,
      }
    : DOCUMENT_FILTER_ALL
  const objectClass = cq.objectClassId
    ? {
        id: cq.objectClassId,
        name: classById.get(cq.objectClassId)?.name ?? cq.objectClassId,
      }
    : DOCUMENT_FILTER_ALL
  const relation = cq.predicateRelationId
    ? {
        id: cq.predicateRelationId,
        name:
          relationById.get(cq.predicateRelationId)?.name ??
          cq.predicateRelationId,
      }
    : DOCUMENT_FILTER_ALL
  const subjectEntity = cq.subjectExampleId
    ? {
        label:
          exampleById.get(cq.subjectExampleId)?.value ?? cq.subjectExampleId,
        text:
          exampleById.get(cq.subjectExampleId)?.value ?? cq.subjectExampleId,
      }
    : DOCUMENT_FILTER_ALL
  const objectEntity = cq.objectExampleId
    ? {
        label: exampleById.get(cq.objectExampleId)?.value ?? cq.objectExampleId,
        text: exampleById.get(cq.objectExampleId)?.value ?? cq.objectExampleId,
      }
    : DOCUMENT_FILTER_ALL

  return {
    ...filters,
    relation,
    subjectClass,
    objectClass,
    subjectEntity,
    objectEntity,
  }
}

export function formatCQPattern(
  cq: DocumentOntology["cqs"][number],
  ontology: DocumentOntology | null | undefined
) {
  const classById = new Map(
    (ontology?.classes ?? []).map((cls) => [cls.id, cls])
  )
  const relationById = new Map(
    (ontology?.relations ?? []).map((relation) => [relation.id, relation])
  )
  const exampleById = new Map(
    (ontology?.examples ?? []).map((example) => [example.id, example])
  )

  function formatSegment(
    label: string | null | undefined,
    exampleId: string | null | undefined
  ) {
    if (!label) return null
    const example = exampleId ? exampleById.get(exampleId)?.value : null
    return example ? `${label} (${example})` : label
  }

  return [
    formatSegment(
      cq.subjectClassId ? classById.get(cq.subjectClassId)?.name : null,
      cq.subjectExampleId
    ),
    formatSegment(
      cq.predicateRelationId
        ? relationById.get(cq.predicateRelationId)?.name
        : null,
      cq.predicateExampleId
    ),
    formatSegment(
      cq.objectClassId ? classById.get(cq.objectClassId)?.name : null,
      cq.objectExampleId
    ),
  ]
    .filter(Boolean)
    .join(" / ")
}
