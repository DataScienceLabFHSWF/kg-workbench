export type PickerClass = {
  id: string
  module_id: string | null
}

export type PickerModule = {
  id: string
  name: string
}

export type PickerRelation = {
  id: string
  name: string
  domain_class_id: string
}

export interface ModuleGroup {
  module: PickerModule | null
  relations: PickerRelation[]
}
