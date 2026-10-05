"use client"

import { useEffect, useMemo, useState } from "react"

import { useQuery } from "@tanstack/react-query"

import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  fetchDocumentFacts,
  fetchDocumentWithSections,
} from "../../server/queries"
import type { FactWithAnchors } from "../../server/queries"
import { useDocumentsWorkspace } from "../../hooks/documents-workspace-state"
import {
  DOCUMENT_FILTER_ALL,
  getDocumentFilterId,
  isAllDocumentFilterValue,
} from "../../utils/document-filters"
import { CQsTab } from "./cqs-tab/cqs-tab"
import { EntitiesTab } from "./entities-tab/entities-tab"
import { FactsTab } from "./facts-tab/facts-tab"
import { RelationsTab } from "./relations-tab/relations-tab"
import type { EntitySelection, FactHighlightSource } from "./types"

const EMPTY_FACTS: FactWithAnchors[] = []

type ActiveTab = "facts" | "relations" | "entities" | "cqs"

export function FactInspector() {
  const {
    sharedFilters,
    selectedDocumentId: documentId,
    anchorFilter,
    activeSectionId,
    syncEnabled,
    inspectorEntitySelection: entitySelection,
    highlightedFactId,
    highlightedFactSource,
    highlightedFactRequestKey,
    jumpToParagraph,
    setParagraphFactCounts,
    highlightFact,
    setModule,
    setClass,
    setSubjectClass,
    setObjectClass,
    setRelation,
    setEntity,
    setSubjectEntity,
    setObjectEntity,
  } = useDocumentsWorkspace()
  const [activeTab, setActiveTab] = useState<ActiveTab>("facts")
  const [highlightedEntityId, setHighlightedEntityId] = useState<string | null>(
    null
  )
  const [highlightedEntityText, setHighlightedEntityText] = useState<
    string | null
  >(null)
  const [prevDocumentId, setPrevDocumentId] = useState(documentId)
  const [prevEntitySelection, setPrevEntitySelection] =
    useState<EntitySelection | null>(entitySelection)
  const [prevHighlightedFact, setPrevHighlightedFact] = useState<{
    factId: string | null | undefined
    source: FactHighlightSource | null
    requestKey: number
  }>({
    factId: highlightedFactId,
    source: highlightedFactSource,
    requestKey: highlightedFactRequestKey,
  })

  if (documentId !== prevDocumentId) {
    setPrevDocumentId(documentId)
    setActiveTab("facts")
    setHighlightedEntityId(null)
    setHighlightedEntityText(null)
  }

  if (entitySelection !== prevEntitySelection) {
    setPrevEntitySelection(entitySelection)
    setHighlightedEntityId(entitySelection?.entityId ?? null)
    setHighlightedEntityText(entitySelection?.entityText ?? null)
    if (entitySelection) {
      setActiveTab("entities")
    }
  }

  if (
    highlightedFactId !== prevHighlightedFact.factId ||
    highlightedFactSource !== prevHighlightedFact.source ||
    highlightedFactRequestKey !== prevHighlightedFact.requestKey
  ) {
    setPrevHighlightedFact({
      factId: highlightedFactId,
      source: highlightedFactSource,
      requestKey: highlightedFactRequestKey,
    })
    if (
      highlightedFactId &&
      highlightedFactSource !== "inspector" &&
      activeTab !== "facts"
    ) {
      setActiveTab("facts")
    }
  }
  const isolatedSectionId = getDocumentFilterId(sharedFilters.section)

  const { data: allFacts = EMPTY_FACTS, isLoading } = useQuery({
    queryKey: ["document-facts", documentId],
    queryFn: () => fetchDocumentFacts(documentId!),
    enabled: !!documentId,
  })

  const { data: doc } = useQuery({
    queryKey: ["document", documentId],
    queryFn: () => fetchDocumentWithSections(documentId!),
    enabled: !!documentId,
  })

  const paragraphFactCounts = useMemo(() => {
    const map = new Map<string, number>()
    for (const fact of allFacts) {
      if (fact.is_cross_chapter) continue
      for (const anchor of fact.anchors) {
        if (anchor.paragraph_id) {
          map.set(anchor.paragraph_id, (map.get(anchor.paragraph_id) ?? 0) + 1)
        }
      }
    }
    return map
  }, [allFacts])

  useEffect(() => {
    setParagraphFactCounts(paragraphFactCounts)
  }, [paragraphFactCounts, setParagraphFactCounts])

  function handleClassClick(classId: string, className: string) {
    setModule(DOCUMENT_FILTER_ALL)
    setSubjectClass(DOCUMENT_FILTER_ALL)
    setObjectClass(DOCUMENT_FILTER_ALL)
    setClass({ id: classId, name: className })
    setRelation(DOCUMENT_FILTER_ALL)
  }

  function handleModuleClick(moduleId: string, moduleName: string) {
    setModule({ id: moduleId, name: moduleName })
    setSubjectClass(DOCUMENT_FILTER_ALL)
    setObjectClass(DOCUMENT_FILTER_ALL)
    setClass(DOCUMENT_FILTER_ALL)
    setRelation(DOCUMENT_FILTER_ALL)
  }

  function handleEntityFilter(entityId: string, entityName: string) {
    setSubjectEntity(DOCUMENT_FILTER_ALL)
    setObjectEntity(DOCUMENT_FILTER_ALL)
    setEntity({
      label: entityName,
      text: entityName,
      entityId,
    })
  }

  function handleEntityClick(entityId: string) {
    setHighlightedEntityId(entityId)
    setHighlightedEntityText(null)
    setActiveTab("entities")
  }

  function handleRelationClick(relationTypeId: string, relationName: string) {
    setModule(DOCUMENT_FILTER_ALL)
    setRelation({ id: relationTypeId, name: relationName })
    setSubjectClass(DOCUMENT_FILTER_ALL)
    setObjectClass(DOCUMENT_FILTER_ALL)
    setClass(DOCUMENT_FILTER_ALL)
  }

  const activeEntityId = isAllDocumentFilterValue(sharedFilters.entity)
    ? highlightedEntityId
    : (sharedFilters.entity.entityId ?? highlightedEntityId)
  const activeEntityText = isAllDocumentFilterValue(sharedFilters.entity)
    ? highlightedEntityText
    : sharedFilters.entity.text

  if (!documentId) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 text-muted-foreground">
        <p className="text-xs">No document selected.</p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-3 p-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full rounded-md" />
        ))}
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col">
      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as ActiveTab)}
        className="flex min-h-0 flex-1 flex-col"
      >
        <TabsList
          variant="line"
          className="h-8 w-full shrink-0 justify-start gap-0 rounded-none border-b px-3"
        >
          <TabsTrigger value="facts">Facts</TabsTrigger>
          <TabsTrigger value="entities">Entities</TabsTrigger>
          <TabsTrigger value="relations">Relations</TabsTrigger>
          <TabsTrigger value="cqs">CQs</TabsTrigger>
        </TabsList>

        <TabsContent value="facts" className="mt-0 min-h-0 flex-1">
          <FactsTab
            facts={allFacts}
            documentId={documentId}
            doc={doc}
            anchorFilter={anchorFilter}
            onJumpToParagraph={jumpToParagraph}
            activeSectionId={activeSectionId}
            isolatedSectionId={isolatedSectionId}
            syncEnabled={syncEnabled}
            highlightedFactId={highlightedFactId}
            highlightedFactSource={highlightedFactSource}
            highlightedFactRequestKey={highlightedFactRequestKey}
            isActive={activeTab === "facts"}
            onEntityClick={handleEntityClick}
            onFactClick={(factId) => highlightFact(factId, "inspector")}
          />
        </TabsContent>

        <TabsContent value="entities" className="mt-0 min-h-0 flex-1">
          <EntitiesTab
            documentId={documentId}
            facts={allFacts}
            anchorFilter={anchorFilter}
            highlightedEntityId={activeEntityId}
            highlightedEntityText={activeEntityText}
            onModuleClick={handleModuleClick}
            onClassClick={handleClassClick}
            onEntityFilter={handleEntityFilter}
            onEntityDeselect={() => {
              setHighlightedEntityId(null)
              setHighlightedEntityText(null)
            }}
          />
        </TabsContent>

        <TabsContent value="relations" className="mt-0 min-h-0 flex-1">
          <RelationsTab
            facts={allFacts}
            documentId={documentId}
            anchorFilter={anchorFilter}
            onModuleClick={handleModuleClick}
            onRelationTypeClick={handleRelationClick}
            highlightedFactId={highlightedFactId}
            onFactClick={(factId) => highlightFact(factId, "inspector")}
          />
        </TabsContent>

        <TabsContent value="cqs" className="mt-0 min-h-0 flex-1">
          <CQsTab
            facts={allFacts}
            documentId={documentId}
            anchorFilter={anchorFilter}
            highlightedFactId={highlightedFactId}
            onJumpToParagraph={jumpToParagraph}
            onEntityClick={handleEntityClick}
            onFactClick={(factId) => highlightFact(factId, "inspector")}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
