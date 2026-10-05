"use client"

import { Switch } from "@/components/ui/switch"
import type { FactReviewStatus } from "@/lib/types"
import { VisibleSelectionControls } from "../shared/visible-selection-controls"
import { ExpandCollapseAll } from "../fact-inspector/shared/expand-collapse-all"
import { TabToolbar } from "../fact-inspector/shared/tab-toolbar"
import type { BulkAction } from "../../utils/fact-status"

interface FactTableToolbarProps {
  allVisibleSelected: boolean
  allowedActions: Set<BulkAction>
  groupBySection: boolean
  isBulkPending: boolean
  selectedCount: number
  visibleCount: number
  onBulkReview: (status: FactReviewStatus) => Promise<void>
  onToggleSelectAll: () => void
  onGroupBySectionChange: (value: boolean) => void
  onExpandAll: () => void
  onCollapseAll: () => void
}

export function FactTableToolbar({
  allVisibleSelected,
  allowedActions,
  groupBySection,
  isBulkPending,
  selectedCount,
  visibleCount,
  onBulkReview,
  onToggleSelectAll,
  onGroupBySectionChange,
  onExpandAll,
  onCollapseAll,
}: FactTableToolbarProps) {
  return (
    <TabToolbar>
      <div className="flex items-center justify-between gap-3">
        <VisibleSelectionControls
          allSelected={allVisibleSelected}
          allowedActions={allowedActions}
          isBulkPending={isBulkPending}
          selectedCount={selectedCount}
          visibleCount={visibleCount}
          onToggleSelectAll={onToggleSelectAll}
          onBulkReview={onBulkReview}
        />
        <div className="ml-auto flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Switch
              checked={groupBySection}
              onCheckedChange={onGroupBySectionChange}
              aria-label="Group by section"
              size="sm"
            />
            <span className="text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">
              Group by section
            </span>
          </div>
          {groupBySection && (
            <ExpandCollapseAll
              onExpandAll={onExpandAll}
              onCollapseAll={onCollapseAll}
            />
          )}
        </div>
      </div>
    </TabToolbar>
  )
}
