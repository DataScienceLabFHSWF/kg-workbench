"use client"

import { useMemo, useState } from "react"

import { useQuery } from "@tanstack/react-query"

import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import type { EntityWithAttributes } from "@/domain/documents"
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
import { getEntityMissingRequiredAttributes } from "../../../utils/fact-completeness"
import { SectionsToolbar } from "../shared/sections-toolbar"
import { ClassSection } from "./class-section"
import { ModuleSection } from "./module-section"
import type { ClassGroup, ModuleGroup } from "./types"

const EMPTY_ENTITIES: EntityWithAttributes[] = []

interface EntitiesTabProps {
  documentId: string
  facts: FactWithAnchors[]
  anchorFilter: string | null
  highlightedEntityId?: string | null
  highlightedEntityText?: string | null
  onModuleClick?: (moduleId: string, moduleName: string) => void
  onClassClick?: (classId: string, className: string) => void
  onEntityFilter?: (entityId: string, entityName: string) => void
  onEntityDeselect?: () => void
}

export function EntitiesTab({
  documentId,
  facts,
  anchorFilter,
  highlightedEntityId,
  highlightedEntityText,
  onModuleClick,
  onClassClick,
  onEntityFilter,
  onEntityDeselect,
}: EntitiesTabProps) {
  const { sharedFilters } = useDocumentsWorkspace()
  const [collapsedModules, setCollapsedModules] = useState<Set<string>>(
    new Set()
  )
  const [collapsedClasses, setCollapsedClasses] = useState<Set<string>>(
    new Set()
  )
  const [initializedDocumentId, setInitializedDocumentId] = useState<
    string | null
  >(null)

  const { data: entities = EMPTY_ENTITIES, isLoading } = useQuery({
    queryKey: ["document-entities", documentId],
    queryFn: () => fetchDocumentEntities(documentId),
  })

  const { data: ontology } = useQuery({
    queryKey: ["document-ontology", documentId],
    queryFn: () => fetchOntologyForDocument(documentId),
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

  const visibleEntities = useMemo(() => {
    const visibleEntityIds = new Set<string>()
    for (const fact of filteredFacts) {
      if (fact.subject_entity_id) visibleEntityIds.add(fact.subject_entity_id)
      if (fact.object_entity_id) visibleEntityIds.add(fact.object_entity_id)
    }

    return entities.filter((entity) => visibleEntityIds.has(entity.id))
  }, [entities, filteredFacts])

  const { moduleGroups, unmappedEntities } = useMemo(() => {
    if (!ontology) {
      return {
        moduleGroups: [] as ModuleGroup[],
        unmappedEntities: [] as EntityWithAttributes[],
      }
    }

    const classMap = new Map(ontology.classes.map((cls) => [cls.id, cls]))
    const moduleMap = new Map(
      ontology.modules.map((module) => [module.id, module])
    )

    const entitiesByClass = new Map<string | null, EntityWithAttributes[]>()
    for (const entity of visibleEntities) {
      const existing = entitiesByClass.get(entity.class_id) ?? []
      existing.push(entity)
      entitiesByClass.set(entity.class_id, existing)
    }

    const moduleClassMap = new Map<string, ClassGroup[]>()
    const unmapped: EntityWithAttributes[] = []

    for (const [classId, classEntities] of entitiesByClass.entries()) {
      if (classId === null) {
        unmapped.push(...classEntities)
        continue
      }

      const cls = classMap.get(classId)
      const moduleId = cls?.module_id ?? NO_MODULE_FILTER_ID
      const group: ClassGroup = {
        classId,
        className: cls?.name ?? classId,
        entities: classEntities,
        missingRequiredCount: classEntities.filter(
          (entity) =>
            getEntityMissingRequiredAttributes(entity, ontology.attributes)
              .length > 0
        ).length,
      }

      const existing = moduleClassMap.get(moduleId) ?? []
      existing.push(group)
      moduleClassMap.set(moduleId, existing)
    }

    const nextModuleGroups: ModuleGroup[] = []
    for (const [moduleId, classes] of moduleClassMap.entries()) {
      const totalCount = classes.reduce(
        (sum, group) => sum + group.entities.length,
        0
      )
      const incompleteEntityCount = classes.reduce(
        (sum, group) => sum + group.missingRequiredCount,
        0
      )

      nextModuleGroups.push({
        moduleId,
        moduleName: moduleMap.get(moduleId)?.name ?? "No module",
        classes: classes.sort((a, b) => b.entities.length - a.entities.length),
        totalCount,
        incompleteEntityCount,
      })
    }

    nextModuleGroups.sort((a, b) => b.totalCount - a.totalCount)
    return { moduleGroups: nextModuleGroups, unmappedEntities: unmapped }
  }, [visibleEntities, ontology])

  function toggleModule(moduleId: string) {
    setCollapsedModules((prev) => {
      const next = new Set(prev)
      if (next.has(moduleId)) next.delete(moduleId)
      else next.add(moduleId)
      return next
    })
  }

  function toggleClass(classId: string) {
    setCollapsedClasses((prev) => {
      const next = new Set(prev)
      if (next.has(classId)) next.delete(classId)
      else next.add(classId)
      return next
    })
  }

  const allModuleIds = useMemo(
    () => moduleGroups.map((group) => group.moduleId),
    [moduleGroups]
  )
  const allClassIds = useMemo(
    () => [
      ...moduleGroups.flatMap((group) =>
        group.classes.map((classGroup) => classGroup.classId ?? "__unmapped__")
      ),
      ...(unmappedEntities.length > 0 ? ["__unmapped__"] : []),
    ],
    [moduleGroups, unmappedEntities.length]
  )

  if (!isLoading && ontology && initializedDocumentId !== documentId) {
    setCollapsedModules(new Set())
    setCollapsedClasses(new Set(allClassIds))
    setInitializedDocumentId(documentId)
  }

  function handleExpandAll() {
    setCollapsedModules(new Set())
    setCollapsedClasses(new Set())
  }

  function handleCollapseAll() {
    setCollapsedModules(new Set(allModuleIds))
    setCollapsedClasses(new Set(allClassIds))
  }

  if (isLoading) {
    return (
      <div className="space-y-2 p-3">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-16 w-full rounded-md" />
        ))}
      </div>
    )
  }

  if (entities.length === 0) {
    return (
      <p className="px-4 py-6 text-center text-xs text-muted-foreground">
        No entities found.
      </p>
    )
  }

  if (visibleEntities.length === 0) {
    return (
      <p className="px-4 py-6 text-center text-xs text-muted-foreground">
        No entities match the current filter.
      </p>
    )
  }

  return (
    <div className="flex h-full flex-col" onClick={onEntityDeselect}>
      <SectionsToolbar
        disabled={allModuleIds.length === 0 && allClassIds.length === 0}
        onExpandAll={handleExpandAll}
        onCollapseAll={handleCollapseAll}
      />

      <ScrollArea className="min-h-0 flex-1">
        <div className="py-1">
          {ontology &&
            moduleGroups.map((moduleGroup) => {
              const moduleHasMatch =
                (!!highlightedEntityText &&
                  moduleGroup.classes.some((group) =>
                    group.entities.some(
                      (entity) => entity.entity_text === highlightedEntityText
                    )
                  )) ||
                (!!highlightedEntityId &&
                  moduleGroup.classes.some((group) =>
                    group.entities.some(
                      (entity) => entity.id === highlightedEntityId
                    )
                  ))

              const isCollapsed =
                collapsedModules.has(moduleGroup.moduleId) && !moduleHasMatch

              return (
                <ModuleSection
                  key={moduleGroup.moduleId}
                  moduleGroup={moduleGroup}
                  isCollapsed={isCollapsed}
                  highlightedEntityId={highlightedEntityId}
                  documentId={documentId}
                  ontology={ontology}
                  onToggle={toggleModule}
                  onModuleClick={onModuleClick}
                  collapsedClassIds={collapsedClasses}
                  toggleClass={toggleClass}
                  highlightedEntityText={highlightedEntityText}
                  onClassClick={onClassClick}
                  onEntityFilter={onEntityFilter}
                />
              )
            })}

          {ontology && unmappedEntities.length > 0 && (
            <ClassSection
              group={{
                classId: null,
                className: "Unmapped",
                entities: unmappedEntities,
                missingRequiredCount: 0,
              }}
              isCollapsed={collapsedClasses.has("__unmapped__")}
              classes={ontology.classes}
              modules={ontology.modules}
              ontologyAttributes={ontology.attributes}
              relations={ontology.relations}
              documentId={documentId}
              highlightedEntityId={highlightedEntityId}
              highlightedEntityText={highlightedEntityText}
              onToggle={toggleClass}
              onEntityFilter={onEntityFilter}
            />
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
