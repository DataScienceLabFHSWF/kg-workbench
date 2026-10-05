"use client"

import { useMemo, useRef, useState } from "react"
import { ChevronDown, X } from "lucide-react"

import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

import { ClassPickerItem } from "./class-picker-item"
import { ModuleAccordion } from "./module-accordion"
import { UnavailableClassOptions } from "./unavailable-class-options"
import type {
  ModuleGroup,
  NoneOption,
  PickerClass,
  PickerConstraintCopy,
  PickerModule,
} from "./types"

export interface ClassPickerProps {
  value: string
  onValueChange: (id: string) => void
  allClasses: PickerClass[]
  modules: PickerModule[]
  currentModuleId: string | null
  placeholder?: string
  disabled?: boolean
  noneOption?: NoneOption
  className?: string
  unavailableClasses?: PickerClass[]
  constraintCopy?: PickerConstraintCopy
  /** Called when the picker popover opens - useful for lazy-loading data */
  onTriggerClick?: () => void
  /** When provided, shows a "Clear" button inside the dropdown while a value is selected */
  onClear?: () => void
}

export function ClassPicker({
  value,
  onValueChange,
  allClasses,
  modules,
  currentModuleId,
  placeholder = "Select class...",
  disabled = false,
  noneOption,
  className,
  unavailableClasses = [],
  constraintCopy,
  onTriggerClick,
  onClear,
}: ClassPickerProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [showUnavailable, setShowUnavailable] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const selectedClass =
    allClasses.find((c) => c.id === value) ??
    unavailableClasses.find((c) => c.id === value)
  const displayLabel =
    noneOption && value === noneOption.value
      ? noneOption.label
      : (selectedClass?.name ?? "")

  const moduleMap = useMemo(
    () => new Map(modules.map((m) => [m.id, m])),
    [modules]
  )

  const query = search.toLowerCase().trim()

  const searchResults = useMemo(() => {
    if (!query) return null
    return allClasses.filter((c) => c.name.toLowerCase().includes(query))
  }, [allClasses, query])

  const unavailableSearchResults = useMemo(() => {
    if (!query) return null
    return unavailableClasses.filter((c) =>
      c.name.toLowerCase().includes(query)
    )
  }, [query, unavailableClasses])

  const { currentModuleClasses, otherModuleGroups } = useMemo(() => {
    if (currentModuleId) {
      const current = allClasses.filter((c) => c.module_id === currentModuleId)
      const otherIds = new Set(
        allClasses
          .filter((c) => c.module_id && c.module_id !== currentModuleId)
          .map((c) => c.module_id!)
      )
      const others: ModuleGroup[] = []
      for (const mod of modules) {
        if (!otherIds.has(mod.id)) continue
        others.push({
          module: mod,
          classes: allClasses.filter((c) => c.module_id === mod.id),
        })
      }
      return { currentModuleClasses: current, otherModuleGroups: others }
    } else {
      const groups: ModuleGroup[] = []
      for (const mod of modules) {
        const cls = allClasses.filter((c) => c.module_id === mod.id)
        if (cls.length > 0) groups.push({ module: mod, classes: cls })
      }
      return { currentModuleClasses: [], otherModuleGroups: groups }
    }
  }, [allClasses, modules, currentModuleId])

  const hasUnavailable = unavailableClasses.length > 0

  function handleSelect(id: string) {
    onValueChange(id)
    setOpen(false)
    setSearch("")
  }

  function handleOpenChange(next: boolean) {
    setOpen(next)
    if (next) {
      onTriggerClick?.()
      setSearch("")
      setShowUnavailable(false)
      setTimeout(() => inputRef.current?.focus(), 0)
    }
  }

  const currentModule = currentModuleId ? moduleMap.get(currentModuleId) : null

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <button
          type="button"
          disabled={disabled}
          className={cn(
            "flex h-8 w-full items-center justify-between gap-1.5 rounded-none border border-input bg-transparent px-2.5 py-2 text-xs whitespace-nowrap transition-colors outline-none select-none",
            "focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/50",
            "disabled:cursor-not-allowed disabled:opacity-50",
            !displayLabel && "text-muted-foreground",
            className
          )}
        >
          <span className="truncate">{displayLabel || placeholder}</span>
          <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="w-64 p-0"
        align="start"
        side="bottom"
        sideOffset={4}
      >
        <div className="border-b px-2 py-1.5">
          <Input
            ref={inputRef}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search classes..."
            className="h-7 rounded-none border-none bg-transparent px-1 text-xs shadow-none focus-visible:ring-0"
          />
        </div>

        <div className="max-h-64 overflow-y-auto py-1">
          {constraintCopy && (
            <p className="px-2.5 py-1 text-[10px] leading-tight text-muted-foreground">
              Compatible with{" "}
              {constraintCopy.selections.map((selection, index) => (
                <span key={`${selection.kind}-${selection.text}-${index}`}>
                  {index > 0 ? " and " : ""}
                  {selection.kind}{" "}
                  <span className="italic">{selection.text}</span>
                  {selection.mappedName ? (
                    <>
                      {" "}
                      as{" "}
                      <span>
                        {selection.kind === "relation"
                          ? "Ontology-Relation "
                          : "Ontology-Class "}
                      </span>
                      <span className="font-semibold not-italic">
                        {selection.mappedName}
                      </span>
                    </>
                  ) : null}
                </span>
              ))}
            </p>
          )}

          {onClear && value && !(noneOption && value === noneOption.value) && (
            <button
              type="button"
              onClick={() => {
                onClear()
                setOpen(false)
                setSearch("")
              }}
              className="flex w-full items-center gap-2 px-2.5 py-1.5 text-xs text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            >
              <X className="size-3.5 shrink-0" />
              Clear
            </button>
          )}
          {noneOption && (
            <ClassPickerItem
              label={noneOption.label}
              isSelected={value === noneOption.value}
              onSelect={() => handleSelect(noneOption.value)}
            />
          )}

          {searchResults !== null ? (
            <>
              {searchResults.length > 0 ? (
                searchResults.map((c) => (
                  <ClassPickerItem
                    key={c.id}
                    label={c.name}
                    hint={
                      c.module_id ? moduleMap.get(c.module_id)?.name : undefined
                    }
                    isSelected={value === c.id}
                    onSelect={() => handleSelect(c.id)}
                  />
                ))
              ) : unavailableSearchResults?.length ? (
                <p className="px-3 py-2 text-xs text-muted-foreground">
                  No selectable classes match this search.
                </p>
              ) : (
                <p className="px-3 py-4 text-center text-xs text-muted-foreground">
                  No classes found.
                </p>
              )}

              {constraintCopy &&
                unavailableSearchResults &&
                unavailableSearchResults.length > 0 && (
                  <UnavailableClassOptions
                    classes={unavailableSearchResults}
                    modules={modules}
                    selectedValue={value}
                    searchMode
                    open={showUnavailable}
                    onOpenChange={setShowUnavailable}
                  />
                )}
            </>
          ) : currentModuleId ? (
            <>
              {currentModule && (
                <p className="px-2.5 pt-1 pb-0.5 text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
                  {currentModule.name}
                </p>
              )}
              {currentModuleClasses.length > 0 ? (
                currentModuleClasses.map((c) => (
                  <ClassPickerItem
                    key={c.id}
                    label={c.name}
                    isSelected={value === c.id}
                    onSelect={() => handleSelect(c.id)}
                  />
                ))
              ) : (
                <p className="px-3 py-2 text-xs text-muted-foreground">
                  No classes in this module.
                </p>
              )}

              {otherModuleGroups.length > 0 && (
                <>
                  <div className="my-1 h-px bg-border" />
                  {otherModuleGroups.map((group) => (
                    <ModuleAccordion
                      key={group.module.id}
                      group={group}
                      selectedValue={value}
                      onSelect={handleSelect}
                    />
                  ))}
                </>
              )}

              {!currentModuleClasses.length &&
                otherModuleGroups.length === 0 &&
                hasUnavailable && (
                  <p className="px-3 py-2 text-xs text-muted-foreground">
                    No selectable classes match the current selection.
                  </p>
                )}
            </>
          ) : (
            <>
              {otherModuleGroups.length > 0 ? (
                otherModuleGroups.map((group) => (
                  <ModuleAccordion
                    key={group.module.id}
                    group={group}
                    selectedValue={value}
                    onSelect={handleSelect}
                  />
                ))
              ) : hasUnavailable ? (
                <p className="px-3 py-2 text-xs text-muted-foreground">
                  No selectable classes match the current selection.
                </p>
              ) : (
                <p className="px-3 py-4 text-center text-xs text-muted-foreground">
                  No classes found.
                </p>
              )}
            </>
          )}

          {constraintCopy && hasUnavailable && searchResults === null && (
            <UnavailableClassOptions
              classes={unavailableClasses}
              modules={modules}
              selectedValue={value}
              open={showUnavailable}
              onOpenChange={setShowUnavailable}
            />
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
