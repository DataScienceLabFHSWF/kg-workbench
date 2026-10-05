"use client"

import { useMemo } from "react"

import type { OntologyRelation } from "@/domain/ontology"
import type { OntologyClassWithAttributes } from "@/features/ontology/server/queries"

import { DroppedParentLinkCard } from "./dropped-parent-link-card"
import { ExcludedRelationCard } from "./excluded-relation-card"
import { ExportModuleGroupCard } from "../shared/export-module-group-card"
import { NO_MODULE_GROUP_KEY, sortModuleGroups } from "../export-utils"

interface ExcludedRelationsPanelProps {
  excludedRelations: OntologyRelation[]
  droppedParents: Array<{
    child: OntologyClassWithAttributes
    parent: OntologyClassWithAttributes
  }>
  classById: Map<string, OntologyClassWithAttributes>
  selectedClassIds: Set<string>
  getModuleLabel: (moduleId: string | null) => string
  onRestoreRelation: (relationId: string) => void
  onRestoreParent: (childId: string) => void
}

interface ExcludedRelationGroup {
  moduleId: string | null
  moduleLabel: string
  relations: OntologyRelation[]
  droppedParents: Array<{
    child: OntologyClassWithAttributes
    parent: OntologyClassWithAttributes
  }>
}

export function ExcludedRelationsPanel({
  excludedRelations,
  droppedParents,
  classById,
  selectedClassIds,
  getModuleLabel,
  onRestoreRelation,
  onRestoreParent,
}: ExcludedRelationsPanelProps) {
  const groups = useMemo(() => {
    const groupsByModule = new Map<string, ExcludedRelationGroup>()

    function getGroup(moduleId: string | null) {
      const key = moduleId ?? NO_MODULE_GROUP_KEY
      const existing = groupsByModule.get(key)
      if (existing) return existing

      const nextGroup: ExcludedRelationGroup = {
        moduleId,
        moduleLabel: getModuleLabel(moduleId),
        relations: [],
        droppedParents: [],
      }
      groupsByModule.set(key, nextGroup)
      return nextGroup
    }

    for (const relation of excludedRelations) {
      const domainClass = classById.get(relation.domain_class_id)
      const rangeClass = classById.get(relation.range_class_id)
      const domainSelected = domainClass
        ? selectedClassIds.has(domainClass.id)
        : false
      const rangeSelected = rangeClass
        ? selectedClassIds.has(rangeClass.id)
        : false

      const moduleId =
        domainSelected && !rangeSelected
          ? (rangeClass?.module_id ?? null)
          : rangeSelected && !domainSelected
            ? (domainClass?.module_id ?? null)
            : (domainClass?.module_id ?? rangeClass?.module_id ?? null)

      getGroup(moduleId).relations.push(relation)
    }

    for (const droppedParent of droppedParents) {
      getGroup(droppedParent.parent.module_id).droppedParents.push(
        droppedParent
      )
    }

    return sortModuleGroups(Array.from(groupsByModule.values()))
  }, [
    classById,
    droppedParents,
    excludedRelations,
    getModuleLabel,
    selectedClassIds,
  ])

  return (
    <section className="flex min-h-0 flex-col space-y-3">
      <div>
        <p className="font-medium">Excluded relations</p>
        <p className="text-muted-foreground">
          {excludedRelations.length} relations, {droppedParents.length} parent
          links
        </p>
      </div>

      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto rounded-md border p-3">
        {groups.map((group) => {
          const relationDescription = `${group.relations.length} ${
            group.relations.length === 1 ? "relation" : "relations"
          }`
          const description =
            group.droppedParents.length === 0
              ? relationDescription
              : `${relationDescription}, ${group.droppedParents.length} ${
                  group.droppedParents.length === 1
                    ? "parent link"
                    : "parent links"
                }`

          return (
            <ExportModuleGroupCard
              key={group.moduleId ?? NO_MODULE_GROUP_KEY}
              title={group.moduleLabel}
              description={description}
              defaultOpen
            >
              {group.relations.map((relation) => (
                <ExcludedRelationCard
                  key={relation.id}
                  relation={relation}
                  domainClass={classById.get(relation.domain_class_id)}
                  rangeClass={classById.get(relation.range_class_id)}
                  groupModuleId={group.moduleId}
                  getModuleLabel={getModuleLabel}
                  onRestoreRelation={onRestoreRelation}
                />
              ))}

              {group.droppedParents.length > 0 ? (
                <div className="space-y-2">
                  <p className="font-medium">Dropped parent links</p>
                  {group.droppedParents.map(({ child, parent }) => (
                    <DroppedParentLinkCard
                      key={child.id}
                      child={child}
                      parent={parent}
                      onRestoreParent={onRestoreParent}
                    />
                  ))}
                </div>
              ) : null}
            </ExportModuleGroupCard>
          )
        })}

        {groups.length === 0 ? (
          <p className="text-muted-foreground">No relations excluded.</p>
        ) : null}
      </div>
    </section>
  )
}
