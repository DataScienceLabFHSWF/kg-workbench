"use client"

import type { FactWithAnchors } from "../../../server/queries"
import type {
  DocumentConcreteFilterValue,
  DocumentEntityFilter,
  DocumentExtractedRelationFilter,
} from "../../../utils/document-filters"
import type { FactHighlightSource } from "../types"
import { cn } from "@/lib/utils"
import { FactCard } from "../../fact-card/fact-card"

interface FactRowProps {
  fact: FactWithAnchors
  documentId: string
  highlightedFactId?: string | null
  highlightedFactSource?: FactHighlightSource | null
  highlightedFactRequestKey?: number
  selectedIds: Set<string>
  onJumpToParagraph: (id: string | null) => void
  onEntityFilterChange: (
    value: DocumentConcreteFilterValue<DocumentEntityFilter>
  ) => void
  onExtractedRelationFilterChange: (
    value: DocumentConcreteFilterValue<DocumentExtractedRelationFilter>
  ) => void
  onSelectChange: (id: string, checked: boolean) => void
  onEntityClick?: (entityId: string) => void
  onFactClick?: (factId: string) => void
  itemRef: (element: HTMLDivElement | null) => void
}

export function FactRow({
  fact,
  documentId,
  highlightedFactId,
  highlightedFactSource,
  highlightedFactRequestKey = 0,
  selectedIds,
  onJumpToParagraph,
  onEntityFilterChange,
  onExtractedRelationFilterChange,
  onSelectChange,
  onEntityClick,
  onFactClick,
  itemRef,
}: FactRowProps) {
  return (
    <div
      ref={itemRef}
      className={cn(
        "flex items-start gap-1.5 rounded-md transition-all",
        highlightedFactId === fact.id && "ring-2 ring-primary ring-offset-1"
      )}
    >
      <input
        type="checkbox"
        checked={selectedIds.has(fact.id)}
        onChange={(event) => onSelectChange(fact.id, event.target.checked)}
        className="mt-3 h-3 w-3 shrink-0"
      />
      <div className="min-w-0 flex-1">
        <FactCard
          fact={fact}
          documentId={documentId}
          onAnchorClick={onJumpToParagraph}
          onEntityFilterChange={onEntityFilterChange}
          onExtractedRelationFilterChange={onExtractedRelationFilterChange}
          onEntityClick={onEntityClick}
          onGoToGraph={onFactClick}
          relationDetailsAutoExpandKey={
            highlightedFactId === fact.id &&
            highlightedFactSource === "table_relation_attributes"
              ? highlightedFactRequestKey
              : undefined
          }
        />
      </div>
    </div>
  )
}
