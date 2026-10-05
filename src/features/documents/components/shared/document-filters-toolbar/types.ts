export interface DocumentFiltersToolbarSelectProps {
  label: string
  options: Array<{ value: string; label: string }>
  selectedValue: string
  isActive?: boolean
  disabled?: boolean
  hideFieldLabel?: boolean
  allLabel?: string
  selectAllValue?: string
  onChange: (value: string) => void
  onClear?: () => void
}

export interface DocumentFiltersToolbarGroupedOption {
  value: string
  label: string
  groupId: string | null
  groupLabel: string
}

export interface DocumentFiltersToolbarGroupedSelectProps {
  label: string
  searchPlaceholder: string
  options: DocumentFiltersToolbarGroupedOption[]
  selectedValue: string
  selectedLabel?: string
  isActive?: boolean
  disabled?: boolean
  hideFieldLabel?: boolean
  allLabel?: string
  emptyLabel: string
  onChange: (value: string) => void
  onClear?: () => void
}

export interface DocumentFiltersToolbarNestedLeafOption {
  type: "leaf"
  id: string
  value: string
  label: string
  breadcrumb: string
}

export interface DocumentFiltersToolbarNestedBranchOption {
  type: "branch"
  id: string
  label: string
  children: DocumentFiltersToolbarNestedOption[]
}

export type DocumentFiltersToolbarNestedOption =
  | DocumentFiltersToolbarNestedLeafOption
  | DocumentFiltersToolbarNestedBranchOption

export interface DocumentFiltersToolbarNestedSelectProps {
  label: string
  searchPlaceholder: string
  options: DocumentFiltersToolbarNestedOption[]
  selectedValue: string
  selectedLabel?: string
  selectedBreadcrumb?: string
  isActive?: boolean
  disabled?: boolean
  hideFieldLabel?: boolean
  allLabel?: string
  emptyLabel: string
  onChange: (value: string) => void
  onClear?: () => void
}
