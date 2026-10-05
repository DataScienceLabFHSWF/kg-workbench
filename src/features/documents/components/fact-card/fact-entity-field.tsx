"use client"

import { FilterIconButton } from "@/components/shared/filter-icon-button"
import { GoToIconButton } from "@/components/shared/go-to-icon-button"
import { InlineEditText } from "./inline-edit-text"

interface FactEntityFieldProps {
  value: string
  disabled: boolean
  className?: string
  entityId: string | null
  onFilter?: () => void
  onEntityClick?: (entityId: string) => void
  onSave: (value: string) => Promise<void>
}

export function FactEntityField({
  value,
  disabled,
  className,
  entityId,
  onFilter,
  onEntityClick,
  onSave,
}: FactEntityFieldProps) {
  return (
    <div className="relative pr-8">
      <InlineEditText
        value={value}
        disabled={disabled}
        onSave={onSave}
        className={className}
      />
      <div className="absolute top-0 right-0 flex items-center gap-0.5">
        {onFilter && (
          <FilterIconButton onClick={onFilter} label={`Filter by ${value}`} />
        )}
        {entityId && onEntityClick && (
          <GoToIconButton
            onClick={() => onEntityClick(entityId)}
            label="Go to entity"
          />
        )}
      </div>
    </div>
  )
}
