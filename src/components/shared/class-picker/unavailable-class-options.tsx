"use client"

import { ChevronDown, ChevronRight } from "lucide-react"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

import { ClassPickerItem } from "./class-picker-item"
import { ModuleAccordion } from "./module-accordion"
import type { ModuleGroup, PickerClass, PickerModule } from "./types"

interface UnavailableClassOptionsProps {
  classes: PickerClass[]
  modules: PickerModule[]
  selectedValue: string
  searchMode?: boolean
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function UnavailableClassOptions({
  classes,
  modules,
  selectedValue,
  searchMode = false,
  open,
  onOpenChange,
}: UnavailableClassOptionsProps) {
  if (classes.length === 0) return null

  const count = classes.length

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
          {classes.map((item) => (
            <ClassPickerItem
              key={item.id}
              label={item.name}
              hint={
                item.module_id ? moduleNameById.get(item.module_id) : undefined
              }
              isSelected={selectedValue === item.id}
              disabled
              onSelect={() => {}}
            />
          ))}
        </div>
      </>
    )
  }

  const moduleGroups: ModuleGroup[] = modules
    .map((module) => ({
      module,
      classes: classes.filter((item) => item.module_id === module.id),
    }))
    .filter((group) => group.classes.length > 0)

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
              key={group.module.id}
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
