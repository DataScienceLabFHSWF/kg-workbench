"use client"

import {
  DOCUMENT_STATUS_FILTERS,
  DOCUMENT_STATUS_LABELS,
  type DocumentStatusFilter,
} from "@/lib/types"
import { cn } from "@/lib/utils"
import { DOCUMENT_FILTER_ALL } from "../../utils/document-filters"

interface DocumentBrowserStatusFilterRowProps {
  statusFilter: DocumentStatusFilter
  statusCounts: Record<DocumentStatusFilter, number>
  onStatusFilterChange: (status: DocumentStatusFilter) => void
}

export function DocumentBrowserStatusFilterRow({
  statusFilter,
  statusCounts,
  onStatusFilterChange,
}: DocumentBrowserStatusFilterRowProps) {
  return (
    <div className="flex shrink-0 flex-wrap gap-1 border-b px-2 py-1.5">
      {DOCUMENT_STATUS_FILTERS.map((status) => {
        const count = statusCounts[status]
        if (count === 0 && status !== DOCUMENT_FILTER_ALL) return null

        return (
          <button
            key={status}
            onClick={() => onStatusFilterChange(status)}
            className={cn(
              "rounded-full px-2 py-0.5 text-[10px] font-medium transition-colors",
              statusFilter === status
                ? "bg-foreground text-background"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            )}
          >
            {DOCUMENT_STATUS_LABELS[status]}
            <span className="ml-1 opacity-70">{count}</span>
          </button>
        )
      })}
    </div>
  )
}
