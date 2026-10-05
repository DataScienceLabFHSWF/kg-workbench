"use client"

import { useMemo, useRef, useState } from "react"
import { ChevronDown, X } from "lucide-react"

import { TruncatedLabel } from "@/components/shared/truncated-label"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

import { DOCUMENT_FILTER_ALL } from "../../../utils/document-filters"
import type { DocumentFiltersToolbarNestedSelectProps } from "./types"
import { flattenNestedOptions } from "./utils"
import { DocumentFiltersToolbarGroupedSelectItem } from "./document-filters-toolbar-grouped-select-item"
import { DocumentFiltersToolbarNestedSelectNode } from "./document-filters-toolbar-nested-select-node"

export function DocumentFiltersToolbarNestedSelect({
  label,
  searchPlaceholder,
  options,
  selectedValue,
  selectedLabel,
  isActive = false,
  disabled = false,
  hideFieldLabel = false,
  allLabel = "All",
  emptyLabel,
  onChange,
  onClear,
}: DocumentFiltersToolbarNestedSelectProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  const leafOptions = useMemo(() => flattenNestedOptions(options), [options])
  const selectedOption = leafOptions.find(
    (option) => option.value === selectedValue
  )
  const displayLabel =
    selectedValue === DOCUMENT_FILTER_ALL
      ? allLabel
      : (selectedOption?.label ?? selectedLabel ?? "")

  const query = search.toLowerCase().trim()
  const searchResults = useMemo(() => {
    if (!query) return null

    return leafOptions.filter((option) =>
      `${option.label} ${option.breadcrumb}`.toLowerCase().includes(query)
    )
  }, [leafOptions, query])

  function handleOpenChange(next: boolean) {
    setOpen(next)
    setSearch("")

    if (next) {
      setTimeout(() => inputRef.current?.focus(), 0)
    }
  }

  function handleSelect(value: string) {
    onChange(value)
    setOpen(false)
    setSearch("")
  }

  return (
    <div className="flex min-w-[5.5rem] flex-1 flex-col gap-1 sm:flex-none">
      {hideFieldLabel ? null : (
        <span className="px-1 text-[11px] font-medium text-muted-foreground">
          {label}
        </span>
      )}

      <Popover open={open} onOpenChange={handleOpenChange}>
        <div className="group relative">
          <PopoverTrigger asChild>
            <button
              type="button"
              disabled={disabled}
              className={cn(
                "flex min-h-9 w-full min-w-0 items-center justify-between gap-2 rounded-md border border-input bg-background px-2 py-1 text-left text-xs",
                "transition-colors hover:border-foreground/40 focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/50 focus-visible:outline-none",
                "disabled:cursor-not-allowed disabled:opacity-50",
                !displayLabel && "text-muted-foreground",
                isActive &&
                  "border-app-selection-border bg-app-selection-surface",
                onClear && isActive && "pr-10"
              )}
            >
              <TruncatedLabel text={displayLabel || allLabel} />
              <ChevronDown className="size-3.5 shrink-0 text-muted-foreground" />
            </button>
          </PopoverTrigger>

          {onClear && isActive ? (
            <button
              type="button"
              className="absolute top-1/2 right-6 inline-flex size-4 -translate-y-1/2 items-center justify-center rounded-sm text-muted-foreground opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100 hover:bg-muted hover:text-foreground focus-visible:opacity-100 focus-visible:outline-none"
              aria-label={`Clear ${label}`}
              onMouseDown={(event) => event.preventDefault()}
              onClick={(event) => {
                event.preventDefault()
                event.stopPropagation()
                onClear()
              }}
            >
              <X className="size-3" />
            </button>
          ) : null}
        </div>

        <PopoverContent className="w-72 p-0" align="start" sideOffset={4}>
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
            <DocumentFiltersToolbarGroupedSelectItem
              label={allLabel}
              isSelected={selectedValue === DOCUMENT_FILTER_ALL}
              onSelect={() => handleSelect(DOCUMENT_FILTER_ALL)}
            />

            {searchResults !== null ? (
              searchResults.length > 0 ? (
                searchResults.map((option) => (
                  <DocumentFiltersToolbarGroupedSelectItem
                    key={option.id}
                    label={option.label}
                    isSelected={selectedValue === option.value}
                    onSelect={() => handleSelect(option.value)}
                  />
                ))
              ) : (
                <p className="px-3 py-4 text-center text-xs text-muted-foreground">
                  {emptyLabel}
                </p>
              )
            ) : options.length > 0 ? (
              options.map((option) =>
                option.type === "leaf" ? (
                  <DocumentFiltersToolbarGroupedSelectItem
                    key={option.id}
                    label={option.label}
                    isSelected={selectedValue === option.value}
                    onSelect={() => handleSelect(option.value)}
                  />
                ) : (
                  <DocumentFiltersToolbarNestedSelectNode
                    key={option.id}
                    option={option}
                    selectedValue={selectedValue}
                    onSelect={handleSelect}
                  />
                )
              )
            ) : (
              <p className="px-3 py-4 text-center text-xs text-muted-foreground">
                {emptyLabel}
              </p>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
