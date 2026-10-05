"use client"

import { useState } from "react"
import { ChevronDown, ChevronRight } from "lucide-react"

import type { GroupedOptionPickerOption } from "./types"
import { GroupedOptionPickerItem } from "./grouped-option-picker-item"

interface GroupedOptionPickerAccordionProps {
  label: string
  options: GroupedOptionPickerOption[]
  selectedValue: string
  onSelect: (value: string) => void
}

export function GroupedOptionPickerAccordion({
  label,
  options,
  selectedValue,
  onSelect,
}: GroupedOptionPickerAccordionProps) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div>
      <button
        type="button"
        onClick={() => setExpanded((current) => !current)}
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
              <GroupedOptionPickerItem
                label={option.label}
                hint={option.hint}
                isSelected={selectedValue === option.value}
                onSelect={() => onSelect(option.value)}
              />
            </div>
          ))
        : null}
    </div>
  )
}
