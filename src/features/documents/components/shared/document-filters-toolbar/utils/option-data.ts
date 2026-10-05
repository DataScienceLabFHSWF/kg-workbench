import type { EntityWithAttributes } from "@/domain/documents"

import type {
  DocumentOntology,
  FactWithAnchors,
} from "../../../../server/queries"
import {
  DOCUMENT_FILTER_ALL,
  filterFacts,
  getEntityFilterValue,
  getExtractedRelationFilterValue,
  isAllDocumentFilterValue,
  NO_MODULE_FILTER_ID,
  type DocumentEntityFilter,
  type DocumentExtractedRelationFilter,
} from "../../../../utils/document-filters"
import type {
  DocumentFiltersToolbarNestedLeafOption,
  DocumentFiltersToolbarNestedOption,
} from "../types"
import type { DocumentFiltersState } from "../../../../utils/document-filters"

interface EntityLeafOption extends DocumentFiltersToolbarNestedLeafOption {
  filter: DocumentEntityFilter
}

interface ExtractedRelationLeafOption extends DocumentFiltersToolbarNestedLeafOption {
  filter: DocumentExtractedRelationFilter
}

// Builds nested entity selector data from the currently matching facts and ontology context.
export function buildEntityOptionData({
  facts,
  entities,
  ontology,
  filters,
}: {
  facts: FactWithAnchors[]
  entities: EntityWithAttributes[]
  ontology?: DocumentOntology
  filters: DocumentFiltersState
}) {
  return buildEntityOptionDataForRoles({
    facts,
    entities,
    ontology,
    roles: ["subject", "object"],
    resetFilterState: {
      ...filters,
      entity: DOCUMENT_FILTER_ALL,
    },
    selectedFilter: filters.entity,
  })
}

export function buildRoleEntityOptionData({
  facts,
  entities,
  ontology,
  filters,
  role,
}: {
  facts: FactWithAnchors[]
  entities: EntityWithAttributes[]
  ontology?: DocumentOntology
  filters: DocumentFiltersState
  role: "subject" | "object"
}) {
  const filterKey = role === "subject" ? "subjectEntity" : "objectEntity"

  return buildEntityOptionDataForRoles({
    facts,
    entities,
    ontology,
    roles: [role],
    resetFilterState: {
      ...filters,
      [filterKey]: DOCUMENT_FILTER_ALL,
    },
    selectedFilter: filters[filterKey],
  })
}

function buildEntityOptionDataForRoles({
  facts,
  entities,
  ontology,
  roles,
  resetFilterState,
  selectedFilter,
}: {
  facts: FactWithAnchors[]
  entities: EntityWithAttributes[]
  ontology?: DocumentOntology
  roles: Array<"subject" | "object">
  resetFilterState: DocumentFiltersState
  selectedFilter: DocumentFiltersState["entity"]
}) {
  const entityById = new Map(entities.map((entity) => [entity.id, entity]))
  const filteredFacts = filterFacts(facts, {
    anchorFilter: null,
    sharedFilters: resetFilterState,
    ontology,
    entitiesById: entityById,
  })

  const classById = new Map(
    (ontology?.classes ?? []).map((cls) => [cls.id, cls])
  )
  const moduleById = new Map(
    (ontology?.modules ?? []).map((module) => [module.id, module])
  )

  const leaves: EntityLeafOption[] = []
  const seen = new Set<string>()

  for (const fact of filteredFacts) {
    for (const role of roles) {
      const candidate =
        role === "subject"
          ? {
              entityId: fact.subject_entity_id,
              text: fact.subject_text,
              classId: fact.subject_class_id,
            }
          : {
              entityId: fact.object_entity_id,
              text: fact.object_text,
              classId: fact.object_class_id,
            }
      const entity = candidate.entityId
        ? (entityById.get(candidate.entityId) ?? null)
        : null
      const filter: DocumentEntityFilter = {
        label: entity?.entity_text ?? candidate.text,
        text: entity?.entity_text ?? candidate.text,
        entityId: candidate.entityId,
      }
      const value = getEntityFilterValue(filter)
      if (seen.has(value)) continue
      seen.add(value)

      const classId = entity?.class_id ?? candidate.classId
      const className = classId
        ? (classById.get(classId)?.name ?? classId)
        : "Unmapped"
      const moduleId = classId
        ? (classById.get(classId)?.module_id ?? NO_MODULE_FILTER_ID)
        : null
      const moduleName =
        classId === null
          ? "Unmapped"
          : moduleId === NO_MODULE_FILTER_ID
            ? "No module"
            : moduleId
              ? (moduleById.get(moduleId)?.name ?? "Unknown module")
              : "Unknown module"
      const breadcrumb =
        classId === null ? "Unmapped" : `${moduleName} / ${className}`

      leaves.push({
        id: `${value}:${classId ?? "unmapped"}`,
        type: "leaf",
        value,
        label: filter.label,
        breadcrumb,
        filter,
      })
    }
  }

  leaves.sort((a, b) => a.label.localeCompare(b.label))

  return {
    options: buildNestedOptions({
      leaves,
      getPath: (option) => option.breadcrumb.split(" / "),
    }),
    leaves,
    selectedBreadcrumb: isAllDocumentFilterValue(selectedFilter)
      ? undefined
      : leaves.find(
          (option) =>
            option.value ===
            getEntityFilterValue(selectedFilter as DocumentEntityFilter)
        )?.breadcrumb,
  }
}

