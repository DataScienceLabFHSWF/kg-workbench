"use client"

import { useEffect, useMemo, useState } from "react"

import { useQuery, useQueryClient } from "@tanstack/react-query"

import type { FactReviewStatus } from "@/lib/types"
import { bulkReviewFacts } from "../../server/actions/facts"
import {
  fetchDocumentEntities,
  fetchDocumentFacts,
  fetchDocumentWithSections,
  fetchOntologyForDocument,
  type FactWithAnchors,
} from "../../server/queries"
import {
  DOCUMENT_FILTER_ALL,
  filterFacts,
  groupFactsBySection,
} from "../../utils/document-filters"
import { getAllowedBulkActions, type BulkAction } from "../../utils/fact-status"
import { getFactCompleteness } from "../../utils/fact-completeness"
import { useDocumentsWorkspace } from "../../hooks/documents-workspace-state"
import { FactTableHeader } from "./fact-table-header"
import { FactTableRow } from "./fact-table-row"
import { FactTableSectionRows } from "./fact-table-section-rows"
import { FactTableToolbar } from "./fact-table-toolbar"
import { sortFacts } from "./fact-table-utils"
import type { FactTableSortDir, FactTableSortField } from "./types"

interface FactTableProps {
  onRevealInspector?: () => void
}

