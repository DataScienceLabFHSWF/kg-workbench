import type { PickerConstraintCopy } from "@/components/shared/class-picker/types"

export function buildConstraintCopy(
  selections: Array<{ kind: string; text: string } | null>
): PickerConstraintCopy | undefined {
  const filteredSelections = selections.filter(
    (selection): selection is { kind: string; text: string } =>
      selection !== null
  )

  if (filteredSelections.length === 0) return undefined

  return {
    selections: filteredSelections,
  }
}
