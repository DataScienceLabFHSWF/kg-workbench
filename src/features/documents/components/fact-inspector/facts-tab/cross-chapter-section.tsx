"use client"

import { FilterIconButton } from "@/components/shared/filter-icon-button"
import { ChevronDown, ChevronRight } from "lucide-react"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { cn } from "@/lib/utils"
import type { FactWithAnchors } from "../../../server/queries"
import type {
  DocumentConcreteFilterValue,
  DocumentEntityFilter,
  DocumentExtractedRelationFilter,
} from "../../../utils/document-filters"
import type { FactHighlightSource } from "../types"
import { FactRow } from "./fact-row"

interface CrossChapterSectionProps {
  facts: FactWithAnchors[]
  totalFactsCount: number
  open: boolean
  documentId: string
  highlightedFactId?: string | null
  highlightedFactSource?: FactHighlightSource | null
  highlightedFactRequestKey?: number
  selectedIds: Set<string>
  onOpenChange: (open: boolean) => void
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
  onFactRef: (factId: string, element: HTMLDivElement | null) => void
  onCrossChapterFilterChange: () => void
}

export function CrossChapterSection({
  facts,
  totalFactsCount,
  open,
  documentId,
  highlightedFactId,
  highlightedFactSource,
  highlightedFactRequestKey = 0,
  selectedIds,
  onOpenChange,
  onJumpToParagraph,
  onEntityFilterChange,
  onExtractedRelationFilterChange,
  onEntityClick,
  onFactClick,
  onSelectChange,
  onFactRef,
  onCrossChapterFilterChange,
}: CrossChapterSectionProps) {
  return (
    <Collapsible
      open={open && totalFactsCount > 0}
      onOpenChange={(nextOpen) => {
        if (totalFactsCount > 0) onOpenChange(nextOpen)
      }}
    >
      <CollapsibleTrigger
        disabled={totalFactsCount === 0}
        className={cn(
          "flex w-full items-center gap-2 border-t px-3 py-2 text-left",
          totalFactsCount === 0
            ? "cursor-default opacity-40"
            : "hover:bg-muted/50"
        )}
      >
        {totalFactsCount > 0 ? (
          open ? (
            <ChevronDown className="h-3 w-3 shrink-0 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-3 w-3 shrink-0 text-muted-foreground" />
          )
        ) : (
          <ChevronRight className="h-3 w-3 shrink-0 text-muted-foreground" />
        )}
        <span className="text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">
          Cross-chapter
        </span>
        {totalFactsCount > 0 && (
          <span className="text-[10px] font-normal text-muted-foreground">
            ({facts.length})
          </span>
        )}
        <FilterIconButton
          onClick={(event) => {
            event.stopPropagation()
            onCrossChapterFilterChange()
          }}
          label="Filter to cross-chapter facts"
          className="ml-auto shrink-0 rounded p-1 text-muted-foreground/60 hover:bg-accent hover:text-foreground"
        />
      </CollapsibleTrigger>
      <CollapsibleContent>
        {facts.length === 0 ? (
          <p className="px-4 py-4 text-center text-xs text-muted-foreground">
            No facts match the current filter.
          </p>
        ) : (
          <div className="space-y-2 p-3">
            {facts.map((fact) => (
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
        )}
      </CollapsibleContent>
    </Collapsible>
  )
}
