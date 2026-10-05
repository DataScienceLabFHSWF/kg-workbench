"use client"

import { useMemo, useState } from "react"

import { useQuery } from "@tanstack/react-query"

import { ScrollArea } from "@/components/ui/scroll-area"
import {
  EFFECTIVE_STATUSES,
  EFFECTIVE_STATUS_LABELS,
  type EffectiveStatus,
} from "@/lib/types"
import { cn } from "@/lib/utils"
import {
  fetchDocumentFacts,
  fetchDocumentWithSections,
} from "../../server/queries"
import { getEffectiveStatus } from "../../utils/fact-status"
import { TocSectionRow } from "./toc-section-row"

interface TableOfContentsProps {
  documentId: string
  onScrollToSection: (sectionId: string) => void
  onIsolationToggle: (sectionId: string | null) => void
  isolatedSectionId: string | null
}

type SectionFactCounts = {
  pending: number
  accepted: number
  rejected: number
  unmapped: number
  total: number
}

type TocStatusFilter = "all" | EffectiveStatus

const STATUS_FILTERS: { value: TocStatusFilter; label: string }[] = [
  { value: "all", label: "All" },
  ...EFFECTIVE_STATUSES.map((status) => ({
    value: status,
    label: EFFECTIVE_STATUS_LABELS[status],
  })),
]

export function TableOfContents({
  documentId,
  onScrollToSection,
  onIsolationToggle,
  isolatedSectionId,
}: TableOfContentsProps) {
  const [statusFilter, setStatusFilter] = useState<TocStatusFilter>("all")

  const { data: doc } = useQuery({
    queryKey: ["document", documentId],
    queryFn: () => fetchDocumentWithSections(documentId),
  })

  const { data: allFacts } = useQuery({
    queryKey: ["document-facts", documentId],
    queryFn: () => fetchDocumentFacts(documentId),
  })

  const sectionFactCounts = useMemo(() => {
    const map = new Map<string, SectionFactCounts>()
    if (!allFacts) return map

    for (const fact of allFacts) {
      const sectionId = fact.anchors.find((a) => a.section_id)?.section_id
      if (!sectionId) continue

      const existing = map.get(sectionId) ?? {
        pending: 0,
        accepted: 0,
        rejected: 0,
        unmapped: 0,
        total: 0,
      }
      const status = getEffectiveStatus(fact)
      existing[status]++
      existing.total++
      map.set(sectionId, existing)
    }
    return map
  }, [allFacts])

  const matchingSectionIds = useMemo(() => {
    if (statusFilter === "all") return null
    const ids = new Set<string>()
    sectionFactCounts.forEach((counts, sectionId) => {
      if (counts[statusFilter] > 0) ids.add(sectionId)
    })
    return ids
  }, [statusFilter, sectionFactCounts])

  const totalsByStatus = useMemo(() => {
    const totals = { pending: 0, accepted: 0, rejected: 0, unmapped: 0 }
    sectionFactCounts.forEach((counts) => {
      totals.pending += counts.pending
      totals.accepted += counts.accepted
      totals.rejected += counts.rejected
      totals.unmapped += counts.unmapped
    })
    return totals
  }, [sectionFactCounts])

  const sections = doc?.sections ?? []

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* Status filter row */}
      <div className="flex shrink-0 flex-wrap gap-1 border-b px-2 py-1.5">
        {STATUS_FILTERS.map(({ value, label }) => {
          const count =
            value === "all"
              ? sections.length
              : (totalsByStatus[value as EffectiveStatus] ?? 0)
          return (
            <button
              key={value}
              onClick={() => setStatusFilter(value)}
              className={cn(
                "rounded-full px-2 py-0.5 text-[10px] font-medium transition-colors",
                statusFilter === value
                  ? "bg-foreground text-background"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              )}
            >
              {label}
              {count > 0 && <span className="ml-1 opacity-70">{count}</span>}
            </button>
          )
        })}
      </div>

      <ScrollArea className="min-h-0 flex-1">
        {sections.length === 0 ? (
          <p className="px-4 py-6 text-center text-xs text-muted-foreground">
            No sections found.
          </p>
        ) : (
          <ul>
            {sections.map((section) => {
              const counts = sectionFactCounts.get(section.id)
              const isDimmed =
                matchingSectionIds !== null &&
                !matchingSectionIds.has(section.id)
              const isIsolated = isolatedSectionId === section.id

              return (
                <TocSectionRow
                  key={section.id}
                  title={section.title}
                  counts={counts}
                  isDimmed={isDimmed}
                  isIsolated={isIsolated}
                  onScrollTo={() => onScrollToSection(section.id)}
                  onToggleIsolation={() =>
                    onIsolationToggle(isIsolated ? null : section.id)
                  }
                />
              )
            })}
          </ul>
        )}
      </ScrollArea>
    </div>
  )
}
