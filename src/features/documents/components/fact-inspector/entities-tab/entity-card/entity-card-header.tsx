"use client"

import { ClassPicker } from "@/components/shared/class-picker"
import { FilterIconButton } from "@/components/shared/filter-icon-button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { DocumentOntology } from "../../../../server/queries"
import type { EntityWithAttributes } from "@/domain/documents"

interface EntityCardHeaderProps {
  entity: EntityWithAttributes
  classes: DocumentOntology["classes"]
  modules: DocumentOntology["modules"]
  currentModuleId: string | null
  isRemapping: boolean
  missingRequiredCount: number
  onFilter?: () => void
  onClassChange: (classId: string) => Promise<void>
  onClassClear?: () => Promise<void>
}

export function EntityCardHeader({
  entity,
  classes,
  modules,
  currentModuleId,
  isRemapping,
  missingRequiredCount,
  onFilter,
  onClassChange,
  onClassClear,
}: EntityCardHeaderProps) {
  return (
    <div className="flex items-start gap-2 px-3 py-2">
      <div className="flex min-w-0 flex-1 items-start gap-1">
        {onFilter && (
          <FilterIconButton
            onClick={onFilter}
            label={`Filter by ${entity.entity_text}`}
            className="mt-0.5 shrink-0 rounded p-1 text-muted-foreground/60 hover:bg-accent hover:text-foreground"
          />
        )}
        <span className="min-w-0 flex-1 leading-5 font-medium break-words">
          {entity.entity_text}
        </span>
        {missingRequiredCount > 0 && (
          <Badge variant="outline" className="mt-0.5 shrink-0 text-[10px]">
            {missingRequiredCount} missing
          </Badge>
        )}
      </div>
      <div className="w-32 shrink-0">
        <ClassPicker
          value={entity.class_id ?? ""}
          onValueChange={onClassChange}
          onClear={entity.class_id ? onClassClear : undefined}
          allClasses={classes}
          modules={modules}
          currentModuleId={currentModuleId}
          placeholder="No class"
          disabled={isRemapping}
          className={cn(
            "h-auto w-full rounded-sm border-border/50 bg-muted/40 px-1.5 py-0.5 text-[10px]",
            isRemapping && "opacity-50"
          )}
        />
      </div>
    </div>
  )
}
