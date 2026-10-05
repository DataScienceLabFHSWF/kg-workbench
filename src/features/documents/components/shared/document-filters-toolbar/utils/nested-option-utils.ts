import type {
  DocumentFiltersToolbarNestedLeafOption,
  DocumentFiltersToolbarNestedOption,
} from "../types"

// Flattens the nested tree so search and counts can work on leaf options only.
export function flattenNestedOptions(
  options: DocumentFiltersToolbarNestedOption[]
): DocumentFiltersToolbarNestedLeafOption[] {
  const result: DocumentFiltersToolbarNestedLeafOption[] = []

  for (const option of options) {
    if (option.type === "leaf") {
      result.push(option)
      continue
    }

    result.push(...flattenNestedOptions(option.children))
  }

  return result
}

export function countNestedLeaves(
  options: DocumentFiltersToolbarNestedOption[]
): number {
  return flattenNestedOptions(options).length
}
