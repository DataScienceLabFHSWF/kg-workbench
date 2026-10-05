"use client"

import { useMemo, useState } from "react"

import { useQuery } from "@tanstack/react-query"

import { ScrollArea } from "@/components/ui/scroll-area"
import type { EffectiveStatus } from "@/lib/types"
import {
  fetchDocumentEntities,
  fetchOntologyForDocument,
} from "../../../server/queries"
import type { FactWithAnchors } from "../../../server/queries"
import { useDocumentsWorkspace } from "../../../hooks/documents-workspace-state"
import {
  filterFacts,
  NO_MODULE_FILTER_ID,
} from "../../../utils/document-filters"
import { getEffectiveStatus } from "../../../utils/fact-status"
import { SectionsToolbar } from "../shared/sections-toolbar"
import { ModuleSection } from "./module-section"
import { RelationFactList } from "./relation-fact-list"
import { RelationHeader } from "./relation-header"
import type { ModuleGroup, RelationGroup, RelationsTabProps } from "./types"
import { UNMAPPED_RELATIONS_MODULE_ID } from "./utils"

export type { RelationsTabProps } from "./types"

const EMPTY_MODULE_GROUPS: ModuleGroup[] = []
const EMPTY_FACTS: FactWithAnchors[] = []
const EMPTY_STATUSES = new Map<string, EffectiveStatus>()

