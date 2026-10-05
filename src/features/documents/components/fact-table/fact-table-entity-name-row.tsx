"use client"

import { FilterIconButton } from "@/components/shared/filter-icon-button"
import { GoToIconButton } from "@/components/shared/go-to-icon-button"
import { MissingRequiredNote } from "../shared/missing-required-note"

import { InlineEditText } from "../fact-card/inline-edit-text"

interface FactTableEntityNameRowProps {
  value: string
  disabled: boolean
  entityId: string | null
  missingFieldNames: string[]
  onFilter: () => void
  onEntityClick?: (entityId: string) => void
  onSave: (value: string) => Promise<void>
}

export function FactTableEntityNameRow({
  value,
  disabled,
  entityId,
  missingFieldNames,
  onFilter,
  onEntityClick,
  onSave,
}: FactTableEntityNameRowProps) {
  return (
    <div className="flex items-start gap-1">
      <div className="min-w-0 flex-1">
        <div className="flex items-start gap-1">
          <InlineEditText
            value={value}
            disabled={disabled}
            onSave={onSave}
            className="font-semibold"
          />
          <MissingRequiredNote fieldNames={missingFieldNames} />
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-0.5">
        <FilterIconButton onClick={onFilter} label={`Filter by ${value}`} />
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
