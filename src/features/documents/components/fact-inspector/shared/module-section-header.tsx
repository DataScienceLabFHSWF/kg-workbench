"use client"

import { FilterIconButton } from "@/components/shared/filter-icon-button"
import { cn } from "@/lib/utils"
import { ChevronDown, ChevronRight } from "lucide-react"

interface ModuleSectionHeaderProps {
  moduleId: string
  moduleName: string
  totalCount: number
  isCollapsed: boolean
  isMutedTitle?: boolean
  onToggle: (moduleId: string) => void
  onModuleClick?: (moduleId: string, moduleName: string) => void
}

export function ModuleSectionHeader({
  moduleId,
  moduleName,
  totalCount,
  isCollapsed,
  isMutedTitle = false,
  onToggle,
  onModuleClick,
}: ModuleSectionHeaderProps) {
  return (
    <div className="flex items-center py-1.5 pr-1 pl-3 hover:bg-muted/50">
      <button
        type="button"
        onClick={() => onToggle(moduleId)}
        className="flex min-w-0 flex-1 items-center gap-1 text-left"
      >
        {isCollapsed ? (
          <ChevronRight className="h-3 w-3 shrink-0 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-3 w-3 shrink-0 text-muted-foreground" />
        )}
        <span
          className={cn(
            "truncate text-[10px] font-semibold tracking-wide uppercase",
            isMutedTitle ? "text-muted-foreground/60" : "text-muted-foreground"
          )}
        >
          {moduleName}
        </span>
        <span className="ml-1 text-[10px] text-muted-foreground">
          ({totalCount})
        </span>
      </button>

      {onModuleClick && (
        <div className="ml-auto pl-1">
          <FilterIconButton
            onClick={(event) => {
              event.stopPropagation()
              onModuleClick(moduleId, moduleName)
            }}
            label="Apply module filter"
            className="shrink-0 rounded p-1 text-muted-foreground/60 hover:bg-accent hover:text-foreground"
          />
        </div>
      )}
    </div>
  )
}
