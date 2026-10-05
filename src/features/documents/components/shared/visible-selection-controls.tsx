"use client"

import { CheckCheck, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import type { FactReviewStatus } from "@/lib/types"
import { cn } from "@/lib/utils"
import type { BulkAction } from "../../utils/fact-status"

interface VisibleSelectionControlsProps {
  visibleCount: number
  selectedCount: number
  allSelected: boolean
  allowedActions: Set<BulkAction>
  isBulkPending: boolean
  className?: string
  onToggleSelectAll: () => void
  onBulkReview: (status: FactReviewStatus) => Promise<void>
}

export function VisibleSelectionControls({
  visibleCount,
  selectedCount,
  allSelected,
  allowedActions,
  isBulkPending,
  className,
  onToggleSelectAll,
  onBulkReview,
}: VisibleSelectionControlsProps) {
  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      <label
        className={cn(
          "flex items-center gap-2 text-xs text-muted-foreground",
          visibleCount === 0 || isBulkPending
            ? "cursor-not-allowed opacity-50"
            : "cursor-pointer"
        )}
      >
        <input
          type="checkbox"
          checked={allSelected}
          onChange={onToggleSelectAll}
          disabled={visibleCount === 0 || isBulkPending}
          className="h-3 w-3"
        />
        <span>Select all {visibleCount} visible</span>
        <span>({selectedCount} selected)</span>
      </label>

      <Button
        size="sm"
        variant="outline"
        className="h-6 text-xs"
        onClick={() => void onBulkReview("accepted")}
        disabled={isBulkPending || !allowedActions.has("accept")}
      >
        <CheckCheck className="mr-1 h-3 w-3" />
        Accept all
      </Button>

      <Button
        size="sm"
        variant="outline"
        className="h-6 text-xs"
        onClick={() => void onBulkReview("rejected")}
        disabled={isBulkPending || !allowedActions.has("reject")}
      >
        <X className="mr-1 h-3 w-3" />
        Reject all
      </Button>
    </div>
  )
}
