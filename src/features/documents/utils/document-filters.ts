import type { EntityWithAttributes } from "@/domain/documents"
import type { EffectiveStatus } from "@/lib/types"

import type {
  DocumentOntology,
  DocumentWithSections,
  FactWithAnchors,
} from "../server/queries"
import { getFactCompleteness } from "./fact-completeness"
import {
  createAllEffectiveStatuses,
  hasAllEffectiveStatuses,
} from "./fact-status"
import { matchesActiveStatuses } from "./fact-status"

export const DOCUMENT_FILTER_ALL = "all" as const
export const NO_MODULE_FILTER_ID = "__no_module__"
export const CROSS_CHAPTER_SECTION_ID = "__cross_chapter__"

export const DOCUMENT_SCOPE_FILTERS = [
  DOCUMENT_FILTER_ALL,
  "in_chapter",
  "cross_chapter",
] as const

export type DocumentScopeFilter = (typeof DOCUMENT_SCOPE_FILTERS)[number]

export const DOCUMENT_MODULE_LINK_FILTERS = [
  DOCUMENT_FILTER_ALL,
  "inner_module",
  "cross_module",
] as const

export type DocumentModuleLinkFilter =
  (typeof DOCUMENT_MODULE_LINK_FILTERS)[number]

export const DOCUMENT_COMPLETENESS_FILTERS = [
  DOCUMENT_FILTER_ALL,
  "missing_required",
  "complete",
] as const

export type DocumentCompletenessFilter =
  (typeof DOCUMENT_COMPLETENESS_FILTERS)[number]

export type NamedFilter = { id: string; name: string }
export type DocumentSingleFilterValue = NamedFilter | typeof DOCUMENT_FILTER_ALL

export interface DocumentEntityFilter {
  label: string
  text: string
  entityId?: string | null
}

export interface DocumentExtractedRelationFilter {
  label: string
  text: string
}

export type DocumentConcreteFilterValue<T> = T | typeof DOCUMENT_FILTER_ALL

export interface DocumentEntityOption extends DocumentEntityFilter {
  classId: string | null
}

export interface DocumentExtractedRelationOption extends DocumentExtractedRelationFilter {
  relationTypeId: string | null
}

export interface FactEntityReference {
  text: string
  entityId?: string | null
  classId: string | null
}

export interface DocumentFiltersState {
  statuses: Set<EffectiveStatus>
  section: DocumentSingleFilterValue
  module: DocumentSingleFilterValue
  class: DocumentSingleFilterValue
  subjectClass: DocumentSingleFilterValue
  objectClass: DocumentSingleFilterValue
  relation: DocumentSingleFilterValue
  entity: DocumentConcreteFilterValue<DocumentEntityFilter>
  subjectEntity: DocumentConcreteFilterValue<DocumentEntityFilter>
  objectEntity: DocumentConcreteFilterValue<DocumentEntityFilter>
  extractedRelation: DocumentConcreteFilterValue<DocumentExtractedRelationFilter>
  scope: DocumentScopeFilter
  moduleLink: DocumentModuleLinkFilter
  completeness: DocumentCompletenessFilter
}

export const DOCUMENT_SCOPE_FILTER_LABELS: Record<DocumentScopeFilter, string> =
  {
    all: "All",
    in_chapter: "In Chapter",
    cross_chapter: "Cross Chapter",
  }

export const DOCUMENT_MODULE_LINK_FILTER_LABELS: Record<
  DocumentModuleLinkFilter,
  string
> = {
  all: "All",
  inner_module: "Inner-module",
  cross_module: "Cross-module",
}

export const DOCUMENT_COMPLETENESS_FILTER_LABELS: Record<
  DocumentCompletenessFilter,
  string
> = {
  all: "All",
  missing_required: "Missing required",
  complete: "Complete",
}

export interface FactFilterState {
  anchorFilter: string | null
  sharedFilters: DocumentFiltersState
  ontology?: DocumentOntology | null
  entitiesById?: Map<string, EntityWithAttributes>
}

interface ModuleLookup {
  classModuleById: Map<string, string>
  relationModuleById: Map<string, string>
}

export interface FactSectionGroup {
  sectionId: string
  sectionTitle: string | null
  filterKind: "section" | "cross_chapter"
  facts: FactWithAnchors[]
}

