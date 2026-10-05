"use client"

import { useEffect } from "react"

import type { OntologyModule, OntologyRelation } from "@/domain/ontology"
import type { OntologyClassWithAttributes } from "@/features/ontology/server/queries"
import { MultiSelectDropdown } from "@/components/shared/multi-select-dropdown"

interface CQModuleLinkFieldProps {
  modules: OntologyModule[]
  selectedModuleIds: Set<string>
  onSelectedModuleIdsChange: (ids: Set<string>) => void
  subjectClassId: string | null
  objectClassId: string | null
  predicateRelationId: string | null
  classMap: Map<string, OntologyClassWithAttributes>
  relationMap: Map<string, OntologyRelation>
  hideLabel?: boolean
  className?: string
}

export function CQModuleLinkField({
  modules,
  selectedModuleIds,
  onSelectedModuleIdsChange,
  subjectClassId,
  objectClassId,
  predicateRelationId,
  classMap,
  relationMap,
  hideLabel = false,
  className,
}: CQModuleLinkFieldProps) {
  // Auto-add module IDs derived from the current SPO selection.
  // Preserves user-added IDs and allows manual removal of auto-selected ones.
  useEffect(() => {
    const toAdd: string[] = []

    if (subjectClassId) {
      const cls = classMap.get(subjectClassId)
      if (cls?.module_id) toAdd.push(cls.module_id)
    }
    if (objectClassId) {
      const cls = classMap.get(objectClassId)
      if (cls?.module_id) toAdd.push(cls.module_id)
    }
    if (predicateRelationId) {
      const rel = relationMap.get(predicateRelationId)
      if (rel) {
        const domainCls = classMap.get(rel.domain_class_id)
        const rangeCls = classMap.get(rel.range_class_id)
        if (domainCls?.module_id) toAdd.push(domainCls.module_id)
        if (rangeCls?.module_id) toAdd.push(rangeCls.module_id)
      }
    }

    if (toAdd.length === 0) return
    const filtered = toAdd.filter((id) => modules.some((m) => m.id === id))
    if (filtered.every((id) => selectedModuleIds.has(id))) return

    onSelectedModuleIdsChange(new Set([...selectedModuleIds, ...filtered]))
  }, [subjectClassId, objectClassId, predicateRelationId]) // eslint-disable-line react-hooks/exhaustive-deps

  const options = modules.map((m) => ({ value: m.id, label: m.name }))

  function handleToggle(id: string) {
    const next = new Set(selectedModuleIds)
    if (next.has(id)) {
      next.delete(id)
    } else {
      next.add(id)
    }
    onSelectedModuleIdsChange(next)
  }

  function handleToggleAll() {
    if (selectedModuleIds.size === modules.length) {
      onSelectedModuleIdsChange(new Set())
    } else {
      onSelectedModuleIdsChange(new Set(modules.map((m) => m.id)))
    }
  }

  function handleClear() {
    onSelectedModuleIdsChange(new Set())
  }

  return (
    <MultiSelectDropdown
      label="Related modules"
      options={options}
      selectedValues={selectedModuleIds}
      onToggle={handleToggle}
      onToggleAll={handleToggleAll}
      onClear={handleClear}
      hideLabel={hideLabel}
      className={className}
    />
  )
}