export function RelationsTab({
  facts,
  documentId,
  anchorFilter,
  onModuleClick,
  onRelationTypeClick,
  highlightedFactId,
  onFactClick,
}: RelationsTabProps) {
  const { sharedFilters, setExtractedRelation } = useDocumentsWorkspace()
  const [collapsedModules, setCollapsedModules] = useState<Set<string>>(
    new Set()
  )
  const [expandedRelations, setExpandedRelations] = useState<Set<string>>(
    new Set()
  )
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

  const filteredFacts = useMemo(
    () =>
      filterFacts(facts, {
        anchorFilter,
        sharedFilters,
        ontology,
        entitiesById: new Map(entities.map((entity) => [entity.id, entity])),
      }),
    [facts, anchorFilter, entities, sharedFilters, ontology]
  )

  const { moduleGroups, unmappedFacts } = useMemo(() => {
    if (!ontology) {
      return {
        moduleGroups: EMPTY_MODULE_GROUPS,
        unmappedFacts: EMPTY_FACTS,
      }
    }

    const classMap = new Map(ontology.classes.map((c) => [c.id, c]))
    const moduleMap = new Map(ontology.modules.map((m) => [m.id, m]))
    const relationMap = new Map(ontology.relations.map((r) => [r.id, r]))

    const relationFacts = new Map<string, FactWithAnchors[]>()
    const unmapped: FactWithAnchors[] = []

    for (const fact of filteredFacts) {
      if (!fact.relation_type_id) {
        unmapped.push(fact)
        continue
      }

      const existing = relationFacts.get(fact.relation_type_id) ?? []
      existing.push(fact)
      relationFacts.set(fact.relation_type_id, existing)
    }

    const moduleRelations = new Map<string, RelationGroup[]>()

    for (const [relationTypeId, relFacts] of relationFacts.entries()) {
      const relation = relationMap.get(relationTypeId)
      if (!relation) continue

      const domainClass = classMap.get(relation.domain_class_id)
      const moduleId = domainClass?.module_id ?? NO_MODULE_FILTER_ID

      const relGroup: RelationGroup = {
        relationTypeId,
        relationName: relation.name,
        facts: relFacts,
      }

      const existing = moduleRelations.get(moduleId) ?? []
      existing.push(relGroup)
      moduleRelations.set(moduleId, existing)
    }

    const result: ModuleGroup[] = []
    for (const [moduleId, relations] of moduleRelations.entries()) {
      const totalCount = relations.reduce((sum, relation) => {
        return sum + relation.facts.length
      }, 0)

      result.push({
        moduleId,
        moduleName: moduleMap.get(moduleId)?.name ?? "No module",
        relations: relations.sort((a, b) => b.facts.length - a.facts.length),
        totalCount,
      })
    }

    result.sort((a, b) => b.totalCount - a.totalCount)

    return { moduleGroups: result, unmappedFacts: unmapped }
  }, [filteredFacts, ontology])

  const statuses = useMemo(() => {
    if (!ontology) return EMPTY_STATUSES

    const next = new Map<string, EffectiveStatus>()
    for (const fact of filteredFacts) {
      next.set(fact.id, getEffectiveStatus(fact))
    }

    return next
  }, [filteredFacts, ontology])

  function toggleModule(moduleId: string) {
    setCollapsedModules((prev) => {
      const next = new Set(prev)
      if (next.has(moduleId)) next.delete(moduleId)
      else next.add(moduleId)
      return next
    })
  }

  function toggleRelation(relationTypeId: string) {
    setExpandedRelations((prev) => {
      const next = new Set(prev)
      if (next.has(relationTypeId)) next.delete(relationTypeId)
      else next.add(relationTypeId)
      return next
    })
  }

  const allModuleIds = useMemo(
    () => [
      ...moduleGroups.map((group) => group.moduleId),
      ...(unmappedFacts.length > 0 ? [UNMAPPED_RELATIONS_MODULE_ID] : []),
    ],
    [moduleGroups, unmappedFacts.length]
  )
  const allRelationIds = useMemo(
    () =>
      moduleGroups.flatMap((group) =>
        group.relations.map((relation) => relation.relationTypeId)
      ),
    [moduleGroups]
  )

  if (ontology && initializedDocumentId !== documentId) {
    setCollapsedModules(
      new Set(unmappedFacts.length > 0 ? [UNMAPPED_RELATIONS_MODULE_ID] : [])
    )
    setExpandedRelations(new Set())
    setInitializedDocumentId(documentId)
  }

  function handleExpandAll() {
    setCollapsedModules(new Set())
    setExpandedRelations(new Set(allRelationIds))
  }

  function handleCollapseAll() {
    setCollapsedModules(new Set(allModuleIds))
    setExpandedRelations(new Set())
  }

  if (!ontology) {
    return (
      <p className="px-4 py-6 text-center text-xs text-muted-foreground">
        {"Loading ontology\u2026"}
      </p>
    )
  }

  if (moduleGroups.length === 0 && unmappedFacts.length === 0) {
    return (
      <p className="px-4 py-6 text-center text-xs text-muted-foreground">
        {facts.length === 0
          ? "No facts yet."
          : "No relations match the current filter."}
      </p>
    )
  }

  return (
    <div className="flex h-full flex-col">
      <SectionsToolbar
        disabled={allModuleIds.length === 0 && allRelationIds.length === 0}
        onExpandAll={handleExpandAll}
        onCollapseAll={handleCollapseAll}
      />

      <ScrollArea className="min-h-0 flex-1">
        <div className="py-1">
          {moduleGroups.map((moduleGroup) => {
            const isModuleCollapsed = collapsedModules.has(moduleGroup.moduleId)

            return (
              <ModuleSection
                key={moduleGroup.moduleId}
                moduleId={moduleGroup.moduleId}
                moduleName={moduleGroup.moduleName}
                totalCount={moduleGroup.totalCount}
                isCollapsed={isModuleCollapsed}
                onModuleClick={onModuleClick}
                onToggle={toggleModule}
              >
                {moduleGroup.relations.map((relation) => {
                  const isRelationCollapsed = !expandedRelations.has(
                    relation.relationTypeId
                  )

                  return (
                    <div key={relation.relationTypeId} className="pl-4">
                      <RelationHeader
                        relationTypeId={relation.relationTypeId}
                        relationName={relation.relationName}
                        factCount={relation.facts.length}
                        isCollapsed={isRelationCollapsed}
                        onToggle={toggleRelation}
                        onRelationClick={onRelationTypeClick}
                      />

                      {!isRelationCollapsed && (
                        <RelationFactList
                          facts={relation.facts}
                          statuses={statuses}
                          highlightedFactId={highlightedFactId}
                          onFactClick={onFactClick}
                          onFilter={(relationText) =>
                            setExtractedRelation({
                              label: relationText,
                              text: relationText,
                            })
                          }
                          className="mb-1 space-y-0.5 pr-3 pb-1 pl-5"
                        />
                      )}
                    </div>
                  )
                })}
              </ModuleSection>
            )
          })}

          {unmappedFacts.length > 0 && (
            <ModuleSection
              moduleId={UNMAPPED_RELATIONS_MODULE_ID}
              moduleName="Unmapped relations"
              totalCount={unmappedFacts.length}
              isCollapsed={collapsedModules.has(UNMAPPED_RELATIONS_MODULE_ID)}
              isMutedTitle
              onToggle={toggleModule}
            >
              <RelationFactList
                facts={unmappedFacts}
                highlightedFactId={highlightedFactId}
                onFactClick={onFactClick}
                onFilter={(relationText) =>
                  setExtractedRelation({
                    label: relationText,
                    text: relationText,
                  })
                }
                className="mb-1 space-y-0.5 pr-3 pb-2 pl-8"
              />
            </ModuleSection>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
