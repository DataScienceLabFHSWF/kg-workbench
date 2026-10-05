export type PickerClass = { id: string; name: string; module_id: string | null }
export type PickerModule = { id: string; name: string }

export interface PickerConstraintSelection {
  kind: string
  text: string
  mappedName?: string | null
}

export interface PickerConstraintCopy {
  selections: PickerConstraintSelection[]
}

export interface NoneOption {
  label: string
  value: string
}

export interface ModuleGroup {
  module: PickerModule
  classes: PickerClass[]
}
