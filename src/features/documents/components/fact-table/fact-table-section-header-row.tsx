"use client"

import { useMemo } from "react"
import { ChevronDown, ChevronRight } from "lucide-react"

import { FilterIconButton } from "@/components/shared/filter-icon-button"
import type { EffectiveStatus } from "@/lib/types"
import { getEffectiveStatus } from "../../utils/fact-status"
import type { FactSectionGroup } from "../../utils/document-filters"
import { FactStatusCountBadge } from "../shared/fact-status-count-badge"

const ALL_STATUSES: EffectiveStatus[] = [
  "accepted",
  "pending",
  "rejected",
  "unmapped",
]

interface FactTableSectionHeaderRowProps {
  group: FactSectionGroup
  open: boolean
  onOpenChange: (open: boolean) => void
  onSectionFilterChange: (
    sectionId: string,
    sectionTitle: string | null
  ) => void
  onCrossChapterFilterChange: () => void
}

export function FactTableSectionHeaderRow({
  group,
  open,
  onOpenChange,
  onSectionFilterChange,
  onCrossChapterFilterChange,
}: FactTableSectionHeaderRowProps) {
  const statusCounts = useMemo(() => {
    const counts: Record<EffectiveStatus, number> = {
      accepted: 0,
      pending: 0,
      rejected: 0,
      unmapped: 0,
    }
    for (const fact of group.facts) {
      counts[getEffectiveStatus(fact)]++
    }
    return counts
  }, [group.facts])

  return (
    <tr className="border-y">
      <td
        colSpan={6}
        className="sticky top-7 z-20 cursor-pointer bg-background/95 px-0 py-0 backdrop-blur supports-[backdrop-filter]:bg-background/80"
        onClick={() => onOpenChange(!open)}
      >
        <div className="flex items-center gap-2 bg-muted/30 px-2 py-1.5 transition-colors hover:bg-muted/50">
          {open ? (
            <ChevronDown className="h-3 w-3 shrink-0 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-3 w-3 shrink-0 text-muted-foreground" />
          )}
          <span className="text-[11px] font-medium">{group.sectionTitle}</span>
          <span className="text-[10px] text-muted-foreground">
            ({group.facts.length})
          </span>
          <div className="ml-1 flex items-center gap-1">
            {ALL_STATUSES.map((status) =>
              statusCounts[status] > 0 ? (
                <FactStatusCountBadge
                  key={status}
                  status={status}
                  count={statusCounts[status]}
                />
              ) : null
            )}
          </div>
          <FilterIconButton
            onClick={(event) => {
              event.stopPropagation()
              if (group.filterKind === "cross_chapter") {
                onCrossChapterFilterChange()
                return
              }

              onSectionFilterChange(group.sectionId, group.sectionTitle)
            }}
            label={
              group.filterKind === "cross_chapter"
                ? "Filter to cross-chapter facts"
                : `Filter to section ${group.sectionTitle}`
            }
            className="ml-auto h-5 w-5 shrink-0 rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
          />
        </div>
      </td>
    </tr>
  )
}
