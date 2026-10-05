"use client"

import {
  GroupedOptionPicker,
  type GroupedOptionPickerProps,
} from "@/components/shared/grouped-option-picker"
import {
  ONTOLOGY_DATA_TYPE_OPTIONS,
  type OntologyDataTypeId,
} from "@/features/ontology/utils/data-types"

interface DataTypePickerProps {
  value: OntologyDataTypeId
  onValueChange: (value: OntologyDataTypeId) => void
  disabled?: boolean
  className?: string
}

export function DataTypePicker({
  value,
  onValueChange,
  disabled,
  className,
}: DataTypePickerProps) {
  return (
    <GroupedOptionPicker
      value={value}
      options={ONTOLOGY_DATA_TYPE_OPTIONS}
      onValueChange={(nextValue) =>
        onValueChange(nextValue as OntologyDataTypeId)
      }
      searchPlaceholder="Search datatypes..."
      emptyLabel="No datatypes found."
      placeholder="Select datatype..."
      disabled={disabled}
      className={className}
    />
  )
}

export type { GroupedOptionPickerProps }
