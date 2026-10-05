"use client"

import { useMemo, useState } from "react"

import type {
  OntologyDocument,
  OntologyExample,
  OntologyLanguage,
  OntologyLocalizedText,
  OntologyNote,
  OntologyRelation,
  OntologyRelationAttribute,
} from "@/domain/ontology"
import type {
  ClassPositionsByModule,
  ModuleLayoutMap,
  OntologyClassWithAttributes,
  OntologyCQWithModules,
  OntologyDocumentWithModules,
} from "@/features/ontology/server/queries"
import { ClassBrowser } from "../class-browser/class-browser"
import { ClassDetail } from "../class-detail/class-detail"
import { EmptyState } from "../shared/empty-state"
import { ModuleTabBar } from "../module-tab-bar"
import { OntologyHeader } from "../ontology-header"
import { RelationBrowser } from "../relation-browser/relation-browser"
import { RelationDetail } from "../relation-detail/relation-detail"
import type { EntityType } from "../entity-type-tabs"
import { ModuleDetail } from "../module-detail/module-detail"
import { OntologyDetailsDialog } from "../ontology-details-dialog/ontology-details-dialog"
import type { OntologyDetailsTab } from "../ontology-details-dialog/types"
import { DetailPanelShell } from "./detail-panel-shell"
import { LeftBrowserPanel } from "./left-browser-panel"
import {
  getDetailEmptyStateDescription,
  getDetailPanelTitle,
  getSelectedClass,
  getSelectedRelation,
} from "./selection"
import { VisualRegion } from "./visual-region"
import {
  filterExamples,
  filterLocalizedTexts,
  filterNotes,
} from "../shared/metadata-target"

export interface OntologyShellProps {
  documents: OntologyDocument[]
  currentDocument: OntologyDocumentWithModules
  classes: OntologyClassWithAttributes[]
  relations: OntologyRelation[]
  savedPositions: ClassPositionsByModule
  savedModuleLayouts: ModuleLayoutMap
  languages: OntologyLanguage[]
  cqs: OntologyCQWithModules[]
  ontologyLocalizedTexts: OntologyLocalizedText[]
  allLocalizedTexts: OntologyLocalizedText[]
  notes: OntologyNote[]
  examples: OntologyExample[]
  relationAttributesByRelation: Record<string, OntologyRelationAttribute[]>
}

