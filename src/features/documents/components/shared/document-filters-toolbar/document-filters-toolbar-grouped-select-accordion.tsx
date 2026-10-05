"use client"

import { useState } from "react"
import { ChevronDown, ChevronRight } from "lucide-react"

import type { DocumentFiltersToolbarGroupedOption } from "./types"
import { DocumentFiltersToolbarGroupedSelectItem } from "./document-filters-toolbar-grouped-select-item"

interface DocumentFiltersToolbarGroupedSelectAccordionProps {
  label: string
  options: DocumentFiltersToolbarGroupedOption[]
  selectedValue: string
  onSelect: (value: string) => void
}

export function DocumentFiltersToolbarGroupedSelectAccordion({
  label,
  options,
  selectedValue,
  onSelect,
}: DocumentFiltersToolbarGroupedSelectAccordionProps) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div>
      <button
        type="button"
        onClick={() => setExpanded((value) => !value)}
        className="flex w-full items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium hover:bg-accent hover:text-accent-foreground"
      >
        {expanded ? (
          <ChevronDown className="size-3.5 shrink-0 text-muted-foreground" />
        ) : (
          <ChevronRight className="size-3.5 shrink-0 text-muted-foreground" />
        )}
        <span className="truncate">{label}</span>
        <span className="ml-auto shrink-0 text-[10px] text-muted-foreground">
          {options.length}
        </span>
      </button>
      {expanded
        ? options.map((option) => (
            <div key={option.value} className="pl-4">
              <DocumentFiltersToolbarGroupedSelectItem
                label={option.label}
                isSelected={selectedValue === option.value}
                onSelect={() => onSelect(option.value)}
              />
            </div>
          ))
        : null}
    </div>
  )
}
