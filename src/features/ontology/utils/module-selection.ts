import type { Dispatch, SetStateAction } from "react"

import type { OntologyModule } from "@/domain/ontology"

export const NO_MODULE_GROUP_KEY = "__no_module__"

interface ModuleGroupBase {
  moduleId: string | null
  moduleLabel: string
}

export function getDefaultModuleSelection(modules: OntologyModule[]) {
  return new Set(modules.map((module) => module.id))
}

export function updateSet<T>(
  setter: Dispatch<SetStateAction<Set<T>>>,
  callback: (next: Set<T>) => void
) {
  setter((current) => {
    const next = new Set(current)
    callback(next)
    return next
  })
}

export function sortModuleGroups<T extends ModuleGroupBase>(groups: T[]) {
  return groups.sort((left, right) => {
    if (left.moduleId === null && right.moduleId !== null) return 1
    if (left.moduleId !== null && right.moduleId === null) return -1
    return left.moduleLabel.localeCompare(right.moduleLabel)
  })
}