export function OntologyShell({
  documents,
  currentDocument,
  classes,
  relations,
  savedPositions,
  savedModuleLayouts,
  languages,
  cqs,
  ontologyLocalizedTexts,
  allLocalizedTexts,
  notes,
  examples,
  relationAttributesByRelation,
}: OntologyShellProps) {
  const [activeModuleId, setActiveModuleId] = useState<string | null>(null)
  const [activeEntityType, setActiveEntityType] =
    useState<EntityType>("classes")
  const [selectedEntityId, setSelectedEntityId] = useState<string | null>(null)
  const [selectedEntityKind, setSelectedEntityKind] = useState<
    "class" | "relation" | null
  >(null)
  const [selectedModuleDetailId, setSelectedModuleDetailId] = useState<
    string | null
  >(null)
  const [isVisual, setIsVisual] = useState(false)
  const [isDetailCollapsed, setIsDetailCollapsed] = useState(false)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [detailsTab, setDetailsTab] = useState<OntologyDetailsTab>("overview")
  const [cqCreateModuleId, setCqCreateModuleId] = useState<string | null>(null)
  const [cqCreateRequestId, setCqCreateRequestId] = useState(0)
  const [cqFilterModuleId, setCqFilterModuleId] = useState<string | null>(null)
  const [cqFilterRequestId, setCqFilterRequestId] = useState(0)
  const currentModuleIds = useMemo(
    () =>
      new Set(
        currentDocument.modules.map((ontologyModule) => ontologyModule.id)
      ),
    [currentDocument.modules]
  )
  const resolvedActiveModuleId =
    activeModuleId && currentModuleIds.has(activeModuleId)
      ? activeModuleId
      : null

  const filteredClasses = useMemo(
    () =>
      resolvedActiveModuleId
        ? classes.filter((c) => c.module_id === resolvedActiveModuleId)
        : classes,
    [classes, resolvedActiveModuleId]
  )

  const filteredRelations = useMemo(() => {
    if (!resolvedActiveModuleId) return relations
    const moduleClassIds = new Set(
      classes
        .filter((c) => c.module_id === resolvedActiveModuleId)
        .map((c) => c.id)
    )
    return relations.filter(
      (r) =>
        moduleClassIds.has(r.domain_class_id) ||
        moduleClassIds.has(r.range_class_id)
    )
  }, [relations, classes, resolvedActiveModuleId])

  const classMap = useMemo(
    () => new Map(classes.map((c) => [c.id, c])),
    [classes]
  )
  const classNotes = useMemo(
    () => notes.filter((note) => note.target_class_id !== null),
    [notes]
  )
  const relationNotes = useMemo(
    () => notes.filter((note) => note.target_relation_id !== null),
    [notes]
  )
  const classExamples = useMemo(
    () => examples.filter((example) => example.target_class_id !== null),
    [examples]
  )
  const relationExamples = useMemo(
    () => examples.filter((example) => example.target_relation_id !== null),
    [examples]
  )
  const resolvedSelectedEntityId = useMemo(() => {
    if (!selectedEntityId || !selectedEntityKind) return null

    if (selectedEntityKind === "class") {
      return classMap.has(selectedEntityId) ? selectedEntityId : null
    }

    return relations.some((relation) => relation.id === selectedEntityId)
      ? selectedEntityId
      : null
  }, [classMap, relations, selectedEntityId, selectedEntityKind])
  const resolvedSelectedEntityKind = resolvedSelectedEntityId
    ? selectedEntityKind
    : null

  const selectedClass = getSelectedClass(
    resolvedSelectedEntityKind,
    resolvedSelectedEntityId,
    classMap
  )
  const selectedRelation = getSelectedRelation(
    resolvedSelectedEntityKind,
    resolvedSelectedEntityId,
    relations
  )
  const selectedModule = selectedModuleDetailId
    ? (currentDocument.modules.find(
        (ontologyModule) => ontologyModule.id === selectedModuleDetailId
      ) ?? null)
    : null
  const detailPanelTitle = getDetailPanelTitle({
    selectedClass,
    selectedRelation,
    selectedModule,
  })

  function handleSelectClass(id: string) {
    setSelectedModuleDetailId(null)
    setSelectedEntityKind("class")
    setSelectedEntityId(id)
    setIsDetailCollapsed(false)
  }

  function handleSelectRelation(id: string) {
    setSelectedModuleDetailId(null)
    setSelectedEntityKind("relation")
    setSelectedEntityId(id)
    setIsDetailCollapsed(false)
  }

  function handleSelectModuleOverview(moduleId: string) {
    if (!currentModuleIds.has(moduleId)) return
    setSelectedEntityKind(null)
    setSelectedEntityId(null)
    setSelectedModuleDetailId(moduleId)
    setIsDetailCollapsed(false)
  }

  function handleNavigateToRelation(relationId: string) {
    if (isVisual) {
      handleSelectRelation(relationId)
    } else {
      setActiveEntityType("relations")
      handleSelectRelation(relationId)
    }
  }

  function handleModuleCreated(moduleId: string) {
    setActiveModuleId(moduleId)
  }

  function handleClassCreated(classId: string) {
    if (!isVisual) setActiveEntityType("classes")
    handleSelectClass(classId)
  }

  function handleRelationCreated(relationId: string) {
    if (!isVisual) setActiveEntityType("relations")
    handleSelectRelation(relationId)
  }

  function handleTypeChange(type: EntityType) {
    setActiveEntityType(type)
    setSelectedEntityId(null)
    setSelectedEntityKind(null)
    setSelectedModuleDetailId(null)
  }

  function openOntologyDetails(tab: OntologyDetailsTab = "overview") {
    setDetailsTab(tab)
    setCqCreateModuleId(null)
    setCqFilterModuleId(null)
    setCqFilterRequestId((requestId) => requestId + 1)
    setDetailsOpen(true)
  }

  function openCQEditorForModule(moduleId: string) {
    setDetailsTab("competency-questions")
    setCqCreateModuleId(moduleId)
    setCqCreateRequestId((requestId) => requestId + 1)
    setCqFilterModuleId(null)
    setDetailsOpen(true)
  }

  function openCQManagerForModule(moduleId: string) {
    setDetailsTab("competency-questions")
    setCqCreateModuleId(null)
    setCqFilterModuleId(moduleId)
    setCqFilterRequestId((requestId) => requestId + 1)
    setDetailsOpen(true)
  }

  const classTarget = selectedClass
    ? ({ type: "class", id: selectedClass.id } as const)
    : null
  const relationTarget = selectedRelation
    ? ({ type: "relation", id: selectedRelation.id } as const)
    : null

  const detailContent =
    selectedClass && classTarget ? (
      <ClassDetail
        cls={selectedClass}
        modules={currentDocument.modules}
        allClasses={classes}
        relations={relations}
        onNavigateToRelation={handleNavigateToRelation}
        ontologyId={currentDocument.id}
        languages={languages}
        defaultLanguage={currentDocument.default_language}
        localizedTexts={filterLocalizedTexts(allLocalizedTexts, classTarget)}
        notes={filterNotes(notes, classTarget)}
        examples={filterExamples(examples, classTarget)}
        attributeMetadata={{
          localizedTexts: allLocalizedTexts,
          notes,
          examples,
          languages,
          defaultLanguage: currentDocument.default_language,
        }}
      />
    ) : selectedRelation && relationTarget ? (
      <RelationDetail
        relation={selectedRelation}
        allClasses={classes}
        modules={currentDocument.modules}
        currentModuleId={resolvedActiveModuleId}
        ontologyId={currentDocument.id}
        languages={languages}
        defaultLanguage={currentDocument.default_language}
        localizedTexts={filterLocalizedTexts(allLocalizedTexts, relationTarget)}
        notes={filterNotes(notes, relationTarget)}
        examples={filterExamples(examples, relationTarget)}
        relationAttributes={
          relationAttributesByRelation[selectedRelation.id] ?? []
        }
        attributeMetadata={{
          localizedTexts: allLocalizedTexts,
          notes,
          examples,
          languages,
          defaultLanguage: currentDocument.default_language,
        }}
      />
    ) : selectedModule ? (
      <ModuleDetail
        module={selectedModule}
        ontologyId={currentDocument.id}
        defaultLanguage={currentDocument.default_language}
        languages={languages}
        localizedTexts={allLocalizedTexts}
        notes={notes}
        cqs={cqs}
        classes={classes}
        relations={relations}
        examples={examples}
        onAddCQ={openCQEditorForModule}
        onManageCQs={openCQManagerForModule}
      />
    ) : (
      <EmptyState
        title="No item selected"
        description={getDetailEmptyStateDescription(isVisual)}
      />
    )

  return (
    <div className="flex h-screen flex-col">
      <OntologyHeader
        documents={documents}
        currentDocument={currentDocument}
        classes={classes}
        relations={relations}
        languages={languages}
        localizedTexts={allLocalizedTexts}
        isVisual={isVisual}
        onVisualToggle={setIsVisual}
        onOpenOntologyDetails={() => openOntologyDetails("overview")}
      />
      <ModuleTabBar
        modules={currentDocument.modules}
        classes={classes}
        relations={relations}
        languages={languages}
        defaultLanguage={currentDocument.default_language}
        activeModuleId={resolvedActiveModuleId}
        onModuleChange={setActiveModuleId}
        onModuleOverview={handleSelectModuleOverview}
        ontologyId={currentDocument.id}
        onModuleCreated={handleModuleCreated}
      />

      <div className="flex min-h-0 flex-1">
        {!isVisual && (
          <LeftBrowserPanel
            activeType={activeEntityType}
            onTypeChange={handleTypeChange}
            classCount={filteredClasses.length}
            relationCount={filteredRelations.length}
            classBrowser={
              <ClassBrowser
                classes={filteredClasses}
                relations={filteredRelations}
                modules={currentDocument.modules}
                notes={classNotes}
                examples={classExamples}
                ontologyId={currentDocument.id}
                languages={languages}
                defaultLanguage={currentDocument.default_language}
                activeModuleId={resolvedActiveModuleId}
                selectedId={resolvedSelectedEntityId}
                onSelect={handleSelectClass}
                onCreated={handleClassCreated}
              />
            }
            relationBrowser={
              <RelationBrowser
                relations={filteredRelations}
                relationAttributesByRelation={relationAttributesByRelation}
                classMap={classMap}
                notes={relationNotes}
                examples={relationExamples}
                ontologyId={currentDocument.id}
                allClasses={classes}
                modules={currentDocument.modules}
                languages={languages}
                defaultLanguage={currentDocument.default_language}
                currentModuleId={resolvedActiveModuleId}
                selectedId={resolvedSelectedEntityId}
                onSelect={handleSelectRelation}
                onCreated={handleRelationCreated}
              />
            }
          />
        )}

        {isVisual && (
          <VisualRegion
            ontologyId={currentDocument.id}
            classes={classes}
            relations={relations}
            examples={examples}
            notes={notes}
            modules={currentDocument.modules}
            languages={languages}
            defaultLanguage={currentDocument.default_language}
            activeModuleId={resolvedActiveModuleId}
            selectedEntityId={resolvedSelectedEntityId}
            savedPositions={savedPositions}
            savedModuleLayouts={savedModuleLayouts}
            onSelectClass={handleSelectClass}
            onSelectRelation={handleSelectRelation}
            onSelectModule={handleSelectModuleOverview}
            onClassCreated={handleClassCreated}
            onRelationCreated={handleRelationCreated}
          />
        )}

        <DetailPanelShell
          title={detailPanelTitle}
          isVisual={isVisual}
          isCollapsed={isVisual && isDetailCollapsed}
          onCollapse={() => setIsDetailCollapsed(true)}
          onExpand={() => setIsDetailCollapsed(false)}
        >
          {detailContent}
        </DetailPanelShell>
      </div>

      <OntologyDetailsDialog
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        activeTab={detailsTab}
        onActiveTabChange={setDetailsTab}
        ontology={currentDocument}
        classes={classes}
        relations={relations}
        languages={languages}
        cqs={cqs}
        examples={examples}
        ontologyLocalizedTexts={ontologyLocalizedTexts}
        ontologyNotes={filterNotes(notes, {
          type: "ontology",
          id: currentDocument.id,
        })}
        cqCreateModuleId={cqCreateModuleId}
        cqCreateRequestId={cqCreateRequestId}
        cqFilterModuleId={cqFilterModuleId}
        cqFilterRequestId={cqFilterRequestId}
      />
    </div>
  )
}
