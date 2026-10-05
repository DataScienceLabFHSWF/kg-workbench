"use client"

import { FilterIconButton } from "@/components/shared/filter-icon-button"
import { ChevronDown, ChevronRight } from "lucide-react"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import type {
  DocumentConcreteFilterValue,
  DocumentEntityFilter,
  DocumentExtractedRelationFilter,
  FactSectionGroup,
} from "../../../utils/document-filters"
import type { FactHighlightSource } from "../types"
import { FactRow } from "./fact-row"

interface FactSectionProps {
  group: FactSectionGroup
  open: boolean
  documentId: string
  highlightedFactId?: string | null
  highlightedFactSource?: FactHighlightSource | null
  highlightedFactRequestKey?: number
  selectedIds: Set<string>
  onOpenChange: (open: boolean) => void
  onSectionFilterChange: (sectionId: string | null) => void
  onJumpToParagraph: (id: string | null) => void
  onEntityFilterChange: (
    value: DocumentConcreteFilterValue<DocumentEntityFilter>
  ) => void
  onExtractedRelationFilterChange: (
    value: DocumentConcreteFilterValue<DocumentExtractedRelationFilter>
  ) => void
  onEntityClick?: (entityId: string) => void
  onFactClick?: (factId: string) => void
  onSelectChange: (id: string, checked: boolean) => void
  onSectionRef: (sectionId: string, element: HTMLDivElement | null) => void
  onFactRef: (factId: string, element: HTMLDivElement | null) => void
}

export function FactSection({
  group,
  open,
  documentId,
  highlightedFactId,
  highlightedFactSource,
  highlightedFactRequestKey = 0,
  selectedIds,
  onOpenChange,
  onSectionFilterChange,
  onJumpToParagraph,
  onEntityFilterChange,
  onExtractedRelationFilterChange,
  onEntityClick,
  onFactClick,
  onSelectChange,
  onSectionRef,
  onFactRef,
}: FactSectionProps) {
  return (
    <Collapsible open={open} onOpenChange={onOpenChange}>
      <div ref={(element) => onSectionRef(group.sectionId, element)}>
        {group.sectionTitle && (
          <CollapsibleTrigger className="sticky top-0 z-10 flex w-full items-center gap-2 border-b bg-background/95 px-3 py-1 text-left backdrop-blur hover:bg-muted/60">
            {open ? (
              <ChevronDown className="h-3 w-3 shrink-0 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-3 w-3 shrink-0 text-muted-foreground" />
            )}
            <span className="text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">
              {group.sectionTitle}
            </span>
            <span className="text-[10px] font-normal text-muted-foreground">
              ({group.facts.length})
            </span>
            <FilterIconButton
              onClick={(event) => {
                event.stopPropagation()
                onSectionFilterChange(group.sectionId)
              }}
              label={`Filter to section ${group.sectionTitle}`}
              className="ml-auto shrink-0 rounded p-1 text-muted-foreground/60 hover:bg-accent hover:text-foreground"
            />
          </CollapsibleTrigger>
        )}
        <CollapsibleContent>
          <div className="space-y-2 p-3">
            {group.facts.map((fact) => (
              <FactRow
                key={fact.id}
                fact={fact}
                documentId={documentId}
                highlightedFactId={highlightedFactId}
                highlightedFactSource={highlightedFactSource}
                highlightedFactRequestKey={highlightedFactRequestKey}
                selectedIds={selectedIds}
                onJumpToParagraph={onJumpToParagraph}
                onEntityFilterChange={onEntityFilterChange}
                onExtractedRelationFilterChange={
                  onExtractedRelationFilterChange
                }
                onEntityClick={onEntityClick}
                onFactClick={onFactClick}
                onSelectChange={onSelectChange}
                itemRef={(element) => onFactRef(fact.id, element)}
              />
            ))}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  )
}
