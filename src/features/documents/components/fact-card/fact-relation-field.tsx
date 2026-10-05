"use client"

import type { ReactNode } from "react"

import { FilterIconButton } from "@/components/shared/filter-icon-button"
import { GoToIconButton } from "@/components/shared/go-to-icon-button"
import { InlineEditText } from "./inline-edit-text"

interface FactRelationFieldProps {
  value: string
  disabled: boolean
  onFilter?: () => void
  onGoTo?: () => void
  goToLabel?: string
  afterValue?: ReactNode
  onSave: (value: string) => Promise<void>
}

export function FactRelationField({
  value,
  disabled,
  onFilter,
  onGoTo,
  goToLabel = "Open details",
  afterValue,
  onSave,
}: FactRelationFieldProps) {
  return (
    <div className="flex items-start gap-1">
      <div className="min-w-0 flex-1">
        <div className="flex items-start gap-1">
          <InlineEditText
            value={value}
            disabled={disabled}
            onSave={onSave}
            className="text-muted-foreground italic"
          />
          {afterValue}
        </div>
      </div>
      {(onFilter || onGoTo) && (
        <div className="flex shrink-0 items-center gap-0.5">
          {onFilter && (
            <FilterIconButton onClick={onFilter} label={`Filter by ${value}`} />
          )}
          {onGoTo && <GoToIconButton onClick={onGoTo} label={goToLabel} />}
        </div>
      )}
    </div>
  )
}
