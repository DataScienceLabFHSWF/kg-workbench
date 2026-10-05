import {
  type DocumentCompletenessFilter,
  DOCUMENT_FILTER_ALL,
  getDocumentFilterId,
  getEntityFilterValue,
  getExtractedRelationFilterValue,
  type DocumentEntityFilter,
  type DocumentExtractedRelationFilter,
  type DocumentModuleLinkFilter,
  type DocumentScopeFilter,
  type DocumentSingleFilterValue,
  type NamedFilter,
} from "../../../../utils/document-filters"
import type { DocumentFiltersToolbarGroupedOption } from "../types"

export interface SelectOption {
  value: string
  label: string
}

export function toNamedOption(
  value: NamedFilter | typeof DOCUMENT_FILTER_ALL
): SelectOption | null {
  if (value === DOCUMENT_FILTER_ALL) return null

  return {
    value: value.id,
    label: value.name,
  }
}

// Keeps the current single-select value visible even when it is missing from fetched options.
export function withSelectedOption(
  options: SelectOption[],
  selectedOption: SelectOption | null
) {
  if (!selectedOption) return options
  if (options.some((option) => option.value === selectedOption.value)) {
    return options
  }

  return [selectedOption, ...options]
}

// Keeps the current grouped selection visible while async data catches up.
export function withSelectedGroupedOption(
  options: DocumentFiltersToolbarGroupedOption[],
  selectedOption: DocumentFiltersToolbarGroupedOption | null
) {
  if (!selectedOption) return options
  if (options.some((option) => option.value === selectedOption.value)) {
    return options
  }

  return [selectedOption, ...options]
}

export function findNamedFilterOption(
  value: string,
  options: SelectOption[]
): NamedFilter {
  const option = options.find((item) => item.value === value)
  if (!option) {
    return { id: value, name: value }
  }

  return { id: option.value, name: option.label }
}

export function toSingleSelectValue(value: DocumentSingleFilterValue) {
  return getDocumentFilterId(value) ?? DOCUMENT_FILTER_ALL
}

export function toScopeFilter(value: string): DocumentScopeFilter {
  if (value === "in_chapter" || value === "cross_chapter") {
    return value
  }

  return DOCUMENT_FILTER_ALL
}

export function toModuleLinkFilter(value: string): DocumentModuleLinkFilter {
  if (value === "inner_module" || value === "cross_module") {
    return value
  }

  return DOCUMENT_FILTER_ALL
}

export function toCompletenessFilter(
  value: string
): DocumentCompletenessFilter {
  if (value === "missing_required" || value === "complete") {
    return value
  }

  return DOCUMENT_FILTER_ALL
}

export function getSelectedValues(
  options: SelectOption[],
  selectedValue: string
): Set<string> {
  return new Set([selectedValue])
}

export function toEntitySelectValue(
  value: DocumentEntityFilter | typeof DOCUMENT_FILTER_ALL
) {
  return value === DOCUMENT_FILTER_ALL
    ? DOCUMENT_FILTER_ALL
    : getEntityFilterValue(value)
}

export function toExtractedRelationSelectValue(
  value: DocumentExtractedRelationFilter | typeof DOCUMENT_FILTER_ALL
) {
  return value === DOCUMENT_FILTER_ALL
    ? DOCUMENT_FILTER_ALL
    : getExtractedRelationFilterValue(value)
}
