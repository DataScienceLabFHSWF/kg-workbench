"use client"

import { useEffect, useMemo, useRef, useState } from "react"

import { useQuery, useQueryClient } from "@tanstack/react-query"

import { ScrollArea } from "@/components/ui/scroll-area"
import type { FactReviewStatus } from "@/lib/types"
import { bulkReviewFacts } from "../../../server/actions/facts"
import {
  fetchDocumentEntities,
  fetchOntologyForDocument,
} from "../../../server/queries"
import {
  getAllowedBulkActions,
  type BulkAction,
} from "../../../utils/fact-status"
import { getFactCompleteness } from "../../../utils/fact-completeness"
import {
  filterFacts,
  groupFactsBySection,
} from "../../../utils/document-filters"
import { VisibleSelectionControls } from "../../shared/visible-selection-controls"
import { CrossChapterSection } from "./cross-chapter-section"
import { SectionsToolbar } from "../shared/sections-toolbar"
import { FactSection } from "./fact-section"
import type { FactsTabProps } from "./types"
import { useDocumentsWorkspace } from "@/features/documents/hooks/documents-workspace-state"

export function FactsTab({
  facts,
  documentId,
  doc,
  anchorFilter,
  onJumpToParagraph,
  activeSectionId,
  isolatedSectionId,
  syncEnabled,
  highlightedFactId,
  highlightedFactSource,
  highlightedFactRequestKey = 0,
  isActive,
  onEntityClick,
  onFactClick,
}: FactsTabProps) {
  const {
    sharedFilters,
    setSectionId,
    setEntity,
    setExtractedRelation,
    setScope,
  } = useDocumentsWorkspace()
  const queryClient = useQueryClient()
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [isBulkPending, setIsBulkPending] = useState(false)
  const [openSectionIds, setOpenSectionIds] = useState<Set<string>>(new Set())
  const [crossChapterOpen, setCrossChapterOpen] = useState(false)

  const sectionGroupRefs = useRef<Map<string, HTMLDivElement>>(new Map())
  const factCardRefs = useRef<Map<string, HTMLDivElement>>(new Map())

  const { data: ontology } = useQuery({
    queryKey: ["document-ontology", documentId],
    queryFn: () => fetchOntologyForDocument(documentId),
  })
  const { data: entities = [] } = useQuery({
    queryKey: ["document-entities", documentId],
    queryFn: () => fetchDocumentEntities(documentId),
  })

  const baseFilters = useMemo(
    () => ({
      anchorFilter,
      sharedFilters,
      ontology,
      entitiesById: new Map(entities.map((entity) => [entity.id, entity])),
    }),
    [anchorFilter, entities, sharedFilters, ontology]
  )

  const filteredFacts = useMemo(
    () => filterFacts(facts, baseFilters),
    [facts, baseFilters]
  )
  const filteredInChapter = useMemo(
    () => filteredFacts.filter((fact) => !fact.is_cross_chapter),
    [filteredFacts]
  )
  const filteredCrossChapter = useMemo(
    () => filteredFacts.filter((fact) => fact.is_cross_chapter),
    [filteredFacts]
  )

  const sectionGroups = useMemo(
    () => groupFactsBySection(filteredInChapter, doc),
    [filteredInChapter, doc]
  )

  const showInChapterFacts = sharedFilters.scope !== "cross_chapter"
  const showCrossChapterFacts = sharedFilters.scope !== "in_chapter"

  useEffect(() => {
    setSelectedIds(new Set())
    setOpenSectionIds(new Set())
    setCrossChapterOpen(false)
  }, [documentId])

  useEffect(() => {
    if (isolatedSectionId) {
      setOpenSectionIds(new Set([isolatedSectionId]))
      setCrossChapterOpen(false)
    }
  }, [isolatedSectionId])

  useEffect(() => {
    if (!syncEnabled || !activeSectionId) return
    setOpenSectionIds(new Set([activeSectionId]))
    setCrossChapterOpen(false)
  }, [activeSectionId, syncEnabled])

  useEffect(() => {
    if (!highlightedFactId) return

    const highlightedFact = filteredFacts.find(
      (fact) => fact.id === highlightedFactId
    )
    if (!highlightedFact) return

    if (highlightedFact.is_cross_chapter) {
      setCrossChapterOpen(true)
      return
    }

    const sectionId = highlightedFact.anchors.find(
      (anchor) => anchor.section_id
    )?.section_id

    if (!sectionId) return

    setOpenSectionIds((prev) => {
      if (prev.has(sectionId)) return prev

      const next = new Set(prev)
      next.add(sectionId)
      return next
    })
  }, [filteredFacts, highlightedFactId, highlightedFactRequestKey])

  useEffect(() => {
    if (!syncEnabled || !activeSectionId) return
    sectionGroupRefs.current.get(activeSectionId)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    })
  }, [activeSectionId, syncEnabled])

  useEffect(() => {
    if (!highlightedFactId || !isActive) return

    const rafId = requestAnimationFrame(() => {
      const element = factCardRefs.current.get(highlightedFactId)
      if (!element) return

      const viewport = element.closest<HTMLElement>(
        "[data-radix-scroll-area-viewport]"
      )

      if (viewport) {
        const elementRect = element.getBoundingClientRect()
        const viewportRect = viewport.getBoundingClientRect()
        const offset =
          elementRect.top -
          viewportRect.top -
          (viewportRect.height - elementRect.height) / 2

        viewport.scrollBy({ top: offset, behavior: "smooth" })
      } else {
        element.scrollIntoView({ behavior: "smooth", block: "center" })
      }
    })

    return () => cancelAnimationFrame(rafId)
  }, [highlightedFactId, highlightedFactRequestKey, isActive])

  const allVisibleFacts = useMemo(
    () => [
      ...(showInChapterFacts
        ? sectionGroups
            .filter((group) => openSectionIds.has(group.sectionId))
            .flatMap((group) => group.facts)
        : []),
      ...(showCrossChapterFacts && crossChapterOpen
        ? filteredCrossChapter
        : []),
    ],
    [
      sectionGroups,
      filteredCrossChapter,
      crossChapterOpen,
      openSectionIds,
      showCrossChapterFacts,
      showInChapterFacts,
    ]
  )

  const allowedBulkActions = useMemo((): Set<BulkAction> => {
    if (selectedIds.size === 0) return new Set()

    const selectedFacts = allVisibleFacts.filter((fact) =>
      selectedIds.has(fact.id)
    )
    if (selectedFacts.length === 0) return new Set()

    const entityById = new Map(entities.map((entity) => [entity.id, entity]))
    const [firstSet, ...otherSets] = selectedFacts.map((fact) =>
      getAllowedBulkActions(
        fact,
        getFactCompleteness(fact, ontology, entityById).isComplete
      )
    )

    return otherSets.reduce(
      (acc, actionSet) =>
        new Set([...acc].filter((action) => actionSet.has(action))),
      new Set(firstSet)
    )
  }, [selectedIds, allVisibleFacts, entities, ontology])

  useEffect(() => {
    const visibleIds = new Set(allVisibleFacts.map((fact) => fact.id))

    setSelectedIds((prev) => {
      const next = new Set([...prev].filter((id) => visibleIds.has(id)))
      return next.size === prev.size ? prev : next
    })
  }, [allVisibleFacts])

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

  function toggleSelectAll() {
    if (selectedIds.size === allVisibleFacts.length) {
      setSelectedIds(new Set())
      return
    }

    setSelectedIds(new Set(allVisibleFacts.map((fact) => fact.id)))
  }

  function handleFactSelectionChange(id: string, checked: boolean) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (checked) next.add(id)
      else next.delete(id)
      return next
    })
  }

  function handleSectionRef(sectionId: string, element: HTMLDivElement | null) {
    if (element) sectionGroupRefs.current.set(sectionId, element)
    else sectionGroupRefs.current.delete(sectionId)
  }

  function handleFactRef(factId: string, element: HTMLDivElement | null) {
    if (element) factCardRefs.current.set(factId, element)
    else factCardRefs.current.delete(factId)
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
    if (showInChapterFacts) {
      setOpenSectionIds(new Set(sectionGroups.map((group) => group.sectionId)))
    }

    if (showCrossChapterFacts && filteredCrossChapter.length > 0) {
      setCrossChapterOpen(true)
    }
  }

  function handleCollapseAll() {
    if (showInChapterFacts) {
      setOpenSectionIds(new Set())
    }

    if (showCrossChapterFacts) {
      setCrossChapterOpen(false)
    }
  }

  const hasNoMatches =
    (showInChapterFacts ? sectionGroups.length === 0 : true) &&
    (showCrossChapterFacts ? filteredCrossChapter.length === 0 : true)

  return (
    <div className="flex h-full flex-col">
      <SectionsToolbar
        disabled={
          sectionGroups.length === 0 && filteredCrossChapter.length === 0
        }
        onExpandAll={handleExpandAll}
        onCollapseAll={handleCollapseAll}
      />

      <div className="shrink-0 border-b bg-background px-3 py-2">
        <VisibleSelectionControls
          visibleCount={allVisibleFacts.length}
          selectedCount={selectedIds.size}
          allSelected={
            selectedIds.size === allVisibleFacts.length &&
            allVisibleFacts.length > 0
          }
          allowedActions={allowedBulkActions}
          isBulkPending={isBulkPending}
          onToggleSelectAll={toggleSelectAll}
          onBulkReview={handleBulkReview}
        />
      </div>

      <ScrollArea className="min-h-0 flex-1">
        {hasNoMatches ? (
          <p className="px-4 py-6 text-center text-xs text-muted-foreground">
            No facts match the current filter.
          </p>
        ) : (
          <div className="pb-3">
            {showInChapterFacts &&
              sectionGroups.map((group) => (
                <FactSection
                  key={group.sectionId}
                  group={group}
                  open={openSectionIds.has(group.sectionId)}
                  documentId={documentId}
                  highlightedFactId={highlightedFactId}
                  highlightedFactSource={highlightedFactSource}
                  highlightedFactRequestKey={highlightedFactRequestKey}
                  selectedIds={selectedIds}
                  onOpenChange={(open) =>
                    handleSectionOpenChange(group.sectionId, open)
                  }
                  onSectionFilterChange={setSectionId}
                  onJumpToParagraph={onJumpToParagraph}
                  onEntityFilterChange={setEntity}
                  onExtractedRelationFilterChange={setExtractedRelation}
                  onEntityClick={onEntityClick}
                  onFactClick={onFactClick}
                  onSelectChange={handleFactSelectionChange}
                  onSectionRef={handleSectionRef}
                  onFactRef={handleFactRef}
                />
              ))}

            {showCrossChapterFacts && filteredCrossChapter.length > 0 && (
              <CrossChapterSection
                facts={filteredCrossChapter}
                totalFactsCount={filteredCrossChapter.length}
                open={crossChapterOpen}
                documentId={documentId}
                highlightedFactId={highlightedFactId}
                highlightedFactSource={highlightedFactSource}
                highlightedFactRequestKey={highlightedFactRequestKey}
                selectedIds={selectedIds}
                onOpenChange={setCrossChapterOpen}
                onJumpToParagraph={onJumpToParagraph}
                onEntityFilterChange={setEntity}
                onExtractedRelationFilterChange={setExtractedRelation}
                onEntityClick={onEntityClick}
                onFactClick={onFactClick}
                onSelectChange={handleFactSelectionChange}
                onFactRef={handleFactRef}
                onCrossChapterFilterChange={() => {
                  setSectionId(null)
                  setScope("cross_chapter")
                }}
              />
            )}
          </div>
        )}
      </ScrollArea>
    </div>
  )
}
