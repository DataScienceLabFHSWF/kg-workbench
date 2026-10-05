"use client"

import { FilterIconButton } from "@/components/shared/filter-icon-button"
import { cn } from "@/lib/utils"
import { FactStatusCountBadge } from "../shared/fact-status-count-badge"

interface SectionFactCounts {
  pending: number
  accepted: number
  rejected: number
  unmapped: number
  total: number
}

interface TocSectionRowProps {
  title: string
  counts: SectionFactCounts | undefined
  isDimmed: boolean
  isIsolated: boolean
  onScrollTo: () => void
  onToggleIsolation: () => void
}

export function TocSectionRow({
  title,
  counts,
  isDimmed,
  isIsolated,
  onScrollTo,
  onToggleIsolation,
}: TocSectionRowProps) {
  return (
    <li
      className={cn(
        "group flex items-start gap-1 border-b px-2 py-2 transition-opacity",
        isDimmed && "opacity-40",
        isIsolated && "border-l-2 border-l-foreground bg-muted/40"
      )}
    >
      <button
        onClick={onScrollTo}
        className="min-w-0 flex-1 text-left"
        title="Scroll to section"
      >
        <span className="line-clamp-2 text-xs leading-snug font-medium hover:underline">
          {title}
        </span>
        {counts && counts.total > 0 && (
          <div className="mt-1 flex flex-wrap gap-1">
            <FactStatusCountBadge status="unmapped" count={counts.unmapped} />
            <FactStatusCountBadge status="pending" count={counts.pending} />
            <FactStatusCountBadge status="accepted" count={counts.accepted} />
            <FactStatusCountBadge status="rejected" count={counts.rejected} />
          </div>
        )}
        {(!counts || counts.total === 0) && (
          <span className="text-[10px] text-muted-foreground">No facts</span>
        )}
      </button>

      <FilterIconButton
        onClick={onToggleIsolation}
        label={isIsolated ? "Clear section filter" : "Filter to this section"}
        className={cn(
          "h-5 w-5 shrink-0 rounded p-1 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-accent",
          isIsolated && "text-foreground opacity-100"
        )}
      />
    </li>
  )
}
