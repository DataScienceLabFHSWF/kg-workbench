"use client"

import { useState } from "react"
import { ChevronDown, ChevronRight } from "lucide-react"

import { ClassPickerItem } from "./class-picker-item"
import type { ModuleGroup } from "./types"

type ModuleAccordionProps = {
  group: ModuleGroup
  selectedValue: string
  onSelect: (id: string) => void
  itemDisabled?: boolean
}

export function ModuleAccordion({
  group,
  selectedValue,
  onSelect,
  itemDisabled = false,
}: ModuleAccordionProps) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div>
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium hover:bg-accent hover:text-accent-foreground"
      >
        {expanded ? (
          <ChevronDown className="size-3.5 shrink-0 text-muted-foreground" />
        ) : (
          <ChevronRight className="size-3.5 shrink-0 text-muted-foreground" />
        )}
        <span className="truncate">{group.module.name}</span>
        <span className="ml-auto shrink-0 text-[10px] text-muted-foreground">
          {group.classes.length}
        </span>
      </button>
      {expanded &&
        group.classes.map((c) => (
          <div key={c.id} className="pl-4">
            <ClassPickerItem
              label={c.name}
              isSelected={selectedValue === c.id}
              disabled={itemDisabled}
              onSelect={() => onSelect(c.id)}
            />
          </div>
        ))}
    </div>
  )
}
