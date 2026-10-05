"use client"

import { useMemo, useState } from "react"

import type {
  OntologyLanguage,
  OntologyLocalizedText,
  OntologyModule,
  OntologyRelation,
} from "@/domain/ontology"
import type { OntologyClassWithAttributes } from "@/features/ontology/server/queries"
import { ALL_LANGUAGES_EXPORT } from "@/features/ontology/utils/export-language"
import {
  getDefaultModuleSelection,
  NO_MODULE_GROUP_KEY,
  sortModuleGroups,
  updateSet,
} from "@/features/ontology/utils/module-selection"
import {
  formatMissingTranslationSummary,
  getExportLanguageOptions,
  getMissingTranslationSummary,
} from "@/features/ontology/components/export-ontology-dialog/translation-missing"

import type {
  DependencyGroup,
  MissingTranslationBehavior,
  ParentDependencyIssue,
  RelationDependencyIssue,
} from "@/features/ontology/components/export-ontology-dialog/types"

export type { DependencyGroup, MissingTranslationBehavior }

export interface OntologyModuleLanguageSelectionArgs {
  defaultLanguage: string
  ontologyId: string
  ontologyUsecase: string
  languages: OntologyLanguage[]
  localizedTexts: OntologyLocalizedText[]
  modules: OntologyModule[]
  classes: OntologyClassWithAttributes[]
  relations: OntologyRelation[]
}

