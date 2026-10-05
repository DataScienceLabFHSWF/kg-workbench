"use client"

import { FilterIconButton } from "@/components/shared/filter-icon-button"
import { Badge } from "@/components/ui/badge"
import { ChevronDown, ChevronRight } from "lucide-react"

import type { DocumentOntology } from "../../../server/queries"
import { EntityCard } from "./entity-card/entity-card"
import type { ClassGroup } from "./types"

interface ClassSectionProps {
  group: ClassGroup
  isCollapsed: boolean
  classes: DocumentOntology["classes"]
  modules: DocumentOntology["modules"]
  ontologyAttributes: DocumentOntology["attributes"]
  relations: DocumentOntology["relations"]
  documentId: string
  highlightedEntityId?: string | null
  highlightedEntityText?: string | null
  onToggle: (classId: string) => void
  onClassClick?: (classId: string, className: string) => void
  onEntityFilter?: (entityId: string, entityName: string) => void
}

export function ClassSection({
  group,
  isCollapsed,
  classes,
  modules,
  ontologyAttributes,
  relations,
  documentId,
  highlightedEntityId,
  highlightedEntityText,
  onToggle,
  onClassClick,
  onEntityFilter,
}: ClassSectionProps) {
  const classId = group.classId ?? "__unmapped__"

  const hasMatch =
    (!!highlightedEntityId &&
      group.entities.some((entity) => entity.id === highlightedEntityId)) ||
    (!!highlightedEntityText &&
      group.entities.some(
        (entity) => entity.entity_text === highlightedEntityText
      ))

  const effectivelyCollapsed = isCollapsed && !hasMatch

  return (
    <div className="pl-4">
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onToggle(classId)}
          className="flex items-center gap-1 py-1 text-left hover:text-foreground"
        >
          {effectivelyCollapsed ? (
            <ChevronRight className="h-3 w-3 shrink-0 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-3 w-3 shrink-0 text-muted-foreground" />
          )}
        </button>
        <div className="flex flex-1 items-center gap-1 rounded px-1 py-1 hover:bg-muted/70">
          <button
            type="button"
            onClick={() => onToggle(classId)}
            className="flex flex-1 items-center gap-1 text-left"
          >
            <span
              className={
                group.classId === null
                  ? "text-xs font-medium text-muted-foreground/60"
                  : "text-xs font-medium"
              }
            >
              {group.className}
            </span>
            <span className="ml-1 text-[10px] text-muted-foreground">
              ({group.entities.length})
            </span>
            {group.missingRequiredCount > 0 && (
              <Badge variant="outline" className="h-4 px-1 text-[9px]">
                {group.missingRequiredCount} incomplete
              </Badge>
            )}
          </button>
          {group.classId && onClassClick && (
            <FilterIconButton
              onClick={(event) => {
                event.stopPropagation()
                onClassClick(group.classId!, group.className)
              }}
              label="Apply class filter"
              className="shrink-0 rounded p-1 text-muted-foreground/60 hover:bg-accent hover:text-foreground"
            />
          )}
        </div>
      </div>

      {!effectivelyCollapsed && (
        <div className="mb-1 space-y-1.5 pr-3 pb-1 pl-5">
          {group.entities.map((entity) => (
            <EntityCard
              key={entity.id}
              entity={entity}
              classes={classes}
              modules={modules}
              ontologyAttributes={ontologyAttributes}
              relations={relations}
              documentId={documentId}
              highlighted={
                entity.id === highlightedEntityId ||
                entity.entity_text === highlightedEntityText
              }
              onFilter={onEntityFilter}
            />
          ))}
        </div>
      )}
    </div>
  )
}
