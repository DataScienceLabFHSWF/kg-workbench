"use client"

import { ChevronDown, ChevronRight } from "lucide-react"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

import { ModuleAccordion } from "./module-accordion"
import { RelationPickerItem } from "./relation-picker-item"
import type {
  ModuleGroup,
  PickerClass,
  PickerModule,
  PickerRelation,
} from "./types"

interface UnavailableRelationOptionsProps {
  options: PickerRelation[]
  classes: PickerClass[]
  modules: PickerModule[]
  selectedValue: string | null
  searchMode?: boolean
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function UnavailableRelationOptions({
  options,
  classes,
  modules,
  selectedValue,
  searchMode = false,
  open,
  onOpenChange,
}: UnavailableRelationOptionsProps) {
  if (options.length === 0) return null

  const count = options.length
  const classModuleMap = new Map(classes.map((cls) => [cls.id, cls.module_id]))

  if (searchMode) {
    const moduleNameById = new Map(
      modules.map((module) => [module.id, module.name])
    )

    return (
      <>
        <div className="my-1 h-px bg-border" />
        <div>
          <p className="px-2.5 py-1.5 text-left text-xs font-medium text-muted-foreground">
            Unavailable options ({count})
          </p>
          {options.map((option) => {
            const moduleId = classModuleMap.get(option.domain_class_id)
            const moduleName = moduleId
              ? moduleNameById.get(moduleId)
              : "No module"

            return (
              <RelationPickerItem
                key={option.id}
                label={option.name}
                hint={moduleName}
                isSelected={selectedValue === option.id}
                disabled
                onSelect={() => {}}
              />
            )
          })}
        </div>
      </>
    )
  }

  const grouped = new Map<string | null, PickerRelation[]>()

  for (const option of options) {
    const moduleId = classModuleMap.get(option.domain_class_id) ?? null
    const existing = grouped.get(moduleId) ?? []
    existing.push(option)
    grouped.set(moduleId, existing)
  }

  const moduleGroups: ModuleGroup[] = []

  for (const ontologyModule of modules) {
    const relations = grouped.get(ontologyModule.id)
    if (!relations?.length) continue

    moduleGroups.push({
      module: ontologyModule,
      relations,
    })
  }

  const noModuleRelations = grouped.get(null)
  if (noModuleRelations?.length) {
    moduleGroups.push({
      module: null,
      relations: noModuleRelations,
    })
  }

  return (
    <>
      <div className="my-1 h-px bg-border" />
      <Collapsible open={open} onOpenChange={onOpenChange}>
        <CollapsibleTrigger className="flex w-full items-center gap-1.5 rounded-sm px-2.5 py-1.5 text-left text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground data-[state=open]:text-foreground">
          {open ? (
            <ChevronDown className="size-3.5 shrink-0" />
          ) : (
            <ChevronRight className="size-3.5 shrink-0" />
          )}
          <span className="flex-1">Show unavailable options</span>
          <span className="shrink-0 text-[10px] text-muted-foreground">
            {count}
          </span>
        </CollapsibleTrigger>
        <CollapsibleContent>
          {moduleGroups.map((group) => (
            <ModuleAccordion
              key={group.module?.id ?? "__no_module__"}
              group={group}
              selectedValue={selectedValue}
              onSelect={() => {}}
              itemDisabled
            />
          ))}
        </CollapsibleContent>
      </Collapsible>
    </>
  )
}
