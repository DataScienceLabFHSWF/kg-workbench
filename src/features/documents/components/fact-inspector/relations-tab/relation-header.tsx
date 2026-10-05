"use client"

import { FilterIconButton } from "@/components/shared/filter-icon-button"
import { ChevronDown, ChevronRight } from "lucide-react"

interface RelationHeaderProps {
  relationTypeId: string
  relationName: string
  factCount: number
  isCollapsed: boolean
  onToggle: (relationTypeId: string) => void
  onRelationClick: (relationTypeId: string, relationName: string) => void
}

export function RelationHeader({
  relationTypeId,
  relationName,
  factCount,
  isCollapsed,
  onToggle,
  onRelationClick,
}: RelationHeaderProps) {
  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        onClick={() => onToggle(relationTypeId)}
        className="flex items-center gap-1 py-1 text-left hover:text-foreground"
      >
        {isCollapsed ? (
          <ChevronRight className="h-3 w-3 shrink-0 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-3 w-3 shrink-0 text-muted-foreground" />
        )}
      </button>
      <div className="flex flex-1 items-center gap-1 rounded px-1 py-1 hover:bg-muted/70">
        <button
          type="button"
          onClick={() => onToggle(relationTypeId)}
          className="flex flex-1 items-center gap-1 text-left text-xs font-medium"
        >
          {relationName}
          <span className="ml-1 text-[10px] text-muted-foreground">
            ({factCount})
          </span>
        </button>
        <FilterIconButton
          onClick={(event) => {
            event.stopPropagation()
            onRelationClick(relationTypeId, relationName)
          }}
          label="Apply ontology relation filter"
          className="shrink-0 rounded p-1 text-muted-foreground/60 hover:bg-accent hover:text-foreground"
        />
      </div>
    </div>
  )
}
