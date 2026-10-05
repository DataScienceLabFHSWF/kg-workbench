"use client"

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react"

import { useQuery } from "@tanstack/react-query"
import {
  Archive,
  ChevronDown,
  ChevronLeft,
  GitBranch,
  RotateCcw,
} from "lucide-react"

import { MultiSelectDropdown } from "@/components/shared/multi-select-dropdown"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { getReviewStatusStyles } from "@/lib/colors"
import { EFFECTIVE_STATUS_LABELS, EFFECTIVE_STATUSES } from "@/lib/types"
import { cn } from "@/lib/utils"

import { useDocumentsWorkspace } from "../../../hooks/documents-workspace-state"
import {
  fetchDocumentEntities,
  fetchDocumentFacts,
  fetchDocumentWithSections,
  fetchOntologyForDocument,
} from "../../../server/queries"
import {
  areDocumentFiltersAtDefaults,
  DOCUMENT_COMPLETENESS_FILTER_LABELS,
  DOCUMENT_FILTER_ALL,
  DOCUMENT_MODULE_LINK_FILTER_LABELS,
  DOCUMENT_SCOPE_FILTER_LABELS,
  isAllDocumentFilterValue,
  NO_MODULE_FILTER_ID,
  type DocumentEntityFilter,
  type DocumentSingleFilterValue,
} from "../../../utils/document-filters"
import { hasAllEffectiveStatuses } from "../../../utils/fact-status"
import { DocumentFiltersToolbarFilterGroup } from "./document-filters-toolbar-filter-group"
import { DocumentFiltersToolbarGroupedSelect } from "./document-filters-toolbar-grouped-select"
import { DocumentFiltersToolbarNestedSelect } from "./document-filters-toolbar-nested-select"
import { DocumentFiltersToolbarRoleFilterStack } from "./document-filters-toolbar-role-filter-stack"
import { DocumentFiltersToolbarSelect } from "./document-filters-toolbar-select"
import type { DocumentFiltersToolbarGroupedOption } from "./types"
import {
  buildEntityOptionData,
  buildExtractedRelationOptionData,
  buildRoleEntityOptionData,
  findNamedFilterOption,
  toCompletenessFilter,
  toEntitySelectValue,
  toExtractedRelationSelectValue,
  toModuleLinkFilter,
  toNamedOption,
  toScopeFilter,
  toSingleSelectValue,
  withSelectedGroupedOption,
  withSelectedOption,
} from "./utils"

type FilterRole = typeof DOCUMENT_FILTER_ALL | "subject" | "object"

function ToolbarField({
  label,
  children,
}: {
  label: string
  children: ReactNode
}) {
  return (
    <div className="flex min-w-[5.5rem] flex-1 flex-col gap-1">
      <span className="px-1 text-[11px] font-medium text-muted-foreground">
        {label}
      </span>
      {children}
    </div>
  )
}

function toSelectedClassOption(
  value: DocumentSingleFilterValue,
  groupId: string,
  groupLabel: string
): DocumentFiltersToolbarGroupedOption | null {
  if (isAllDocumentFilterValue(value)) {
    return null
  }

  return {
    value: value.id,
    label: value.name,
    groupId,
    groupLabel,
  }
}