export function useOntologyModuleLanguageSelection({
  defaultLanguage,
  ontologyId,
  ontologyUsecase,
  languages,
  localizedTexts,
  modules,
  classes,
  relations,
}: OntologyModuleLanguageSelectionArgs) {
  const [selectedModuleIds, setSelectedModuleIds] = useState<Set<string>>(() =>
    getDefaultModuleSelection(modules)
  )
  const [extraSelectedClassIds, setExtraSelectedClassIds] = useState<
    Set<string>
  >(new Set())
  const [excludedRelationIds, setExcludedRelationIds] = useState<Set<string>>(
    new Set()
  )
  const [droppedParentClassIds, setDroppedParentClassIds] = useState<
    Set<string>
  >(new Set())
  const [expandedDependencyGroups, setExpandedDependencyGroups] = useState<
    Set<string>
  >(new Set())
  const [exportLanguage, setExportLanguage] = useState(ALL_LANGUAGES_EXPORT)
  const [missingTranslationBehavior, setMissingTranslationBehavior] =
    useState<MissingTranslationBehavior>("fallback")

  function resetSelectionState() {
    setSelectedModuleIds(getDefaultModuleSelection(modules))
    setExtraSelectedClassIds(new Set())
    setExcludedRelationIds(new Set())
    setDroppedParentClassIds(new Set())
    setExpandedDependencyGroups(new Set())
    setExportLanguage(ALL_LANGUAGES_EXPORT)
    setMissingTranslationBehavior("fallback")
  }

  const moduleById = useMemo(
    () => new Map(modules.map((module) => [module.id, module])),
    [modules]
  )
  const classById = useMemo(
    () => new Map(classes.map((cls) => [cls.id, cls])),
    [classes]
  )
  const relationById = useMemo(
    () => new Map(relations.map((relation) => [relation.id, relation])),
    [relations]
  )
  const exportLanguageOptions = useMemo(
    () => getExportLanguageOptions({ defaultLanguage, languages }),
    [defaultLanguage, languages]
  )
  const moduleCounts = useMemo(() => {
    const counts = new Map<string, number>()
    for (const cls of classes) {
      if (!cls.module_id) continue
      counts.set(cls.module_id, (counts.get(cls.module_id) ?? 0) + 1)
    }
    return counts
  }, [classes])

  const areAllModulesSelected =
    modules.length === 0 || selectedModuleIds.size === modules.length

  const selectedClassIds = useMemo(() => {
    const next = new Set(extraSelectedClassIds)
    for (const cls of classes) {
      if (!cls.module_id) {
        if (areAllModulesSelected) next.add(cls.id)
        continue
      }
      if (selectedModuleIds.has(cls.module_id)) next.add(cls.id)
    }
    return next
  }, [areAllModulesSelected, classes, extraSelectedClassIds, selectedModuleIds])

  const relationIssues = useMemo<RelationDependencyIssue[]>(() => {
    return relations.flatMap((relation) => {
      if (excludedRelationIds.has(relation.id)) return []
      const domain = classById.get(relation.domain_class_id)
      const range = classById.get(relation.range_class_id)
      if (!domain || !range) return []
      const domainSelected = selectedClassIds.has(domain.id)
      const rangeSelected = selectedClassIds.has(range.id)
      if (domainSelected === rangeSelected) return []
      return [
        {
          relation,
          keptClass: domainSelected ? domain : range,
          missingClass: domainSelected ? range : domain,
        },
      ]
    })
  }, [classById, excludedRelationIds, relations, selectedClassIds])

  const parentIssues = useMemo<ParentDependencyIssue[]>(() => {
    return classes.flatMap((child) => {
      if (!selectedClassIds.has(child.id) || !child.parent_class_id) return []
      if (droppedParentClassIds.has(child.id)) return []
      const parent = classById.get(child.parent_class_id)
      if (!parent || selectedClassIds.has(parent.id)) return []
      return [{ child, parent }]
    })
  }, [classById, classes, droppedParentClassIds, selectedClassIds])

  const exportRelationIds = useMemo(() => {
    return relations
      .filter((relation) => !excludedRelationIds.has(relation.id))
      .filter(
        (relation) =>
          selectedClassIds.has(relation.domain_class_id) &&
          selectedClassIds.has(relation.range_class_id)
      )
      .map((relation) => relation.id)
  }, [excludedRelationIds, relations, selectedClassIds])

  const exportModules = useMemo(() => {
    const relevantModuleIds = new Set(selectedModuleIds)
    for (const cls of classes) {
      if (selectedClassIds.has(cls.id) && cls.module_id) {
        relevantModuleIds.add(cls.module_id)
      }
    }
    return modules.filter((module) => relevantModuleIds.has(module.id))
  }, [classes, modules, selectedClassIds, selectedModuleIds])

  const extraSelectedClasses = useMemo(
    () =>
      Array.from(extraSelectedClassIds)
        .map((classId) => classById.get(classId))
        .filter((cls): cls is OntologyClassWithAttributes => Boolean(cls)),
    [classById, extraSelectedClassIds]
  )

  const excludedRelations = useMemo(
    () =>
      Array.from(excludedRelationIds)
        .map((relationId) => relationById.get(relationId))
        .filter((relation): relation is OntologyRelation => Boolean(relation)),
    [excludedRelationIds, relationById]
  )

  const droppedParents = useMemo(
    () =>
      Array.from(droppedParentClassIds).flatMap((childId) => {
        const child = classById.get(childId)
        const parent = child?.parent_class_id
          ? classById.get(child.parent_class_id)
          : null
        if (!child || !parent || !selectedClassIds.has(child.id)) return []
        return [{ child, parent }]
      }),
    [classById, droppedParentClassIds, selectedClassIds]
  )

  const unresolvedCount = relationIssues.length + parentIssues.length

  const selectedExportLanguage = exportLanguageOptions.find(
    (language) => language.code === exportLanguage
  ) ??
    exportLanguageOptions[0] ?? {
      code: exportLanguage,
      label: exportLanguage,
    }

  const missingTranslationSummary = useMemo(
    () =>
      getMissingTranslationSummary({
        classes,
        defaultLanguage,
        exportLanguage,
        localizedTexts,
        modules: exportModules,
        ontologyId,
        ontologyUsecase,
        relations,
        selectedClassIds,
        selectedRelationIds: exportRelationIds,
      }),
    [
      classes,
      defaultLanguage,
      exportLanguage,
      exportModules,
      exportRelationIds,
      localizedTexts,
      ontologyId,
      ontologyUsecase,
      relations,
      selectedClassIds,
    ]
  )

  const missingTranslationSummaryText = missingTranslationSummary
    ? formatMissingTranslationSummary(
        missingTranslationSummary,
        selectedExportLanguage.label
      )
    : null

  function getModuleLabel(moduleId: string | null) {
    if (!moduleId) return "No module"
    return moduleById.get(moduleId)?.name ?? "Unknown module"
  }

  const dependencyGroups = useMemo<DependencyGroup[]>(() => {
    const groups = new Map<string, DependencyGroup>()

    function getGroup(moduleId: string | null) {
      const key = moduleId ?? NO_MODULE_GROUP_KEY
      const existing = groups.get(key)
      if (existing) return existing
      const nextGroup: DependencyGroup = {
        moduleId,
        moduleLabel: !moduleId
          ? "No module"
          : (moduleById.get(moduleId)?.name ?? "Unknown module"),
        relationIssues: [],
        parentIssues: [],
      }
      groups.set(key, nextGroup)
      return nextGroup
    }

    for (const issue of relationIssues) {
      getGroup(issue.missingClass.module_id).relationIssues.push(issue)
    }
    for (const issue of parentIssues) {
      getGroup(issue.parent.module_id).parentIssues.push(issue)
    }

    return sortModuleGroups(Array.from(groups.values()))
  }, [moduleById, parentIssues, relationIssues])

  function clearAdjustmentsForModule(moduleId: string) {
    updateSet(setExtraSelectedClassIds, (next) => {
      for (const classId of Array.from(next)) {
        if (classById.get(classId)?.module_id === moduleId) next.delete(classId)
      }
    })
    updateSet(setExcludedRelationIds, (next) => {
      for (const relationId of Array.from(next)) {
        const relation = relationById.get(relationId)
        if (!relation) continue
        const domainClass = classById.get(relation.domain_class_id)
        const rangeClass = classById.get(relation.range_class_id)
        if (
          domainClass?.module_id === moduleId ||
          rangeClass?.module_id === moduleId
        ) {
          next.delete(relationId)
        }
      }
    })
    updateSet(setDroppedParentClassIds, (next) => {
      for (const childId of Array.from(next)) {
        const child = classById.get(childId)
        const parent = child?.parent_class_id
          ? classById.get(child.parent_class_id)
          : null
        if (child?.module_id === moduleId || parent?.module_id === moduleId) {
          next.delete(childId)
        }
      }
    })
  }

  function handleToggleModule(moduleId: string) {
    const isSelected = selectedModuleIds.has(moduleId)
    updateSet(setSelectedModuleIds, (next) => {
      if (isSelected) {
        next.delete(moduleId)
        return
      }
      next.add(moduleId)
    })
    if (!isSelected) clearAdjustmentsForModule(moduleId)
  }

  function handleIncludeClass(classId: string) {
    updateSet(setExtraSelectedClassIds, (next) => {
      next.add(classId)
    })
  }

  function handleRemoveExtraClass(classId: string) {
    updateSet(setExtraSelectedClassIds, (next) => {
      next.delete(classId)
    })
  }

  function handleExcludeRelation(relationId: string) {
    updateSet(setExcludedRelationIds, (next) => {
      next.add(relationId)
    })
  }

  function handleRestoreRelation(relationId: string) {
    updateSet(setExcludedRelationIds, (next) => {
      next.delete(relationId)
    })
  }

  function handleDropParent(childId: string) {
    updateSet(setDroppedParentClassIds, (next) => {
      next.add(childId)
    })
  }

  function handleRestoreParent(childId: string) {
    updateSet(setDroppedParentClassIds, (next) => {
      next.delete(childId)
    })
  }

  function handleIncludeDependencyGroup(group: DependencyGroup) {
    const groupModuleId = group.moduleId
    const dependencyClassIds = new Set<string>()

    for (const issue of group.relationIssues) {
      dependencyClassIds.add(issue.missingClass.id)
    }
    for (const issue of group.parentIssues) {
      dependencyClassIds.add(issue.parent.id)
    }

    if (groupModuleId) {
      updateSet(setSelectedModuleIds, (next) => {
        next.add(groupModuleId)
      })
      clearAdjustmentsForModule(groupModuleId)
    } else {
      updateSet(setExtraSelectedClassIds, (next) => {
        for (const classId of dependencyClassIds) {
          next.add(classId)
        }
      })
    }

    updateSet(setExcludedRelationIds, (next) => {
      for (const relationId of Array.from(next)) {
        const relation = relationById.get(relationId)
        if (!relation) continue
        const domainClass = classById.get(relation.domain_class_id)
        const rangeClass = classById.get(relation.range_class_id)
        const domainSelected = domainClass
          ? selectedClassIds.has(domainClass.id)
          : false
        const rangeSelected = rangeClass
          ? selectedClassIds.has(rangeClass.id)
          : false
        const relationGroupModuleId =
          domainSelected && !rangeSelected
            ? (rangeClass?.module_id ?? null)
            : rangeSelected && !domainSelected
              ? (domainClass?.module_id ?? null)
              : (domainClass?.module_id ?? rangeClass?.module_id ?? null)

        if (relationGroupModuleId === groupModuleId) next.delete(relationId)
      }
    })

    updateSet(setDroppedParentClassIds, (next) => {
      for (const childId of Array.from(next)) {
        const child = classById.get(childId)
        const parent = child?.parent_class_id
          ? classById.get(child.parent_class_id)
          : null
        if (!parent) continue
        const isRelatedToGroup = groupModuleId
          ? parent.module_id === groupModuleId
          : dependencyClassIds.has(parent.id)
        if (isRelatedToGroup) next.delete(childId)
      }
    })
  }

  function handleIncludeAllDependencies() {
    updateSet(setSelectedModuleIds, (next) => {
      for (const group of dependencyGroups) {
        if (group.moduleId) next.add(group.moduleId)
      }
    })
    updateSet(setExtraSelectedClassIds, (next) => {
      for (const group of dependencyGroups) {
        if (!group.moduleId) {
          for (const issue of group.relationIssues)
            next.add(issue.missingClass.id)
          for (const issue of group.parentIssues) next.add(issue.parent.id)
        }
      }
    })
    setExcludedRelationIds(new Set())
    setDroppedParentClassIds(new Set())
  }

  function handleExcludeAllDependencies() {
    updateSet(setExcludedRelationIds, (next) => {
      for (const issue of relationIssues) {
        next.add(issue.relation.id)
      }
    })
    updateSet(setDroppedParentClassIds, (next) => {
      for (const issue of parentIssues) {
        next.add(issue.child.id)
      }
    })
  }

  function handleExcludeDependencyGroup(group: DependencyGroup) {
    updateSet(setExcludedRelationIds, (next) => {
      for (const issue of group.relationIssues) {
        next.add(issue.relation.id)
      }
    })
    updateSet(setDroppedParentClassIds, (next) => {
      for (const issue of group.parentIssues) {
        next.add(issue.child.id)
      }
    })
  }

  function handleDependencyGroupOpenChange(groupKey: string, open: boolean) {
    updateSet(setExpandedDependencyGroups, (next) => {
      if (open) {
        next.add(groupKey)
      } else {
        next.delete(groupKey)
      }
    })
  }

  function handleSelectAllModules() {
    setSelectedModuleIds(getDefaultModuleSelection(modules))
    setExtraSelectedClassIds(new Set())
    setExcludedRelationIds(new Set())
    setDroppedParentClassIds(new Set())
  }

  function handleDeselectAllModules() {
    setSelectedModuleIds(new Set())
  }

  return {
    areAllModulesSelected,
    classById,
    dependencyGroups,
    droppedParents,
    excludedRelations,
    expandedDependencyGroups,
    exportLanguage,
    exportLanguageOptions,
    exportRelationIds,
    extraSelectedClasses,
    missingTranslationBehavior,
    missingTranslationSummary,
    missingTranslationSummaryText,
    moduleCounts,
    parentIssues,
    relationIssues,
    selectedClassIds,
    selectedExportLanguage,
    selectedModuleIds,
    unresolvedCount,
    getModuleLabel,
    handleDependencyGroupOpenChange,
    handleDeselectAllModules,
    handleDropParent,
    handleExcludeAllDependencies,
    handleExcludeDependencyGroup,
    handleExcludeRelation,
    handleIncludeAllDependencies,
    handleIncludeClass,
    handleIncludeDependencyGroup,
    handleRemoveExtraClass,
    handleRestoreParent,
    handleRestoreRelation,
    handleSelectAllModules,
    handleToggleModule,
    resetSelectionState,
    setExportLanguage,
    setMissingTranslationBehavior,
  }
}