// Builds nested extracted-relation options from the currently matching facts.
export function buildExtractedRelationOptionData({
  facts,
  entities,
  ontology,
  filters,
}: {
  facts: FactWithAnchors[]
  entities: EntityWithAttributes[]
  ontology?: DocumentOntology
  filters: DocumentFiltersState
}) {
  const filteredFacts = filterFacts(facts, {
    anchorFilter: null,
    sharedFilters: {
      ...filters,
      extractedRelation: DOCUMENT_FILTER_ALL,
    },
    ontology,
    entitiesById: new Map(entities.map((entity) => [entity.id, entity])),
  })

  const relationById = new Map(
    (ontology?.relations ?? []).map((relation) => [relation.id, relation])
  )
  const classById = new Map(
    (ontology?.classes ?? []).map((cls) => [cls.id, cls])
  )
  const moduleById = new Map(
    (ontology?.modules ?? []).map((module) => [module.id, module])
  )

  const leaves: ExtractedRelationLeafOption[] = []
  const seen = new Set<string>()

  filteredFacts.forEach((fact, index) => {
    const filter: DocumentExtractedRelationFilter = {
      label: fact.relation_text,
      text: fact.relation_text,
    }
    const value = getExtractedRelationFilterValue(filter)
    const relation = fact.relation_type_id
      ? (relationById.get(fact.relation_type_id) ?? null)
      : null
    const relationLabel = relation?.name ?? "Unmapped"
    const moduleId = relation
      ? (classById.get(relation.domain_class_id)?.module_id ??
        NO_MODULE_FILTER_ID)
      : null
    const moduleLabel =
      relation === null
        ? "Unmapped"
        : moduleId === NO_MODULE_FILTER_ID
          ? "No module"
          : moduleId
            ? (moduleById.get(moduleId)?.name ?? "Unknown module")
            : "Unknown module"
    const breadcrumb =
      relation === null ? "Unmapped" : `${moduleLabel} / ${relationLabel}`
    const dedupeKey = `${value}:${breadcrumb}`
    if (seen.has(dedupeKey)) {
      return
    }
    seen.add(dedupeKey)

    leaves.push({
      id: `${value}:${fact.relation_type_id ?? "unmapped"}:${index}`,
      type: "leaf",
      value,
      label: filter.label,
      breadcrumb,
      filter,
    })
  })

  leaves.sort((a, b) =>
    a.label === b.label
      ? a.breadcrumb.localeCompare(b.breadcrumb)
      : a.label.localeCompare(b.label)
  )

  return {
    options: buildNestedOptions({
      leaves,
      getPath: (option) => option.breadcrumb.split(" / "),
    }),
    leaves,
    selectedBreadcrumb: isAllDocumentFilterValue(filters.extractedRelation)
      ? undefined
      : leaves.find(
          (option) =>
            option.value ===
            getExtractedRelationFilterValue(
              filters.extractedRelation as DocumentExtractedRelationFilter
            )
        )?.breadcrumb,
  }
}

function buildNestedOptions<
  TLeaf extends DocumentFiltersToolbarNestedLeafOption,
>({
  leaves,
  getPath,
}: {
  leaves: TLeaf[]
  getPath: (leaf: TLeaf) => string[]
}): DocumentFiltersToolbarNestedOption[] {
  const root: DocumentFiltersToolbarNestedOption[] = []

  for (const leaf of leaves) {
    const path = getPath(leaf)
    if (path.length === 0) {
      root.push(leaf)
      continue
    }

    insertLeafIntoBranch(root, path, leaf)
  }

  return root
    .map(sortNestedOption)
    .sort((a, b) => a.label.localeCompare(b.label))
}

function insertLeafIntoBranch<
  TLeaf extends DocumentFiltersToolbarNestedLeafOption,
>(
  level: DocumentFiltersToolbarNestedOption[],
  path: string[],
  leaf: TLeaf,
  parentPath = ""
) {
  const [segment, ...rest] = path
  const branchId = parentPath ? `${parentPath}/${segment}` : segment

  let branch = level.find(
    (option) => option.type === "branch" && option.id === branchId
  )
  if (!branch || branch.type !== "branch") {
    branch = {
      type: "branch",
      id: branchId,
      label: segment,
      children: [],
    }
    level.push(branch)
  }

  if (rest.length === 0) {
    branch.children.push(leaf)
    return
  }

  insertLeafIntoBranch(branch.children, rest, leaf, branchId)
}

function sortNestedOption(
  option: DocumentFiltersToolbarNestedOption
): DocumentFiltersToolbarNestedOption {
  if (option.type === "leaf") {
    return option
  }

  return {
    ...option,
    children: option.children
      .map(sortNestedOption)
      .sort((a, b) => a.label.localeCompare(b.label)),
  }
}
