"use client"

import { FilterIconButton } from "@/components/shared/filter-icon-button"
import { getReviewStatusStyles } from "@/lib/colors"
import { EFFECTIVE_STATUS_LABELS, type EffectiveStatus } from "@/lib/types"
import { cn } from "@/lib/utils"
import type { FactWithAnchors } from "../../../server/queries"

interface RelationFactRowProps {
  fact: FactWithAnchors
  status?: EffectiveStatus
  highlighted?: boolean
  onClick?: (factId: string) => void
  onFilter?: (relationText: string) => void
}

export function RelationFactRow({
  fact,
  status,
  highlighted = false,
  onClick,
  onFilter,
}: RelationFactRowProps) {
  return (
    <div
      className={cn(
        "flex items-start gap-1 rounded px-1 py-0.5 text-[10px]",
        status ? "hover:bg-muted/30" : "text-muted-foreground/70",
        highlighted && "bg-muted ring-1 ring-primary/40"
      )}
    >
      <button
        type="button"
        onClick={onClick ? () => onClick(fact.id) : undefined}
        className="min-w-0 flex-1 text-left"
      >
        <p className="leading-relaxed break-words">
          <span className="font-medium">{fact.subject_text}</span>
          <span className="text-muted-foreground">{" \u2192 "}</span>
          <span className="text-muted-foreground italic">
            {fact.relation_text}
          </span>
          <span className="text-muted-foreground">{" \u2192 "}</span>
          <span className="font-medium">{fact.object_text}</span>
        </p>
        {status && (
          <span
            className={cn(
              "mt-0.5 inline-block rounded-full px-1.5 py-0.5 text-[9px] font-medium",
              getReviewStatusStyles(status).pillClass
            )}
          >
            {EFFECTIVE_STATUS_LABELS[status]}
          </span>
        )}
      </button>
      {onFilter && (
        <FilterIconButton
          onClick={(event) => {
            event.stopPropagation()
            onFilter(fact.relation_text)
          }}
          label={`Filter by ${fact.relation_text}`}
          className="mt-0.5 shrink-0 rounded p-1 text-muted-foreground/60 hover:bg-accent hover:text-foreground"
        />
      )}
    </div>
  )
}
