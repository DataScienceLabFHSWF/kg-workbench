"use client"

import { useState } from "react"
import { ChevronDown, ChevronRight } from "lucide-react"

import { RelationPickerItem } from "./relation-picker-item"
import type { ModuleGroup } from "./types"

type ModuleAccordionProps = {
  group: ModuleGroup
  selectedValue: string | null
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
        onClick={() => setExpanded((value) => !value)}
        className="flex w-full items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium hover:bg-accent hover:text-accent-foreground"
      >
        {expanded ? (
          <ChevronDown className="size-3.5 shrink-0 text-muted-foreground" />
        ) : (
          <ChevronRight className="size-3.5 shrink-0 text-muted-foreground" />
        )}
        <span className="truncate">{group.module?.name ?? "No module"}</span>
        <span className="ml-auto shrink-0 text-[10px] text-muted-foreground">
          {group.relations.length}
        </span>
      </button>
      {expanded &&
        group.relations.map((relation) => (
          <div key={relation.id} className="pl-4">
            <RelationPickerItem
              label={relation.name}
              isSelected={selectedValue === relation.id}
              disabled={itemDisabled}
              onSelect={() => onSelect(relation.id)}
            />
          </div>
        ))}
    </div>
  )
}
