"use client"

import { useMemo, useState } from "react"
import { ChevronDown, ChevronRight } from "lucide-react"

import type { DocumentFiltersToolbarNestedBranchOption } from "./types"
import { countNestedLeaves } from "./utils"
import { DocumentFiltersToolbarGroupedSelectItem } from "./document-filters-toolbar-grouped-select-item"

interface DocumentFiltersToolbarNestedSelectNodeProps {
  option: DocumentFiltersToolbarNestedBranchOption
  selectedValue: string
  onSelect: (value: string) => void
  depth?: number
}

export function DocumentFiltersToolbarNestedSelectNode({
  option,
  selectedValue,
  onSelect,
  depth = 0,
}: DocumentFiltersToolbarNestedSelectNodeProps) {
  const [expanded, setExpanded] = useState(false)

  const containsSelection = useMemo(
    () => branchContainsSelectedValue(option, selectedValue),
    [option, selectedValue]
  )
  const isExpanded = expanded || containsSelection
  const leafCount = useMemo(() => countNestedLeaves(option.children), [option])

  return (
    <div>
      <button
        type="button"
        onClick={() => setExpanded((value) => !value)}
        className="flex w-full items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium hover:bg-accent hover:text-accent-foreground"
        style={{ paddingLeft: `${depth * 14 + 10}px` }}
      >
        {isExpanded ? (
          <ChevronDown className="size-3.5 shrink-0 text-muted-foreground" />
        ) : (
          <ChevronRight className="size-3.5 shrink-0 text-muted-foreground" />
        )}
        <span className="truncate">{option.label}</span>
        <span className="ml-auto shrink-0 text-[10px] text-muted-foreground">
          {leafCount}
        </span>
      </button>

      {isExpanded
        ? option.children.map((child) =>
            child.type === "leaf" ? (
              <div key={child.id} style={{ paddingLeft: `${depth * 14}px` }}>
                <DocumentFiltersToolbarGroupedSelectItem
                  label={child.label}
                  isSelected={selectedValue === child.value}
                  onSelect={() => onSelect(child.value)}
                />
              </div>
            ) : (
              <DocumentFiltersToolbarNestedSelectNode
                key={child.id}
                option={child}
                selectedValue={selectedValue}
                onSelect={onSelect}
                depth={depth + 1}
              />
            )
          )
        : null}
    </div>
  )
}

function branchContainsSelectedValue(
  option: DocumentFiltersToolbarNestedBranchOption,
  selectedValue: string
): boolean {
  return option.children.some((child) =>
    child.type === "leaf"
      ? child.value === selectedValue
      : branchContainsSelectedValue(child, selectedValue)
  )
}