export function createDefaultDocumentFiltersState(): DocumentFiltersState {
  return {
    statuses: createAllEffectiveStatuses(),
    section: DOCUMENT_FILTER_ALL,
    module: DOCUMENT_FILTER_ALL,
    class: DOCUMENT_FILTER_ALL,
    subjectClass: DOCUMENT_FILTER_ALL,
    objectClass: DOCUMENT_FILTER_ALL,
    relation: DOCUMENT_FILTER_ALL,
    entity: DOCUMENT_FILTER_ALL,
    subjectEntity: DOCUMENT_FILTER_ALL,
    objectEntity: DOCUMENT_FILTER_ALL,
    extractedRelation: DOCUMENT_FILTER_ALL,
    scope: DOCUMENT_FILTER_ALL,
    moduleLink: DOCUMENT_FILTER_ALL,
    completeness: DOCUMENT_FILTER_ALL,
  }
}

export function isAllDocumentFilterValue(
  value: unknown
): value is typeof DOCUMENT_FILTER_ALL {
  return value === DOCUMENT_FILTER_ALL
}

export function getDocumentFilterId(
  value: DocumentSingleFilterValue
): string | null {
  return isAllDocumentFilterValue(value) ? null : value.id
}

// Checks whether every shared filter still matches the toolbar's default state.
export function areDocumentFiltersAtDefaults(
  filters: DocumentFiltersState
): boolean {
  return (
    hasAllEffectiveStatuses(filters.statuses) &&
    isAllDocumentFilterValue(filters.section) &&
    isAllDocumentFilterValue(filters.module) &&
    isAllDocumentFilterValue(filters.class) &&
    isAllDocumentFilterValue(filters.subjectClass) &&
    isAllDocumentFilterValue(filters.objectClass) &&
    isAllDocumentFilterValue(filters.relation) &&
    isAllDocumentFilterValue(filters.entity) &&
    isAllDocumentFilterValue(filters.subjectEntity) &&
    isAllDocumentFilterValue(filters.objectEntity) &&
    isAllDocumentFilterValue(filters.extractedRelation) &&
    filters.scope === DOCUMENT_FILTER_ALL &&
    filters.moduleLink === DOCUMENT_FILTER_ALL &&
    filters.completeness === DOCUMENT_FILTER_ALL
  )
}

export function filterFacts(
  facts: FactWithAnchors[],
  filters: FactFilterState
): FactWithAnchors[] {
  const moduleLookup = createModuleLookup(filters.ontology)

  return facts.filter((fact) => matchesBaseFilters(fact, filters, moduleLookup))
}

export function groupFactsBySection(
  facts: FactWithAnchors[],
  doc: DocumentWithSections | undefined
): FactSectionGroup[] {
  const sectionOrder = doc?.sections.map((section) => section.id) ?? []
  const sectionTitles = new Map(
    doc?.sections.map((section) => [section.id, section.title]) ?? []
  )

  const groups = new Map<string, FactWithAnchors[]>()
  const crossChapter: FactWithAnchors[] = []

  for (const fact of facts) {
    if (fact.is_cross_chapter) {
      crossChapter.push(fact)
      continue
    }

    const sectionId = fact.anchors.find(
      (anchor) => anchor.section_id
    )?.section_id
    if (!sectionId) {
      crossChapter.push(fact)
      continue
    }

    const existing = groups.get(sectionId) ?? []
    existing.push(fact)
    groups.set(sectionId, existing)
  }

  const orderedGroups: FactSectionGroup[] = sectionOrder
    .filter((sectionId) => groups.has(sectionId))
    .map((sectionId) => ({
      sectionId,
      sectionTitle: sectionTitles.get(sectionId) ?? sectionId,
      filterKind: "section" as const,
      facts: groups.get(sectionId)!,
    }))

  if (crossChapter.length > 0) {
    orderedGroups.push({
      sectionId: CROSS_CHAPTER_SECTION_ID,
      sectionTitle: "Cross-Chapter",
      filterKind: "cross_chapter" as const,
      facts: crossChapter,
    })
  }

  return orderedGroups
}

export function getMatchingSectionIds(
  facts: FactWithAnchors[],
  filters: FactFilterState
): Set<string> {
  const matchingSectionIds = new Set<string>()
  const moduleLookup = createModuleLookup(filters.ontology)

  for (const fact of facts) {
    if (!matchesBaseFilters(fact, filters, moduleLookup)) continue

    for (const anchor of fact.anchors) {
      if (anchor.section_id) {
        matchingSectionIds.add(anchor.section_id)
      }
    }
  }

  return matchingSectionIds
}

