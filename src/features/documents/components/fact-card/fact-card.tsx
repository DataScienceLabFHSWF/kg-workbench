"use client"

import { useMemo } from "react"
import { useQuery } from "@tanstack/react-query"

import { useFactMutations } from "../../hooks/use-fact-mutations"
import { useFactOntology } from "../../hooks/use-fact-ontology"
import type {
  DocumentConcreteFilterValue,
  DocumentEntityFilter,
  DocumentExtractedRelationFilter,
} from "../../utils/document-filters"
import {
  getEffectiveStatus,
  isStructurallyUnmapped,
} from "../../utils/fact-status"
import {
  fetchDocumentEntities,
  type FactWithAnchors,
} from "../../server/queries"
import { getFactCompleteness } from "../../utils/fact-completeness"
import { FactCardContent } from "./fact-card-content"
import { PendingEntityClassDialog } from "./pending-entity-class-dialog"

interface FactCardProps {
  fact: FactWithAnchors
  documentId: string
  onAnchorClick: (paragraphId: string | null) => void
  onEntityFilterChange?: (
    value: DocumentConcreteFilterValue<DocumentEntityFilter>
  ) => void
  onExtractedRelationFilterChange?: (
    value: DocumentConcreteFilterValue<DocumentExtractedRelationFilter>
  ) => void
  onEntityClick?: (entityId: string) => void
  onGoToGraph?: (factId: string) => void
  relationDetailsAutoExpandKey?: number
}

export function FactCard({
  fact,
  documentId,
  onAnchorClick,
  onEntityFilterChange,
  onExtractedRelationFilterChange,
  onEntityClick,
  onGoToGraph,
  relationDetailsAutoExpandKey,
}: FactCardProps) {
  const ontology = useFactOntology(fact, documentId)
  const mutations = useFactMutations(fact, documentId, ontology.relations)
  const { data: entities = [] } = useQuery({
    queryKey: ["document-entities", documentId],
    queryFn: () => fetchDocumentEntities(documentId),
  })

  const status = getEffectiveStatus(fact)
  const structurallyUnmapped = isStructurallyUnmapped(fact)
  const entityById = useMemo(
    () => new Map(entities.map((entity) => [entity.id, entity])),
    [entities]
  )
  const completeness = useMemo(
    () => getFactCompleteness(fact, ontology, entityById),
    [entityById, fact, ontology]
  )

  const currentClassName = (() => {
    if (!mutations.pendingEntityClass?.role) return null
    const classId =
      mutations.pendingEntityClass.role === "subject"
        ? fact.subject_class_id
        : fact.object_class_id
    return ontology.classes.find((cls) => cls.id === classId)?.name ?? null
  })()

  const pendingClassName = mutations.pendingEntityClass?.classId
    ? (ontology.classes.find(
        (cls) => cls.id === mutations.pendingEntityClass!.classId
      )?.name ?? null)
    : null

  return (
    <>
      <PendingEntityClassDialog
        dialogType={mutations.dialogType}
        affectedFacts={mutations.affectedFacts}
        currentClassName={currentClassName}
        pendingClassName={pendingClassName}
        onConfirm={mutations.handleConfirmEntityClass}
        onCancel={mutations.handleCancelEntityClass}
      />

      <FactCardContent
        fact={fact}
        status={status}
        structurallyUnmapped={structurallyUnmapped}
        isAnyPending={mutations.isAnyPending}
        isReviewPending={mutations.isReviewPending}
        classes={ontology.classes}
        modules={ontology.modules}
        filteredSubjectClasses={ontology.filteredSubjectClasses}
        filteredRelations={ontology.filteredRelations}
        filteredObjectClasses={ontology.filteredObjectClasses}
        unavailableSubjectClasses={ontology.unavailableSubjectClasses}
        unavailableRelations={ontology.unavailableRelations}
        unavailableObjectClasses={ontology.unavailableObjectClasses}
        subjectConstraintCopy={ontology.subjectConstraintCopy}
        relationConstraintCopy={ontology.relationConstraintCopy}
        objectConstraintCopy={ontology.objectConstraintCopy}
        relationAttributes={ontology.relationAttributes}
        onRename={mutations.handleRename}
        onRemapEntityClass={mutations.handleRemapEntityClass}
        onRemapRelation={mutations.handleRemapRelation}
        onAnchorClick={onAnchorClick}
        onEntityFilterChange={onEntityFilterChange}
        onExtractedRelationFilterChange={onExtractedRelationFilterChange}
        onEntityClick={onEntityClick}
        onGoToGraph={onGoToGraph ? () => onGoToGraph(fact.id) : undefined}
        relationDetailsAutoExpandKey={relationDetailsAutoExpandKey}
        completeness={completeness}
        onReview={mutations.handleReview}
      />
    </>
  )
}
