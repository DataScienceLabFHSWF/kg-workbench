"use client"

import { useMemo } from "react"

import { useQuery } from "@tanstack/react-query"

import {
  fetchDocumentEntities,
  fetchDocumentFacts,
  fetchOntologyForDocument,
} from "../server/queries"
import { FactGraphCanvas } from "../flow/fact-graph-canvas"
import { useFactGraph } from "../flow/use-fact-graph"
import { useDocumentsWorkspace } from "../hooks/documents-workspace-state"
import {
  DOCUMENT_FILTER_ALL,
  filterFacts,
  isAllDocumentFilterValue,
} from "../utils/document-filters"

export function FactGraphView() {
  const {
    sharedFilters,
    nodesOnly,
    selectedDocumentId: documentId,
    anchorFilter,
    highlightedFactId,
    inspectorEntitySelection,
    setEntity,
    setSubjectEntity,
    setObjectEntity,
    setInspectorEntitySelection,
    highlightFact,
  } = useDocumentsWorkspace()
  const { data: facts = [] } = useQuery({
    queryKey: ["document-facts", documentId],
    queryFn: () => fetchDocumentFacts(documentId!),
    enabled: !!documentId,
  })
  const { data: entities = [] } = useQuery({
    queryKey: ["document-entities", documentId],
    queryFn: () => fetchDocumentEntities(documentId!),
    enabled: !!documentId,
  })

  const { data: ontology } = useQuery({
    queryKey: ["document-ontology", documentId],
    queryFn: () => fetchOntologyForDocument(documentId!),
    enabled: !!documentId,
  })

  const scopedFacts = useMemo(
    () =>
      filterFacts(facts, {
        anchorFilter,
        sharedFilters,
        ontology,
        entitiesById: new Map(entities.map((entity) => [entity.id, entity])),
      }),
    [facts, anchorFilter, entities, sharedFilters, ontology]
  )

  const highlightedEntityId = isAllDocumentFilterValue(sharedFilters.entity)
    ? (inspectorEntitySelection?.entityId ?? null)
    : (sharedFilters.entity.entityId ??
      inspectorEntitySelection?.entityId ??
      null)
  const highlightedEntityText = isAllDocumentFilterValue(sharedFilters.entity)
    ? (inspectorEntitySelection?.entityText ?? null)
    : sharedFilters.entity.text
  const selectedClassId = isAllDocumentFilterValue(sharedFilters.class)
    ? null
    : sharedFilters.class.id
  const selectedEntityId = isAllDocumentFilterValue(sharedFilters.entity)
    ? null
    : (sharedFilters.entity.entityId ?? null)
  const selectedEntityText = isAllDocumentFilterValue(sharedFilters.entity)
    ? null
    : sharedFilters.entity.text

  const { nodes, edges, classColorEntries } = useFactGraph({
    facts: scopedFacts,
    ontology,
    activeStatuses: sharedFilters.statuses,
    isolateSelection: nodesOnly,
    selectedClassId,
    selectedEntityId,
    selectedEntityText,
    highlightedFactId,
    highlightedEntityId,
    highlightedEntityText,
    onEntityFilter: (entityId, entityText) => {
      if (!entityText) return

      setSubjectEntity(DOCUMENT_FILTER_ALL)
      setObjectEntity(DOCUMENT_FILTER_ALL)
      setEntity({
        label: entityText,
        text: entityText,
        entityId,
      })
      setInspectorEntitySelection(null)
    },
  })

  if (!documentId) {
    return null
  }

  if (facts.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 text-muted-foreground">
        <p className="text-xs">No facts to display.</p>
      </div>
    )
  }

  if (scopedFacts.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 text-muted-foreground">
        <p className="text-xs">No facts match the current filter.</p>
      </div>
    )
  }

  return (
    <div className="h-full w-full">
      <FactGraphCanvas
        nodes={nodes}
        edges={nodesOnly ? [] : edges}
        classColorEntries={classColorEntries}
        onNodeClick={(selection) => setInspectorEntitySelection(selection)}
        onEdgeClick={(factId) => highlightFact(factId, "graph")}
      />
    </div>
  )
}
