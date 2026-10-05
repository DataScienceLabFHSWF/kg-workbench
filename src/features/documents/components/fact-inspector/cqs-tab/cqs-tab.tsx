"use client"

import { useMemo, useState } from "react"

import { useQuery } from "@tanstack/react-query"

import {
  fetchDocumentEntities,
  fetchOntologyForDocument,
} from "../../../server/queries"
import { useDocumentsWorkspace } from "../../../hooks/documents-workspace-state"
import { applyCQToFilters, formatCQPattern } from "../../../utils/cq-filters"
import {
  DOCUMENT_FILTER_ALL,
  filterFacts,
} from "../../../utils/document-filters"
import { SectionsToolbar } from "../shared/sections-toolbar"
import { CQSection } from "./cq-section"
import type { CQsTabProps } from "./types"

export function CQsTab({
  facts,
  documentId,
  anchorFilter,
  highlightedFactId,
  onJumpToParagraph,
  onEntityClick,
  onFactClick,
}: CQsTabProps) {
  const {
    sharedFilters,
    setClass,
    setEntity,
    setRelation,
    setSubjectClass,
    setObjectClass,
    setSubjectEntity,
    setObjectEntity,
  } = useDocumentsWorkspace()
  const [openCQIds, setOpenCQIds] = useState<Set<string>>(new Set())
  const [initializedDocumentId, setInitializedDocumentId] = useState<
    string | null
  >(null)

  const { data: ontology } = useQuery({
    queryKey: ["document-ontology", documentId],
    queryFn: () => fetchOntologyForDocument(documentId),
  })
  const { data: entities = [] } = useQuery({
    queryKey: ["document-entities", documentId],
    queryFn: () => fetchDocumentEntities(documentId),
  })

  const cqItems = useMemo(() => {
    if (!ontology) return []

    const entitiesById = new Map(entities.map((entity) => [entity.id, entity]))

    return ontology.cqs.map((cq) => {
      const cqFilters = applyCQToFilters(sharedFilters, cq, ontology)
      const matchingFacts = filterFacts(facts, {
        anchorFilter,
        sharedFilters: cqFilters,
        ontology,
        entitiesById,
      })

      return {
        cq,
        pattern: formatCQPattern(cq, ontology),
        facts: matchingFacts,
      }
    })
  }, [anchorFilter, entities, facts, ontology, sharedFilters])

  if (initializedDocumentId !== documentId) {
    setOpenCQIds(new Set())
    setInitializedDocumentId(documentId)
  }

  function toggleCQ(cqId: string, open: boolean) {
    setOpenCQIds((prev) => {
      const next = new Set(prev)
      if (open) next.add(cqId)
      else next.delete(cqId)
      return next
    })
  }

  function handleExpandAll() {
    setOpenCQIds(new Set(cqItems.map((item) => item.cq.id)))
  }

  function handleCollapseAll() {
    setOpenCQIds(new Set())
  }

  function handleApplyFilter(cqId: string) {
    if (!ontology) return

    const cq = ontology.cqs.find((item) => item.id === cqId)
    if (!cq) return

    const nextFilters = applyCQToFilters(sharedFilters, cq, ontology)
    setClass(DOCUMENT_FILTER_ALL)
    setEntity(DOCUMENT_FILTER_ALL)
    setRelation(nextFilters.relation)
    setSubjectClass(nextFilters.subjectClass)
    setObjectClass(nextFilters.objectClass)
    setSubjectEntity(nextFilters.subjectEntity)
    setObjectEntity(nextFilters.objectEntity)
  }

  if (!ontology) {
    return (
      <p className="px-4 py-6 text-center text-xs text-muted-foreground">
        Loading competency questions…
      </p>
    )
  }

  if (ontology.cqs.length === 0) {
    return (
      <p className="px-4 py-6 text-center text-xs text-muted-foreground">
        No competency questions are linked to this ontology.
      </p>
    )
  }

  return (
    <div className="flex h-full flex-col">
      <SectionsToolbar
        disabled={cqItems.length === 0}
        onExpandAll={handleExpandAll}
        onCollapseAll={handleCollapseAll}
      />

      <div className="min-h-0 flex-1 overflow-y-auto">
        {cqItems.map((item) => (
          <CQSection
            key={item.cq.id}
            cq={item.cq}
            pattern={item.pattern}
            facts={item.facts}
            documentId={documentId}
            open={openCQIds.has(item.cq.id)}
            highlightedFactId={highlightedFactId}
            onOpenChange={(open) => toggleCQ(item.cq.id, open)}
            onApplyFilter={() => handleApplyFilter(item.cq.id)}
            onJumpToParagraph={onJumpToParagraph}
            onEntityClick={onEntityClick}
            onFactClick={onFactClick}
          />
        ))}
      </div>
    </div>
  )
}
