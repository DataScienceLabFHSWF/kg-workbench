export interface GroupedOptionPickerOption {
  value: string
  label: string
  groupId: string | null
  groupLabel: string
  hint?: string
  keywords?: string[]
}

export interface GroupedOptionPickerProps {
  value: string
  options: GroupedOptionPickerOption[]
  onValueChange: (value: string) => void
  placeholder?: string
  searchPlaceholder: string
  emptyLabel: string
  disabled?: boolean
  className?: string
  contentClassName?: string
}
