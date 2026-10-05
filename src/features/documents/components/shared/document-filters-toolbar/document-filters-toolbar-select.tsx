"use client"

import { MultiSelectDropdown } from "@/components/shared/multi-select-dropdown"

import { DOCUMENT_FILTER_ALL } from "../../../utils/document-filters"
import type { DocumentFiltersToolbarSelectProps } from "./types"
import { getSelectedValues } from "./utils"

export function DocumentFiltersToolbarSelect({
  label,
  options,
  selectedValue,
  isActive = false,
  disabled = false,
  hideFieldLabel = false,
  allLabel = "All",
  selectAllValue = DOCUMENT_FILTER_ALL,
  onChange,
  onClear,
}: DocumentFiltersToolbarSelectProps) {
  const selectedValues = getSelectedValues(options, selectedValue)

  return (
    <div className="flex min-w-[5.5rem] flex-1 flex-col gap-1 sm:flex-none">
      {hideFieldLabel ? null : (
        <span className="px-1 text-[11px] font-medium text-muted-foreground">
          {label}
        </span>
      )}
      <MultiSelectDropdown
        label={label}
        options={options}
        selectedValues={selectedValues}
        onToggle={(value) => onChange(value)}
        onToggleAll={() => onChange(selectAllValue)}
        allLabel={allLabel}
        selectAllValue={selectAllValue}
        onClear={onClear}
        disabled={disabled}
        hideLabel
        isActive={isActive}
        className="min-h-9 w-full justify-between gap-1.5"
      />
    </div>
  )
}
