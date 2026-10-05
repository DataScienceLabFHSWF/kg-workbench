"use client"

import { type ReactNode, useEffect, useMemo, useRef } from "react"

import { useQuery } from "@tanstack/react-query"

import { ScrollArea } from "@/components/ui/scroll-area"
import {
  fetchDocumentEntities,
  fetchDocumentFacts,
  fetchOntologyForDocument,
  fetchDocumentWithSections,
} from "../../server/queries"
import { useReaderScrollSync } from "../../hooks/use-reader-scroll-sync"
import { useDocumentsWorkspace } from "../../hooks/documents-workspace-state"
import {
  getMatchingSectionIds,
  getDocumentFilterId,
  DOCUMENT_FILTER_ALL,
  isAllDocumentFilterValue,
} from "../../utils/document-filters"
import { hasAllEffectiveStatuses } from "../../utils/fact-status"
import { DocumentReaderEmptyState } from "./empty-state"
import { DocumentReaderLoadingState } from "./loading-state"
import { DocumentReaderNoSectionsState } from "./no-sections-state"
import { DocumentReaderSectionBlock } from "./section-block"

export interface DocumentReaderProps {
  children?: ReactNode
}

export function DocumentReader({ children }: DocumentReaderProps) {
  const {
    sharedFilters,
    selectedDocumentId: documentId,
    anchorFilter,
    jumpToParagraphId,
    paragraphFactCounts,
    scrollToSectionId,
    activeSectionId,
    viewMode,
    toggleAnchorFilter,
    setActiveSection,
    clearScrollToSection,
  } = useDocumentsWorkspace()
  const isolatedSectionId = getDocumentFilterId(sharedFilters.section)
  const { data: doc, isLoading } = useQuery({
    queryKey: ["document", documentId],
    queryFn: () => fetchDocumentWithSections(documentId!),
    enabled: !!documentId,
  })
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

  const paragraphRefs = useRef<Map<string, HTMLElement>>(new Map())
  const hasFactFilters = Boolean(
    anchorFilter ||
    sharedFilters.scope !== DOCUMENT_FILTER_ALL ||
    sharedFilters.module !== DOCUMENT_FILTER_ALL ||
    sharedFilters.class !== DOCUMENT_FILTER_ALL ||
    sharedFilters.subjectClass !== DOCUMENT_FILTER_ALL ||
    sharedFilters.objectClass !== DOCUMENT_FILTER_ALL ||
    sharedFilters.relation !== DOCUMENT_FILTER_ALL ||
    !isAllDocumentFilterValue(sharedFilters.entity) ||
    !isAllDocumentFilterValue(sharedFilters.subjectEntity) ||
    !isAllDocumentFilterValue(sharedFilters.objectEntity) ||
    !isAllDocumentFilterValue(sharedFilters.extractedRelation) ||
    sharedFilters.moduleLink !== DOCUMENT_FILTER_ALL ||
    !hasAllEffectiveStatuses(sharedFilters.statuses) ||
    sharedFilters.completeness !== DOCUMENT_FILTER_ALL
  )
  const baseFilters = useMemo(
    () => ({
      anchorFilter,
      sharedFilters,
      ontology,
      entitiesById: new Map(entities.map((entity) => [entity.id, entity])),
    }),
    [anchorFilter, entities, sharedFilters, ontology]
  )
  const visibleSections = useMemo(() => {
    const sections = doc?.sections ?? []
    const scopedSections = isolatedSectionId
      ? sections.filter((section) => section.id === isolatedSectionId)
      : sections

    if (!hasFactFilters) return scopedSections

    const matchingSectionIds = getMatchingSectionIds(facts, baseFilters)
    return scopedSections.filter((section) =>
      matchingSectionIds.has(section.id)
    )
  }, [doc?.sections, isolatedSectionId, hasFactFilters, facts, baseFilters])

  const { sectionRefs, suppressIntersectionRef } = useReaderScrollSync({
    sections: visibleSections,
    onActiveSectionChange: setActiveSection,
    enabled: viewMode === "reader",
  })

  useEffect(() => {
    if (!activeSectionId) return
    if (visibleSections.some((section) => section.id === activeSectionId))
      return
    setActiveSection(null)
  }, [activeSectionId, visibleSections, setActiveSection])

  useEffect(() => {
    if (!anchorFilter) return
    const el = paragraphRefs.current.get(anchorFilter)
    el?.scrollIntoView({ behavior: "smooth", block: "center" })
  }, [anchorFilter])

  useEffect(() => {
    if (!jumpToParagraphId) return
    suppressIntersectionRef.current = true
    const el = paragraphRefs.current.get(jumpToParagraphId)
    el?.scrollIntoView({ behavior: "smooth", block: "center" })
    const timer = setTimeout(() => {
      suppressIntersectionRef.current = false
    }, 800)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jumpToParagraphId])

  useEffect(() => {
    if (!scrollToSectionId) return
    suppressIntersectionRef.current = true
    const el = sectionRefs.current.get(scrollToSectionId)
    el?.scrollIntoView({ behavior: "smooth", block: "start" })
    clearScrollToSection()
    const timer = setTimeout(() => {
      suppressIntersectionRef.current = false
    }, 800)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scrollToSectionId])

  if (!documentId) {
    return (
      <DocumentReaderEmptyState
        title="No document selected"
        description="Select a document from the list to read it."
      />
    )
  }

  if (isLoading || !doc) {
    return <DocumentReaderLoadingState />
  }

  return (
    <div className="flex h-full flex-col">
      {children ?? (
        <ScrollArea className="min-h-0 flex-1">
          {visibleSections.length === 0 ? (
            <DocumentReaderNoSectionsState
              isFiltered={Boolean(isolatedSectionId) || hasFactFilters}
            />
          ) : (
            <div className="space-y-6 px-6 py-6">
              {visibleSections.map((section, idx) => (
                <DocumentReaderSectionBlock
                  key={section.id}
                  section={section}
                  isFirst={idx === 0}
                  anchorFilter={anchorFilter}
                  jumpToParagraphId={jumpToParagraphId}
                  paragraphFactCounts={paragraphFactCounts}
                  onAnchorClick={toggleAnchorFilter}
                  sectionRef={(element) => {
                    if (element) sectionRefs.current.set(section.id, element)
                    else sectionRefs.current.delete(section.id)
                  }}
                  paragraphRef={(paragraphId, element) => {
                    if (element) {
                      paragraphRefs.current.set(paragraphId, element)
                    } else {
                      paragraphRefs.current.delete(paragraphId)
                    }
                  }}
                />
              ))}
            </div>
          )}
        </ScrollArea>
      )}
    </div>
  )
}