export function FactTable({ onRevealInspector }: FactTableProps) {
  const {
    selectedDocumentId,
    sharedFilters,
    anchorFilter,
    setSection,
    setScope,
  } = useDocumentsWorkspace()
  const queryClient = useQueryClient()

  const [groupBySection, setGroupBySection] = useState(true)
  const [openSectionIds, setOpenSectionIds] = useState<Set<string>>(new Set())
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [isBulkPending, setIsBulkPending] = useState(false)
  const [sortField, setSortField] = useState<FactTableSortField>("confidence")
  const [sortDir, setSortDir] = useState<FactTableSortDir>("desc")

  const documentId = selectedDocumentId ?? ""

  const { data: doc } = useQuery({
    queryKey: ["document-with-sections", documentId],
    queryFn: () => fetchDocumentWithSections(documentId),
    enabled: !!selectedDocumentId,
  })

  const { data: facts = [] } = useQuery<FactWithAnchors[]>({
    queryKey: ["document-facts", documentId],
    queryFn: () => fetchDocumentFacts(documentId),
    enabled: !!selectedDocumentId,
  })

  const { data: ontology } = useQuery({
    queryKey: ["document-ontology", documentId],
    queryFn: () => fetchOntologyForDocument(documentId),
    enabled: !!selectedDocumentId,
  })
  const { data: entities = [] } = useQuery({
    queryKey: ["document-entities", documentId],
    queryFn: () => fetchDocumentEntities(documentId),
    enabled: !!selectedDocumentId,
  })

  const entityById = useMemo(
    () => new Map(entities.map((entity) => [entity.id, entity])),
    [entities]
  )

  const filteredFacts = useMemo(
    () =>
      filterFacts(facts, {
        anchorFilter,
        sharedFilters,
        ontology,
        entitiesById: entityById,
      }),
    [facts, anchorFilter, sharedFilters, ontology, entityById]
  )

  const sortedFacts = useMemo(
    () => sortFacts(filteredFacts, sortField, sortDir),
    [filteredFacts, sortField, sortDir]
  )

  const sectionGroups = useMemo(() => {
    if (!groupBySection || !doc) return []
    return groupFactsBySection(sortedFacts, doc).map((group) => ({
      ...group,
      facts: sortFacts(group.facts, sortField, sortDir),
    }))
  }, [groupBySection, sortedFacts, doc, sortField, sortDir])

  const allVisibleFacts = useMemo(() => {
    if (!groupBySection) return sortedFacts
    return sectionGroups
      .filter((group) => openSectionIds.has(group.sectionId))
      .flatMap((group) => group.facts)
  }, [groupBySection, sortedFacts, sectionGroups, openSectionIds])

  const allowedBulkActions = useMemo((): Set<BulkAction> => {
    if (selectedIds.size === 0) return new Set()
    const selected = allVisibleFacts.filter((f) => selectedIds.has(f.id))
    if (selected.length === 0) return new Set()
    const [first, ...rest] = selected.map((fact) =>
      getAllowedBulkActions(
        fact,
        getFactCompleteness(fact, ontology, entityById).isComplete
      )
    )
    return rest.reduce(
      (acc, set) => new Set([...acc].filter((a) => set.has(a))),
      new Set(first)
    )
  }, [selectedIds, allVisibleFacts, entityById, ontology])

  useEffect(() => {
    const visibleIds = new Set(allVisibleFacts.map((fact) => fact.id))

    setSelectedIds((prev) => {
      const next = new Set([...prev].filter((id) => visibleIds.has(id)))
      return next.size === prev.size ? prev : next
    })
  }, [allVisibleFacts])

  function handleSort(field: FactTableSortField) {
    if (field === sortField) setSortDir((d) => (d === "asc" ? "desc" : "asc"))
    else {
      setSortField(field)
      setSortDir(field === "confidence" ? "desc" : "asc")
    }
  }

  function handleSectionOpenChange(sectionId: string, open: boolean) {
    setOpenSectionIds((prev) => {
      const next = new Set(prev)
      if (open) next.add(sectionId)
      else next.delete(sectionId)
      return next
    })
  }

  function handleExpandAll() {
    setOpenSectionIds(new Set(sectionGroups.map((g) => g.sectionId)))
  }

  function handleCollapseAll() {
    setOpenSectionIds(new Set())
  }

  function handleSelectChange(id: string, checked: boolean) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (checked) next.add(id)
      else next.delete(id)
      return next
    })
  }

  function toggleSelectAll() {
    if (selectedIds.size === allVisibleFacts.length) {
      setSelectedIds(new Set())
      return
    }

    setSelectedIds(new Set(allVisibleFacts.map((fact) => fact.id)))
  }

  function handleSectionFilterChange(
    sectionId: string,
    sectionTitle: string | null
  ) {
    setScope(DOCUMENT_FILTER_ALL)
    setSection({
      id: sectionId,
      name: sectionTitle ?? sectionId,
    })
  }

  function handleCrossChapterFilterChange() {
    setSection(DOCUMENT_FILTER_ALL)
    setScope("cross_chapter")
  }

  async function handleBulkReview(status: FactReviewStatus) {
    const ids = Array.from(selectedIds)
    if (ids.length === 0) return
    setIsBulkPending(true)
    try {
      await bulkReviewFacts(ids, status)
      await queryClient.invalidateQueries({
        queryKey: ["document-facts", documentId],
      })
      setSelectedIds(new Set())
    } finally {
      setIsBulkPending(false)
    }
  }

  if (!selectedDocumentId) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-xs text-muted-foreground">
          Select a document to view facts.
        </p>
      </div>
    )
  }

  const isEmpty = groupBySection
    ? sectionGroups.length === 0
    : sortedFacts.length === 0

  return (
    <div className="flex h-full flex-col">
      <FactTableToolbar
        allVisibleSelected={
          selectedIds.size === allVisibleFacts.length &&
          allVisibleFacts.length > 0
        }
        allowedActions={allowedBulkActions}
        groupBySection={groupBySection}
        isBulkPending={isBulkPending}
        selectedCount={selectedIds.size}
        visibleCount={allVisibleFacts.length}
        onBulkReview={handleBulkReview}
        onToggleSelectAll={toggleSelectAll}
        onGroupBySectionChange={setGroupBySection}
        onExpandAll={handleExpandAll}
        onCollapseAll={handleCollapseAll}
      />

      <div className="min-h-0 flex-1 overflow-auto">
        {isEmpty ? (
          <p className="px-4 py-6 text-center text-xs text-muted-foreground">
            No facts match the current filter.
          </p>
        ) : (
          <table className="w-full table-fixed text-xs">
            <FactTableHeader
              sortField={sortField}
              sortDir={sortDir}
              onSort={handleSort}
            />
            <tbody>
              {groupBySection
                ? sectionGroups.map((group) => (
                    <FactTableSectionRows
                      key={group.sectionId}
                      group={group}
                      open={openSectionIds.has(group.sectionId)}
                      documentId={documentId}
                      completenessOntology={ontology ?? null}
                      entityById={entityById}
                      selectedIds={selectedIds}
                      onRevealInspector={onRevealInspector}
                      onOpenChange={(open) =>
                        handleSectionOpenChange(group.sectionId, open)
                      }
                      onSectionFilterChange={handleSectionFilterChange}
                      onCrossChapterFilterChange={
                        handleCrossChapterFilterChange
                      }
                      onSelectChange={handleSelectChange}
                    />
                  ))
                : sortedFacts.map((fact) => (
                    <FactTableRow
                      key={fact.id}
                      fact={fact}
                      documentId={documentId}
                      completenessOntology={ontology ?? null}
                      entityById={entityById}
                      selectedIds={selectedIds}
                      onRevealInspector={onRevealInspector}
                      onSelectChange={handleSelectChange}
                    />
                  ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