function matchesBaseFilters(
  fact: FactWithAnchors,
  filters: FactFilterState,
  moduleLookup: ModuleLookup | null
): boolean {
  if (!matchesScopeFilter(fact, filters.sharedFilters.scope)) {
    return false
  }

  if (
    !matchesSectionFilter(
      fact,
      getDocumentFilterId(filters.sharedFilters.section)
    )
  ) {
    return false
  }

  if (filters.anchorFilter) {
    if (
      !fact.anchors.some(
        (anchor) => anchor.paragraph_id === filters.anchorFilter
      )
    ) {
      return false
    }
  }

  const moduleFilterId = getDocumentFilterId(filters.sharedFilters.module)
  if (
    moduleFilterId &&
    !matchesModuleFilter(fact, moduleFilterId, moduleLookup)
  ) {
    return false
  }

  const classFilterId = getDocumentFilterId(filters.sharedFilters.class)
  if (classFilterId) {
    if (
      fact.subject_class_id !== classFilterId &&
      fact.object_class_id !== classFilterId
    ) {
      return false
    }
  }

  const subjectClassFilterId = getDocumentFilterId(
    filters.sharedFilters.subjectClass
  )
  if (subjectClassFilterId && fact.subject_class_id !== subjectClassFilterId) {
    return false
  }

  const objectClassFilterId = getDocumentFilterId(
    filters.sharedFilters.objectClass
  )
  if (objectClassFilterId && fact.object_class_id !== objectClassFilterId) {
    return false
  }

  const relationFilterId = getDocumentFilterId(filters.sharedFilters.relation)
  if (relationFilterId && fact.relation_type_id !== relationFilterId) {
    return false
  }

  if (!matchesEntityFilter(fact, filters.sharedFilters.entity)) {
    return false
  }

  if (!matchesSubjectEntity(fact, filters.sharedFilters.subjectEntity)) {
    return false
  }

  if (!matchesObjectEntity(fact, filters.sharedFilters.objectEntity)) {
    return false
  }

  if (
    !matchesExtractedRelationFilter(
      fact,
      filters.sharedFilters.extractedRelation
    )
  ) {
    return false
  }

  if (
    !matchesModuleLinkFilter(
      fact,
      filters.sharedFilters.moduleLink,
      moduleLookup
    )
  ) {
    return false
  }

  if (!matchesActiveStatuses(fact, filters.sharedFilters.statuses)) {
    return false
  }

  if (
    !matchesCompletenessFilter(
      fact,
      filters.sharedFilters.completeness,
      filters.ontology,
      filters.entitiesById
    )
  ) {
    return false
  }

  return true
}

function matchesScopeFilter(
  fact: FactWithAnchors,
  scope: DocumentFiltersState["scope"]
): boolean {
  if (scope === DOCUMENT_FILTER_ALL) return true
  if (scope === "in_chapter") return !fact.is_cross_chapter
  return fact.is_cross_chapter
}

function matchesModuleLinkFilter(
  fact: FactWithAnchors,
  moduleLink: DocumentModuleLinkFilter,
  moduleLookup: ModuleLookup | null
): boolean {
  if (moduleLink === DOCUMENT_FILTER_ALL || !moduleLookup) return true

  const subjectModuleId = getFactClassModuleId(
    fact.subject_class_id,
    moduleLookup
  )
  const objectModuleId = getFactClassModuleId(
    fact.object_class_id,
    moduleLookup
  )
  const isCrossModule = subjectModuleId !== objectModuleId

  return moduleLink === "cross_module" ? isCrossModule : !isCrossModule
}

function matchesSectionFilter(
  fact: FactWithAnchors,
  sectionId: string | null
): boolean {
  if (!sectionId) return true
  if (fact.is_cross_chapter) return false

  return fact.anchors.some((anchor) => anchor.section_id === sectionId)
}

function matchesEntityFilter(
  fact: FactWithAnchors,
  filter: DocumentFiltersState["entity"]
): boolean {
  if (isAllDocumentFilterValue(filter)) {
    return true
  }

  return filter.entityId
    ? fact.subject_entity_id === filter.entityId ||
        fact.object_entity_id === filter.entityId
    : fact.subject_text === filter.text || fact.object_text === filter.text
}

function matchesExtractedRelationFilter(
  fact: FactWithAnchors,
  filter: DocumentFiltersState["extractedRelation"]
): boolean {
  if (isAllDocumentFilterValue(filter)) {
    return true
  }

  return fact.relation_text === filter.text
}