export function DocumentFiltersToolbar() {
  const [isExpanded, setIsExpanded] = useState(false)
  const previousExpandableFilterStateRef = useRef<readonly boolean[] | null>(
    null
  )
  const {
    selectedDocumentId: documentId,
    sharedFilters: filters,
    nodesOnly,
    toggleStatus,
    selectAllStatuses,
    setSection,
    setModule,
    setClass,
    setSubjectClass,
    setObjectClass,
    setRelation,
    setEntity,
    setSubjectEntity,
    setObjectEntity,
    setExtractedRelation,
    setScope,
    setModuleLink,
    setCompleteness,
    setNodesOnly,
    viewMode,
    resetWorkspace,
  } = useDocumentsWorkspace()
  const { data: document } = useQuery({
    queryKey: ["document", documentId],
    queryFn: () => fetchDocumentWithSections(documentId!),
    enabled: !!documentId,
  })
  const { data: facts = [] } = useQuery({
    queryKey: ["document-facts", documentId],
    queryFn: () => fetchDocumentFacts(documentId!),
    enabled: !!documentId,
  })
  const { data: entities = [] } = useQuery({
    queryKey: ["document-entities", documentId],
    queryFn: () => fetchDocumentEntities(documentId!),
    enabled: !!documentId,
  })
  const { data: ontology } = useQuery({
    queryKey: ["document-ontology", documentId],
    queryFn: () => fetchOntologyForDocument(documentId!),
    enabled: !!documentId,
  })

  const statusOptions = EFFECTIVE_STATUSES.map((status) => ({
    value: status,
    label: EFFECTIVE_STATUS_LABELS[status],
  }))
  const sectionOptions = withSelectedOption(
    (document?.sections ?? []).map((section) => ({
      value: section.id,
      label: section.title || "Untitled chapter",
    })),
    isAllDocumentFilterValue(filters.section)
      ? null
      : { value: filters.section.id, label: filters.section.name }
  )
  const moduleOptions = withSelectedOption(
    (ontology?.modules ?? []).map((module) => ({
      value: module.id,
      label: module.name,
    })),
    toNamedOption(filters.module)
  )

  const moduleLabelById = useMemo(
    () =>
      new Map(
        (ontology?.modules ?? []).map((module) => [module.id, module.name])
      ),
    [ontology]
  )
  const classModuleById = useMemo(
    () =>
      new Map(
        (ontology?.classes ?? []).map((cls) => [
          cls.id,
          cls.module_id ?? NO_MODULE_FILTER_ID,
        ])
      ),
    [ontology]
  )

  const orderedClasses = [
    ...(ontology?.modules ?? []).flatMap((module) =>
      (ontology?.classes ?? []).filter((cls) => cls.module_id === module.id)
    ),
    ...(ontology?.classes ?? []).filter((cls) => !cls.module_id),
  ]
  const baseClassOptions = orderedClasses.map((cls) => ({
    value: cls.id,
    label: cls.name,
    groupId: cls.module_id,
    groupLabel: cls.module_id
      ? (moduleLabelById.get(cls.module_id) ?? "Unknown module")
      : "No module",
  }))
  const classOptions = withSelectedGroupedOption(
    withSelectedGroupedOption(
      withSelectedGroupedOption(
        baseClassOptions,
        toSelectedClassOption(
          filters.subjectClass,
          "__selected_subject_class__",
          "Current subject selection"
        )
      ),
      toSelectedClassOption(
        filters.objectClass,
        "__selected_object_class__",
        "Current object selection"
      )
    ),
    toSelectedClassOption(
      filters.class,
      "__selected_class__",
      "Current broad selection"
    )
  )

  const orderedRelations = [
    ...(ontology?.modules ?? []).flatMap((module) =>
      (ontology?.relations ?? []).filter(
        (relation) =>
          classModuleById.get(relation.domain_class_id) === module.id
      )
    ),
    ...(ontology?.relations ?? []).filter(
      (relation) =>
        (classModuleById.get(relation.domain_class_id) ??
          NO_MODULE_FILTER_ID) === NO_MODULE_FILTER_ID
    ),
  ]
  const relationOptions = withSelectedGroupedOption(
    orderedRelations.map((relation) => {
      const moduleId = classModuleById.get(relation.domain_class_id) ?? null

      return {
        value: relation.id,
        label: relation.name,
        groupId: moduleId,
        groupLabel:
          moduleId && moduleId !== NO_MODULE_FILTER_ID
            ? (moduleLabelById.get(moduleId) ?? "Unknown module")
            : "No module",
      }
    }),
    isAllDocumentFilterValue(filters.relation)
      ? null
      : {
          value: filters.relation.id,
          label: filters.relation.name,
          groupId: "__selected_relation__",
          groupLabel: "Current selection",
        }
  )

  const extractedRelationOptionData = useMemo(
    () =>
      buildExtractedRelationOptionData({
        facts,
        entities,
        ontology,
        filters,
      }),
    [entities, facts, filters, ontology]
  )
  const anyEntityOptionData = useMemo(
    () =>
      buildEntityOptionData({
        facts,
        entities,
        ontology,
        filters,
      }),
    [entities, facts, filters, ontology]
  )
  const entityFilterByValue = useMemo(
    () =>
      new Map(
        anyEntityOptionData.leaves.map((option) => [
          option.value,
          option.filter,
        ])
      ),
    [anyEntityOptionData.leaves]
  )
  const extractedRelationFilterByValue = useMemo(
    () =>
      new Map(
        extractedRelationOptionData.leaves.map((option) => [
          option.value,
          option.filter,
        ])
      ),
    [extractedRelationOptionData.leaves]
  )

  const subjectEntityOptionData = useMemo(
    () =>
      buildRoleEntityOptionData({
        facts,
        entities,
        ontology,
        filters,
        role: "subject",
      }),
    [entities, facts, filters, ontology]
  )
  const objectEntityOptionData = useMemo(
    () =>
      buildRoleEntityOptionData({
        facts,
        entities,
        ontology,
        filters,
        role: "object",
      }),
    [entities, facts, filters, ontology]
  )

  const subjectEntityFilterByValue = useMemo(
    () =>
      new Map(
        subjectEntityOptionData.leaves.map((option) => [
          option.value,
          option.filter,
        ])
      ),
    [subjectEntityOptionData.leaves]
  )
  const objectEntityFilterByValue = useMemo(
    () =>
      new Map(
        objectEntityOptionData.leaves.map((option) => [
          option.value,
          option.filter,
        ])
      ),
    [objectEntityOptionData.leaves]
  )

  const scopeOptions = Object.entries(DOCUMENT_SCOPE_FILTER_LABELS)
    .filter(([value]) => value !== DOCUMENT_FILTER_ALL)
    .map(([value, label]) => ({
      value,
      label,
    }))
  const moduleLinkOptions = Object.entries(DOCUMENT_MODULE_LINK_FILTER_LABELS)
    .filter(([value]) => value !== DOCUMENT_FILTER_ALL)
    .map(([value, label]) => ({
      value,
      label,
    }))
  const completenessOptions = Object.entries(
    DOCUMENT_COMPLETENESS_FILTER_LABELS
  )
    .filter(([value]) => value !== DOCUMENT_FILTER_ALL)
    .map(([value, label]) => ({
      value,
      label,
    }))
  const controlsDisabled = !documentId
  const showIsolateNodes = viewMode === "graph"
  const statusFilterActive = !hasAllEffectiveStatuses(filters.statuses)
  const sectionFilterActive = !isAllDocumentFilterValue(filters.section)
  const moduleFilterActive = !isAllDocumentFilterValue(filters.module)
  const classFilterActive = !isAllDocumentFilterValue(filters.class)
  const relationFilterActive = !isAllDocumentFilterValue(filters.relation)
  const entityFilterActive = !isAllDocumentFilterValue(filters.entity)
  const extractedRelationFilterActive = !isAllDocumentFilterValue(
    filters.extractedRelation
  )
  const moduleLinkFilterActive = filters.moduleLink !== DOCUMENT_FILTER_ALL
  const scopeFilterActive = filters.scope !== DOCUMENT_FILTER_ALL
  const completenessFilterActive = filters.completeness !== DOCUMENT_FILTER_ALL
  const subjectEntityFilterActive = !isAllDocumentFilterValue(
    filters.subjectEntity
  )
  const subjectClassFilterActive = !isAllDocumentFilterValue(
    filters.subjectClass
  )
  const objectEntityFilterActive = !isAllDocumentFilterValue(
    filters.objectEntity
  )
  const objectClassFilterActive = !isAllDocumentFilterValue(filters.objectClass)
  const isolateNodesActive = showIsolateNodes && nodesOnly
  const resetDisabled =
    controlsDisabled || (areDocumentFiltersAtDefaults(filters) && !nodesOnly)

  const activeFilterCount = [
    statusFilterActive,
    sectionFilterActive,
    moduleLinkFilterActive,
    scopeFilterActive,
    completenessFilterActive,
    moduleFilterActive,
    classFilterActive,
    subjectClassFilterActive,
    objectClassFilterActive,
    relationFilterActive,
    entityFilterActive,
    subjectEntityFilterActive,
    objectEntityFilterActive,
    extractedRelationFilterActive,
    isolateNodesActive,
  ].filter(Boolean).length
  const resetLabel = `Reset ${activeFilterCount} ${
    activeFilterCount === 1 ? "filter" : "filters"
  }`
  const compactRowGridClass = showIsolateNodes
    ? "grid min-w-0 gap-2.5 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.1fr)_minmax(0,0.72fr)_minmax(0,1.1fr)_minmax(0,0.72fr)_minmax(0,0.72fr)_minmax(0,0.95fr)]"
    : "grid min-w-0 gap-2.5 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.1fr)_minmax(0,0.72fr)_minmax(0,1.1fr)_minmax(0,0.72fr)_minmax(0,0.72fr)]"

  useEffect(() => {
    const expandableFilterState = [
      relationFilterActive,
      classFilterActive,
      subjectClassFilterActive,
      objectClassFilterActive,
      entityFilterActive,
      subjectEntityFilterActive,
      objectEntityFilterActive,
      extractedRelationFilterActive,
    ] as const
    const previousExpandableFilterState =
      previousExpandableFilterStateRef.current

    if (previousExpandableFilterState && !isExpanded) {
      const hasNewExpandedRowFilter = expandableFilterState.some(
        (isActive, index) => !previousExpandableFilterState[index] && isActive
      )

      if (hasNewExpandedRowFilter) {
        const frameId = window.requestAnimationFrame(() => {
          setIsExpanded(true)
        })

        previousExpandableFilterStateRef.current = expandableFilterState
        return () => window.cancelAnimationFrame(frameId)
      }
    }

    previousExpandableFilterStateRef.current = expandableFilterState
  }, [
    classFilterActive,
    entityFilterActive,
    extractedRelationFilterActive,
    isExpanded,
    objectClassFilterActive,
    objectEntityFilterActive,
    relationFilterActive,
    subjectClassFilterActive,
    subjectEntityFilterActive,
  ])

  function clearBroadClassFilter() {
    if (!isAllDocumentFilterValue(filters.class)) {
      setClass(DOCUMENT_FILTER_ALL)
    }
  }

  function clearBroadEntityFilter() {
    if (!isAllDocumentFilterValue(filters.entity)) {
      setEntity(DOCUMENT_FILTER_ALL)
    }
  }

  function getRoleClassFilter(role: FilterRole) {
    if (role === DOCUMENT_FILTER_ALL) {
      return filters.class
    }

    return role === "subject" ? filters.subjectClass : filters.objectClass
  }

  function getRoleEntityFilter(role: FilterRole) {
    if (role === DOCUMENT_FILTER_ALL) {
      return filters.entity
    }

    return role === "subject" ? filters.subjectEntity : filters.objectEntity
  }

  function setRoleClassFilter(
    role: FilterRole,
    value: DocumentSingleFilterValue
  ) {
    if (role === DOCUMENT_FILTER_ALL) {
      setSubjectClass(DOCUMENT_FILTER_ALL)
      setObjectClass(DOCUMENT_FILTER_ALL)
      setClass(value)
      return
    }

    clearBroadClassFilter()
    if (role === "subject") {
      setSubjectClass(value)
      return
    }

    setObjectClass(value)
  }

  function clearRoleClassFilter(role: FilterRole) {
    setRoleClassFilter(role, DOCUMENT_FILTER_ALL)
  }

  function moveRoleClassFilter(fromRole: FilterRole, toRole: FilterRole) {
    const nextValue = getRoleClassFilter(fromRole)
    if (fromRole === toRole) {
      return
    }

    if (toRole === DOCUMENT_FILTER_ALL) {
      setSubjectClass(DOCUMENT_FILTER_ALL)
      setObjectClass(DOCUMENT_FILTER_ALL)
      setClass(nextValue)
      return
    }

    if (fromRole === DOCUMENT_FILTER_ALL) {
      setClass(DOCUMENT_FILTER_ALL)
      setRoleClassFilter(toRole, nextValue)
      return
    }

    clearBroadClassFilter()
    clearRoleClassFilter(fromRole)
    setRoleClassFilter(toRole, nextValue)
  }

  function setRoleEntityFilter(
    role: FilterRole,
    value: typeof DOCUMENT_FILTER_ALL | DocumentEntityFilter
  ) {
    if (role === DOCUMENT_FILTER_ALL) {
      setSubjectEntity(DOCUMENT_FILTER_ALL)
      setObjectEntity(DOCUMENT_FILTER_ALL)
      setEntity(value)
      return
    }

    clearBroadEntityFilter()
    if (role === "subject") {
      setSubjectEntity(value)
      return
    }

    setObjectEntity(value)
  }

  function clearRoleEntityFilter(role: FilterRole) {
    setRoleEntityFilter(role, DOCUMENT_FILTER_ALL)
  }

  function moveRoleEntityFilter(fromRole: FilterRole, toRole: FilterRole) {
    const nextValue = getRoleEntityFilter(fromRole)
    if (fromRole === toRole) {
      return
    }

    if (toRole === DOCUMENT_FILTER_ALL) {
      setSubjectEntity(DOCUMENT_FILTER_ALL)
      setObjectEntity(DOCUMENT_FILTER_ALL)
      setEntity(nextValue)
      return
    }

    if (fromRole === DOCUMENT_FILTER_ALL) {
      setEntity(DOCUMENT_FILTER_ALL)
      setRoleEntityFilter(toRole, nextValue)
      return
    }

    clearBroadEntityFilter()
    clearRoleEntityFilter(fromRole)
    setRoleEntityFilter(toRole, nextValue)
  }

  return (
    <div className="shrink-0 border-b bg-background/95">
      <div className="rounded-xl border border-border/70 bg-gradient-to-r from-background via-background to-muted/20 shadow-[0_8px_24px_rgba(15,23,42,0.05)]">
        <div className="grid gap-2.5 px-3 py-3 2xl:grid-cols-[minmax(0,1fr)_auto] 2xl:items-start">
          <div className={compactRowGridClass}>
            <ToolbarField label="Status">
              <MultiSelectDropdown
                label="Status"
                options={statusOptions}
                selectedValues={filters.statuses}
                onToggle={toggleStatus}
                onToggleAll={selectAllStatuses}
                onClear={statusFilterActive ? selectAllStatuses : undefined}
                disabled={controlsDisabled}
                hideLabel
                isActive={statusFilterActive}
                getBadgeClassName={(option) =>
                  getReviewStatusStyles(option.value).pillClass
                }
                className="min-h-9 w-full min-w-[5.5rem] justify-between gap-1.5 bg-background/90"
              />
            </ToolbarField>

            <DocumentFiltersToolbarSelect
              label="Chapter"
              options={sectionOptions}
              selectedValue={toSingleSelectValue(filters.section)}
              isActive={sectionFilterActive}
              disabled={controlsDisabled}
              onChange={(value) =>
                setSection(
                  value === DOCUMENT_FILTER_ALL
                    ? DOCUMENT_FILTER_ALL
                    : findNamedFilterOption(value, sectionOptions)
                )
              }
              onClear={() => setSection(DOCUMENT_FILTER_ALL)}
            />

            <DocumentFiltersToolbarSelect
              label="Chapter Scope"
              options={scopeOptions}
              selectedValue={filters.scope}
              isActive={scopeFilterActive}
              disabled={controlsDisabled}
              onChange={(value) => setScope(toScopeFilter(value))}
              onClear={() => setScope(DOCUMENT_FILTER_ALL)}
            />

            <DocumentFiltersToolbarSelect
              label="Module"
              options={moduleOptions}
              selectedValue={toSingleSelectValue(filters.module)}
              isActive={moduleFilterActive}
              disabled={controlsDisabled}
              onChange={(value) =>
                setModule(
                  value === DOCUMENT_FILTER_ALL
                    ? DOCUMENT_FILTER_ALL
                    : findNamedFilterOption(value, moduleOptions)
                )
              }
              onClear={() => setModule(DOCUMENT_FILTER_ALL)}
            />

            <DocumentFiltersToolbarSelect
              label="Module Scope"
              options={moduleLinkOptions}
              selectedValue={filters.moduleLink}
              isActive={moduleLinkFilterActive}
              disabled={controlsDisabled}
              onChange={(value) => setModuleLink(toModuleLinkFilter(value))}
              onClear={() => setModuleLink(DOCUMENT_FILTER_ALL)}
            />

            <DocumentFiltersToolbarSelect
              label="Attributes"
              options={completenessOptions}
              selectedValue={filters.completeness}
              isActive={completenessFilterActive}
              disabled={controlsDisabled}
              onChange={(value) => setCompleteness(toCompletenessFilter(value))}
              onClear={() => setCompleteness(DOCUMENT_FILTER_ALL)}
            />

            {showIsolateNodes ? (
              <ToolbarField label="Node focus">
                <div className="flex min-h-9 items-center gap-3 rounded-md border border-input bg-background px-3">
                  <Switch
                    checked={nodesOnly}
                    onCheckedChange={setNodesOnly}
                    disabled={controlsDisabled}
                    aria-label="Toggle to show only nodes without relations"
                    size="sm"
                  />
                  <span
                    className={cn(
                      "text-sm transition-colors",
                      nodesOnly
                        ? "font-medium text-foreground"
                        : "text-muted-foreground",
                      controlsDisabled && "opacity-50"
                    )}
                  >
                    Hide relations
                  </span>
                </div>
              </ToolbarField>
            ) : null}
          </div>

          <div className="flex min-w-0 items-center justify-end gap-1 2xl:pt-5">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-9 gap-2 px-2 text-primary"
              disabled={resetDisabled}
              onClick={resetWorkspace}
              title={resetLabel}
              aria-label={resetLabel}
            >
              <RotateCcw className="size-4" />
              <span>{resetLabel}</span>
            </Button>

            <button
              type="button"
              disabled={controlsDisabled}
              onClick={() => setIsExpanded((current) => !current)}
              aria-expanded={isExpanded}
              aria-label={isExpanded ? "Collapse filters" : "Expand filters"}
              className={cn(
                "inline-flex h-6 w-6 shrink-0 items-center justify-center self-start rounded-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 2xl:mt-0.5"
              )}
            >
              {isExpanded ? (
                <ChevronDown className="h-3 w-3 shrink-0" />
              ) : (
                <ChevronLeft className="h-3 w-3 shrink-0" />
              )}
            </button>
          </div>
        </div>

        {isExpanded ? (
          <div className="border-t px-3 py-3">
            <div className="grid gap-2.5 2xl:grid-cols-2">
              <DocumentFiltersToolbarFilterGroup
                title="Ontology"
                icon={GitBranch}
              >
                <div className="grid min-w-0 gap-2 xl:grid-cols-[minmax(0,1fr)_minmax(0,2.25fr)]">
                  <DocumentFiltersToolbarGroupedSelect
                    label="Relation"
                    searchPlaceholder="Search ontology relations..."
                    options={relationOptions}
                    selectedValue={toSingleSelectValue(filters.relation)}
                    selectedLabel={
                      isAllDocumentFilterValue(filters.relation)
                        ? undefined
                        : filters.relation.name
                    }
                    isActive={relationFilterActive}
                    emptyLabel="No ontology relations found."
                    disabled={controlsDisabled}
                    onChange={(value) =>
                      setRelation(
                        value === DOCUMENT_FILTER_ALL
                          ? DOCUMENT_FILTER_ALL
                          : findNamedFilterOption(value, relationOptions)
                      )
                    }
                    onClear={() => setRelation(DOCUMENT_FILTER_ALL)}
                  />

                  <DocumentFiltersToolbarRoleFilterStack
                    label="Class"
                    disabled={controlsDisabled}
                    allActive={classFilterActive}
                    subjectActive={subjectClassFilterActive}
                    objectActive={objectClassFilterActive}
                    onMoveSelection={moveRoleClassFilter}
                    onClearRole={clearRoleClassFilter}
                    renderValueControl={(role) => {
                      const roleFilter = getRoleClassFilter(role)

                      return (
                        <DocumentFiltersToolbarGroupedSelect
                          label="Class"
                          searchPlaceholder={
                            role === DOCUMENT_FILTER_ALL
                              ? "Search classes..."
                              : `Search ${role} classes...`
                          }
                          options={classOptions}
                          selectedValue={toSingleSelectValue(roleFilter)}
                          selectedLabel={
                            isAllDocumentFilterValue(roleFilter)
                              ? undefined
                              : roleFilter.name
                          }
                          isActive={!isAllDocumentFilterValue(roleFilter)}
                          hideFieldLabel
                          emptyLabel="No classes found."
                          disabled={controlsDisabled}
                          onChange={(value) =>
                            setRoleClassFilter(
                              role,
                              value === DOCUMENT_FILTER_ALL
                                ? DOCUMENT_FILTER_ALL
                                : findNamedFilterOption(value, classOptions)
                            )
                          }
                          onClear={() => clearRoleClassFilter(role)}
                        />
                      )
                    }}
                  />
                </div>
              </DocumentFiltersToolbarFilterGroup>

              <DocumentFiltersToolbarFilterGroup
                title="Extracted Instances"
                icon={Archive}
              >
                <div className="grid min-w-0 gap-2 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.35fr)]">
                  <DocumentFiltersToolbarNestedSelect
                    label="Relation"
                    searchPlaceholder="Search extracted relations..."
                    options={extractedRelationOptionData.options}
                    selectedValue={toExtractedRelationSelectValue(
                      filters.extractedRelation
                    )}
                    selectedLabel={
                      isAllDocumentFilterValue(filters.extractedRelation)
                        ? undefined
                        : filters.extractedRelation.label
                    }
                    selectedBreadcrumb={
                      extractedRelationOptionData.selectedBreadcrumb
                    }
                    isActive={extractedRelationFilterActive}
                    emptyLabel="No extracted relations found."
                    disabled={controlsDisabled}
                    onChange={(value) =>
                      setExtractedRelation(
                        value === DOCUMENT_FILTER_ALL
                          ? DOCUMENT_FILTER_ALL
                          : (extractedRelationFilterByValue.get(value) ??
                              DOCUMENT_FILTER_ALL)
                      )
                    }
                    onClear={() => setExtractedRelation(DOCUMENT_FILTER_ALL)}
                  />

                  <DocumentFiltersToolbarRoleFilterStack
                    label="Entity"
                    disabled={controlsDisabled}
                    allActive={entityFilterActive}
                    subjectActive={subjectEntityFilterActive}
                    objectActive={objectEntityFilterActive}
                    onMoveSelection={moveRoleEntityFilter}
                    onClearRole={clearRoleEntityFilter}
                    renderValueControl={(role) => {
                      const roleFilter = getRoleEntityFilter(role)
                      const optionData =
                        role === DOCUMENT_FILTER_ALL
                          ? anyEntityOptionData
                          : role === "subject"
                            ? subjectEntityOptionData
                            : objectEntityOptionData
                      const filterByValue =
                        role === DOCUMENT_FILTER_ALL
                          ? entityFilterByValue
                          : role === "subject"
                            ? subjectEntityFilterByValue
                            : objectEntityFilterByValue

                      return (
                        <DocumentFiltersToolbarNestedSelect
                          label="Entity"
                          searchPlaceholder={
                            role === DOCUMENT_FILTER_ALL
                              ? "Search entities..."
                              : `Search ${role} entities...`
                          }
                          options={optionData.options}
                          selectedValue={toEntitySelectValue(roleFilter)}
                          selectedLabel={
                            isAllDocumentFilterValue(roleFilter)
                              ? undefined
                              : roleFilter.label
                          }
                          selectedBreadcrumb={optionData.selectedBreadcrumb}
                          isActive={!isAllDocumentFilterValue(roleFilter)}
                          hideFieldLabel
                          emptyLabel={
                            role === DOCUMENT_FILTER_ALL
                              ? "No entities found."
                              : `No ${role} entities found.`
                          }
                          disabled={controlsDisabled}
                          onChange={(value) =>
                            setRoleEntityFilter(
                              role,
                              value === DOCUMENT_FILTER_ALL
                                ? DOCUMENT_FILTER_ALL
                                : (filterByValue.get(value) ??
                                    DOCUMENT_FILTER_ALL)
                            )
                          }
                          onClear={() => clearRoleEntityFilter(role)}
                        />
                      )
                    }}
                  />
                </div>
              </DocumentFiltersToolbarFilterGroup>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}
