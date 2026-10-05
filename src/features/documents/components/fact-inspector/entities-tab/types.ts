import type { EntityWithAttributes } from "@/domain/documents"

export interface ClassGroup {
  classId: string | null
  className: string
  entities: EntityWithAttributes[]
  missingRequiredCount: number
}

export interface ModuleGroup {
  moduleId: string
  moduleName: string
  classes: ClassGroup[]
  totalCount: number
  incompleteEntityCount: number
}