export function matchesFactEntity(
  entity: FactEntityReference,
  filter: DocumentFiltersState["entity"]
): boolean {
  if (isAllDocumentFilterValue(filter)) {
    return true
  }

  if (filter.entityId) {
    return entity.entityId === filter.entityId
  }

  return entity.text === filter.text
}

export function createFactEntityReference(
  text: string,
  entityId: string | null | undefined,
  classId: string | null
): FactEntityReference {
  return {
    text,
    entityId,
    classId,
  }
}

export function getEntityFilterValue(filter: DocumentEntityFilter): string {
  if (filter.entityId) {
    return `entity:${filter.entityId}`
  }

  return `text:${filter.text}`
}

export function getExtractedRelationFilterValue(
  filter: DocumentExtractedRelationFilter
): string {
  return `relation-text:${filter.text}`
}

export function matchesDocumentEntityFilter(
  filter: DocumentFiltersState["entity"],
  entityId: string | null | undefined,
  text: string
): boolean {
  if (isAllDocumentFilterValue(filter)) {
    return false
  }

  if (filter.entityId) {
    return entityId === filter.entityId
  }

  return text === filter.text
}

export function matchesDocumentExtractedRelationFilter(
  filter: DocumentFiltersState["extractedRelation"],
  text: string
): boolean {
  if (isAllDocumentFilterValue(filter)) {
    return false
  }

  return filter.text === text
}

export function matchesSubjectEntity(
  fact: FactWithAnchors,
  filter: DocumentFiltersState["entity"]
): boolean {
  if (isAllDocumentFilterValue(filter)) {
    return true
  }

  if (filter.entityId) {
    return filter.entityId
      ? fact.subject_entity_id === filter.entityId
      : fact.subject_text === filter.text
  }

  return fact.subject_text === filter.text
}

export function matchesObjectEntity(
  fact: FactWithAnchors,
  filter: DocumentFiltersState["objectEntity"]
): boolean {
  if (isAllDocumentFilterValue(filter)) {
    return true
  }

  if (filter.entityId) {
    return fact.object_entity_id === filter.entityId
  }

  return fact.object_text === filter.text
}

function matchesCompletenessFilter(
  fact: FactWithAnchors,
  completeness: DocumentCompletenessFilter,
  ontology: DocumentOntology | null | undefined,
  entitiesById: Map<string, EntityWithAttributes> | undefined
): boolean {
  if (completeness === DOCUMENT_FILTER_ALL) {
    return true
  }

  if (!ontology || !entitiesById) {
    return false
  }

  const isComplete = getFactCompleteness(
    fact,
    ontology,
    entitiesById
  ).isComplete

  return completeness === "complete" ? isComplete : !isComplete
}

// Precomputes class and relation ownership so module filtering stays cheap per fact.
function createModuleLookup(
  ontology?: DocumentOntology | null
): ModuleLookup | null {
  if (!ontology) return null

  const classModuleById = new Map(
    ontology.classes.map((cls) => [cls.id, normalizeModuleId(cls.module_id)])
  )
  const relationModuleById = new Map(
    ontology.relations.map((relation) => [
      relation.id,
      classModuleById.get(relation.domain_class_id) ??
        classModuleById.get(relation.range_class_id) ??
        NO_MODULE_FILTER_ID,
    ])
  )

  return { classModuleById, relationModuleById }
}

function matchesModuleFilter(
  fact: FactWithAnchors,
  moduleId: string,
  moduleLookup: ModuleLookup | null
): boolean {
  if (!moduleLookup) return true

  return (
    (!!fact.subject_class_id &&
      moduleLookup.classModuleById.get(fact.subject_class_id) === moduleId) ||
    (!!fact.object_class_id &&
      moduleLookup.classModuleById.get(fact.object_class_id) === moduleId) ||
    (!!fact.relation_type_id &&
      moduleLookup.relationModuleById.get(fact.relation_type_id) === moduleId)
  )
}

function getFactClassModuleId(
  classId: string | null,
  moduleLookup: ModuleLookup
): string {
  if (!classId) {
    return NO_MODULE_FILTER_ID
  }

  return moduleLookup.classModuleById.get(classId) ?? NO_MODULE_FILTER_ID
}

// Treats missing ontology module ids as the shared "unmapped" bucket.
function normalizeModuleId(moduleId: string | null | undefined): string {
  return moduleId ?? NO_MODULE_FILTER_ID
}
