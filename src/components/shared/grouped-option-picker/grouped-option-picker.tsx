"use client"

import { useMemo, useRef, useState } from "react"
import { ChevronDown } from "lucide-react"

import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

import { GroupedOptionPickerAccordion } from "./grouped-option-picker-accordion"
import type {
  GroupedOptionPickerOption,
  GroupedOptionPickerProps,
} from "./types"
import { GroupedOptionPickerItem } from "./grouped-option-picker-item"

interface OptionGroup {
  id: string | null
  label: string
  options: GroupedOptionPickerOption[]
}

function getGroupKey(groupId: string | null) {
  return groupId ?? "__no_group__"
}

export function GroupedOptionPicker({
  value,
  options,
  onValueChange,
  placeholder = "Select option...",
  searchPlaceholder,
  emptyLabel,
  disabled = false,
  className,
  contentClassName,
}: GroupedOptionPickerProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  const selectedOption = options.find((option) => option.value === value)
  const displayLabel = selectedOption?.label ?? value
  const query = search.toLowerCase().trim()

  const searchResults = useMemo(() => {
    if (!query) return null

    return options.filter((option) =>
      [option.label, option.hint, ...(option.keywords ?? [])].some(
        (part) => typeof part === "string" && part.toLowerCase().includes(query)
      )
    )
  }, [options, query])

  const groupedOptions = useMemo(() => {
    const grouped = new Map<string | null, GroupedOptionPickerOption[]>()

    for (const option of options) {
      const existing = grouped.get(option.groupId) ?? []
      existing.push(option)
      grouped.set(option.groupId, existing)
    }

    const result: OptionGroup[] = []
    const seen = new Set<string>()

    for (const option of options) {
      const groupKey = getGroupKey(option.groupId)
      if (seen.has(groupKey)) continue

      const groupOptions = grouped.get(option.groupId)
      if (!groupOptions?.length) continue

      result.push({
        id: option.groupId,
        label: option.groupLabel,
        options: groupOptions,
      })
      seen.add(groupKey)
    }

    return result
  }, [options])

  function handleOpenChange(next: boolean) {
    setOpen(next)
    setSearch("")

    if (next) {
      setTimeout(() => inputRef.current?.focus(), 0)
    }
  }

  function handleSelect(nextValue: string) {
    onValueChange(nextValue)
    setOpen(false)
    setSearch("")
  }

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <button
          type="button"
          disabled={disabled}
          className={cn(
            "flex h-7 w-full items-center justify-between gap-1 rounded-none border border-input bg-transparent px-2 py-1 text-xs transition-colors outline-none select-none",
            "focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/50",
            "disabled:cursor-not-allowed disabled:opacity-50",
            !displayLabel && "text-muted-foreground",
            className
          )}
        >
          <span className="truncate text-left">
            {displayLabel || placeholder}
          </span>
          <ChevronDown className="size-3.5 shrink-0 text-muted-foreground" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        className={cn("w-72 p-0", contentClassName)}
        align="start"
        sideOffset={4}
      >
        <div className="border-b px-2 py-1.5">
          <Input
            ref={inputRef}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={searchPlaceholder}
            className="h-7 rounded-none border-none bg-transparent px-1 text-xs shadow-none focus-visible:ring-0"
          />
        </div>
        <div className="max-h-72 overflow-y-auto py-1">
          {searchResults !== null ? (
            searchResults.length > 0 ? (
              searchResults.map((option) => (
                <GroupedOptionPickerItem
                  key={option.value}
                  label={option.label}
                  hint={option.groupLabel}
                  isSelected={value === option.value}
                  onSelect={() => handleSelect(option.value)}
                />
              ))
            ) : (
              <p className="px-3 py-4 text-center text-xs text-muted-foreground">
                {emptyLabel}
              </p>
            )
          ) : groupedOptions.length > 0 ? (
            groupedOptions.map((group) => (
              <GroupedOptionPickerAccordion
                key={getGroupKey(group.id)}
                label={group.label}
                options={group.options}
                selectedValue={value}
                onSelect={handleSelect}
              />
            ))
          ) : (
            <p className="px-3 py-4 text-center text-xs text-muted-foreground">
              {emptyLabel}
            </p>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
