"use client"

import { useMemo } from "react"

import type { OntologyClassWithAttributes } from "@/features/ontology/server/queries"

import { ExportModuleGroupCard } from "../shared/export-module-group-card"
import { NO_MODULE_GROUP_KEY, sortModuleGroups } from "../export-utils"
import { ExtraIncludedClassCard } from "./extra-included-class-card"

interface ExtraIncludedClassesPanelProps {
  extraSelectedClasses: OntologyClassWithAttributes[]
  getModuleLabel: (moduleId: string | null) => string
  onRemoveExtraClass: (classId: string) => void
}

interface ExtraIncludedClassGroup {
  moduleId: string | null
  moduleLabel: string
  classes: OntologyClassWithAttributes[]
}

export function ExtraIncludedClassesPanel({
  extraSelectedClasses,
  getModuleLabel,
  onRemoveExtraClass,
}: ExtraIncludedClassesPanelProps) {
  const groups = useMemo(() => {
    const groupsByModule = new Map<string, ExtraIncludedClassGroup>()

    for (const cls of extraSelectedClasses) {
      const moduleId = cls.module_id
      const key = moduleId ?? NO_MODULE_GROUP_KEY
      const existing = groupsByModule.get(key)

      if (existing) {
        existing.classes.push(cls)
        continue
      }

      groupsByModule.set(key, {
        moduleId,
        moduleLabel: getModuleLabel(moduleId),
        classes: [cls],
      })
    }

    return sortModuleGroups(Array.from(groupsByModule.values()))
  }, [extraSelectedClasses, getModuleLabel])

  return (
    <section className="flex min-h-0 flex-col space-y-3">
      <div>
        <p className="font-medium">Extra included classes</p>
        <p className="text-muted-foreground">
          included {extraSelectedClasses.length}{" "}
          {extraSelectedClasses.length === 1
            ? "class that's"
            : "classes that are"}{" "}
          outside selected modules
        </p>
      </div>

      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto rounded-md border p-3">
        {groups.map((group) => (
          <ExportModuleGroupCard
            key={group.moduleId ?? NO_MODULE_GROUP_KEY}
            title={group.moduleLabel}
            description={`${group.classes.length} ${
              group.classes.length === 1 ? "class" : "classes"
            }`}
            defaultOpen
          >
            {group.classes.map((cls) => (
              <ExtraIncludedClassCard
                key={cls.id}
                cls={cls}
                onRemoveExtraClass={onRemoveExtraClass}
              />
            ))}
          </ExportModuleGroupCard>
        ))}

        {groups.length === 0 ? (
          <p className="text-muted-foreground">No extra classes included.</p>
        ) : null}
      </div>
    </section>
  )
}
