export type DialogType = "class-clear" | "class-assign" | "relation-break"

export type FactEntityRole = "subject" | "object"

export type PendingEntityClass = {
  role: FactEntityRole
  classId: string | null
}
