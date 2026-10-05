"use client"

import { useMemo } from "react"

import { useQuery } from "@tanstack/react-query"

import { getTriplePickerOptions } from "@/lib/triple-picker-options"
import type { PickerConstraintCopy } from "@/components/shared/class-picker/types"

import type { DocumentOntology, FactWithAnchors } from "../server/queries"
import { fetchOntologyForDocument } from "../server/queries"
import { getFactPickerConstraintState } from "../components/fact-card/picker-constraints"

export interface FactOntology {
  classes: DocumentOntology["classes"]
  relations: DocumentOntology["relations"]
  modules: DocumentOntology["modules"]
  attributes: DocumentOntology["attributes"]
  relationAttributes: DocumentOntology["relationAttributes"]
  filteredSubjectClasses: DocumentOntology["classes"]
  filteredRelations: DocumentOntology["relations"]
  filteredObjectClasses: DocumentOntology["classes"]
  unavailableSubjectClasses: DocumentOntology["classes"]
  unavailableRelations: DocumentOntology["relations"]
  unavailableObjectClasses: DocumentOntology["classes"]
  subjectConstraintCopy?: PickerConstraintCopy
  relationConstraintCopy?: PickerConstraintCopy
  objectConstraintCopy?: PickerConstraintCopy
}

export function useFactOntology(
  fact: FactWithAnchors,
  documentId: string
): FactOntology {
  const { data: ontology } = useQuery({
    queryKey: ["document-ontology", documentId],
    queryFn: () => fetchOntologyForDocument(documentId),
  })

  const classes = useMemo(() => ontology?.classes ?? [], [ontology])
  const relations = useMemo(() => ontology?.relations ?? [], [ontology])
  const modules = useMemo(() => ontology?.modules ?? [], [ontology])
  const attributes = useMemo(() => ontology?.attributes ?? [], [ontology])
  const relationAttributes = useMemo(
    () => ontology?.relationAttributes ?? [],
    [ontology]
  )

  const subjectId = fact.subject_class_id
  const relationId = fact.relation_type_id
  const objectId = fact.object_class_id

  const { filteredSubjectClasses, filteredRelations, filteredObjectClasses } =
    useMemo(
      () =>
        getTriplePickerOptions({
          classes,
          relations,
          subjectId,
          relationId,
          objectId,
        }),
      [classes, relations, subjectId, relationId, objectId]
    )

  const unavailableSubjectClasses = useMemo(() => {
    const allowedIds = new Set(filteredSubjectClasses.map((cls) => cls.id))
    return classes.filter((cls) => !allowedIds.has(cls.id))
  }, [classes, filteredSubjectClasses])

  const unavailableRelations = useMemo(() => {
    const allowedIds = new Set(filteredRelations.map((r) => r.id))
    return relations.filter((r) => !allowedIds.has(r.id))
  }, [filteredRelations, relations])

  const unavailableObjectClasses = useMemo(() => {
    const allowedIds = new Set(filteredObjectClasses.map((cls) => cls.id))
    return classes.filter((cls) => !allowedIds.has(cls.id))
  }, [classes, filteredObjectClasses])

  const {
    subjectConstraintCopy,
    relationConstraintCopy,
    objectConstraintCopy,
  } = useMemo(
    () => getFactPickerConstraintState({ fact, classes, relations }),
    [fact, classes, relations]
  )

  return {
    classes,
    relations,
    modules,
    attributes,
    relationAttributes,
    filteredSubjectClasses,
    filteredRelations,
    filteredObjectClasses,
    unavailableSubjectClasses,
    unavailableRelations,
    unavailableObjectClasses,
    subjectConstraintCopy,
    relationConstraintCopy,
    objectConstraintCopy,
  }
}
