"use client"

import { useMemo, useRef, useState } from "react"
import { ChevronDown, X } from "lucide-react"

import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import type { PickerConstraintCopy } from "@/components/shared/class-picker/types"
import { cn } from "@/lib/utils"

import { ModuleAccordion } from "./module-accordion"
import { RelationPickerItem } from "./relation-picker-item"
import { UnavailableRelationOptions } from "./unavailable-relation-options"
import type {
  ModuleGroup,
  PickerClass,
  PickerModule,
  PickerRelation,
} from "./types"

interface RelationPickerProps {
  value: string | null
  options: PickerRelation[]
  unavailableOptions?: PickerRelation[]
  classes: PickerClass[]
  modules: PickerModule[]
  disabled: boolean
  onSelect: (id: string | null) => void
  className?: string
  constraintCopy?: PickerConstraintCopy
}

export function RelationPicker({
  value,
  options,
  unavailableOptions = [],
  classes,
  modules,
  disabled,
  onSelect,
  className,
  constraintCopy,
}: RelationPickerProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [showUnavailable, setShowUnavailable] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const selectedName =
    options.find((option) => option.id === value)?.name ??
    unavailableOptions.find((option) => option.id === value)?.name

  const classModuleMap = useMemo(
    () => new Map(classes.map((cls) => [cls.id, cls.module_id])),
    [classes]
  )

  const moduleMap = useMemo(
    () => new Map(modules.map((module) => [module.id, module])),
    [modules]
  )

  const query = search.toLowerCase().trim()

  const searchResults = useMemo(() => {
    if (!query) return null

    return options.filter((option) => option.name.toLowerCase().includes(query))
  }, [options, query])

  const unavailableSearchResults = useMemo(() => {
    if (!query) return null

    return unavailableOptions.filter((option) =>
      option.name.toLowerCase().includes(query)
    )
  }, [query, unavailableOptions])

  const moduleGroups = useMemo(() => {
    const grouped = new Map<string | null, PickerRelation[]>()

    for (const option of options) {
      const moduleId = classModuleMap.get(option.domain_class_id) ?? null
      const existing = grouped.get(moduleId) ?? []
      existing.push(option)
      grouped.set(moduleId, existing)
    }

    const result: ModuleGroup[] = []

    for (const ontologyModule of modules) {
      const relations = grouped.get(ontologyModule.id)
      if (!relations?.length) continue

      result.push({
        module: ontologyModule,
        relations,
      })
    }

    const noModuleRelations = grouped.get(null)
    if (noModuleRelations?.length) {
      result.push({
        module: null,
        relations: noModuleRelations,
      })
    }

    return result
  }, [classModuleMap, modules, options])

  const hasUnavailable = unavailableOptions.length > 0

  function handleSelect(id: string | null) {
    onSelect(id)
    setOpen(false)
    setSearch("")
  }

  function handleOpenChange(next: boolean) {
    setOpen(next)
    setSearch("")
    setShowUnavailable(false)

    if (next) {
      setTimeout(() => inputRef.current?.focus(), 0)
    }
  }

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <button
          type="button"
          disabled={disabled}
          className={cn(
            "mt-1 flex h-5 w-full items-center justify-between gap-1 rounded border border-input bg-transparent px-1.5 text-[10px] transition-colors hover:bg-muted/50 disabled:cursor-not-allowed disabled:opacity-50",
            className
          )}
        >
          <span className="truncate text-left">
            {selectedName ?? (
              <span className="text-muted-foreground">Unmapped</span>
            )}
          </span>
          <ChevronDown className="size-3 shrink-0 text-muted-foreground" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-0" align="start" sideOffset={4}>
        <div className="border-b px-2 py-1.5">
          <Input
            ref={inputRef}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search relations..."
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

          {value && (
            <button
              type="button"
              onClick={() => handleSelect(null)}
              className="flex w-full items-center gap-2 px-2.5 py-1.5 text-xs text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            >
              <X className="size-3.5 shrink-0" />
              Clear
            </button>
          )}

          {searchResults !== null ? (
            <>
              {searchResults.length > 0 ? (
                searchResults.map((option) => {
                  const moduleId = classModuleMap.get(option.domain_class_id)
                  const moduleName = moduleId
                    ? moduleMap.get(moduleId)?.name
                    : "No module"

                  return (
                    <RelationPickerItem
                      key={option.id}
                      label={option.name}
                      hint={moduleName}
                      isSelected={value === option.id}
                      onSelect={() => handleSelect(option.id)}
                    />
                  )
                })
              ) : unavailableSearchResults?.length ? (
                <p className="px-3 py-2 text-xs text-muted-foreground">
                  No selectable relations match this search.
                </p>
              ) : (
                <p className="px-3 py-4 text-center text-xs text-muted-foreground">
                  No relations found.
                </p>
              )}

              {constraintCopy &&
                unavailableSearchResults &&
                unavailableSearchResults.length > 0 && (
                  <UnavailableRelationOptions
                    options={unavailableSearchResults}
                    classes={classes}
                    modules={modules}
                    selectedValue={value}
                    searchMode
                    open={showUnavailable}
                    onOpenChange={setShowUnavailable}
                  />
                )}
            </>
          ) : moduleGroups.length > 0 ? (
            <>
              {moduleGroups.map((group) => (
                <ModuleAccordion
                  key={group.module?.id ?? "__no_module__"}
                  group={group}
                  selectedValue={value}
                  onSelect={(id) => handleSelect(id)}
                />
              ))}
            </>
          ) : hasUnavailable ? (
            <p className="px-3 py-2 text-xs text-muted-foreground">
              No selectable relations match the current selection.
            </p>
          ) : (
            <p className="px-3 py-4 text-center text-xs text-muted-foreground">
              No relations found.
            </p>
          )}

          {constraintCopy && hasUnavailable && searchResults === null && (
            <UnavailableRelationOptions
              options={unavailableOptions}
              classes={classes}
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
