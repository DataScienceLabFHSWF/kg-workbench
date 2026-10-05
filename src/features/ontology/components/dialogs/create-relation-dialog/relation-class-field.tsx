"use client"

import { Label } from "@/components/ui/label"
import { ClassPicker } from "@/components/shared/class-picker"
import type { OntologyClassWithAttributes } from "@/features/ontology/server/queries"
import type { OntologyModule } from "@/domain/ontology"

interface RelationClassFieldProps {
  label: string
  value: string
  error: string | null
  allClasses: OntologyClassWithAttributes[]
  modules: OntologyModule[]
  currentModuleId: string | null
  onValueChange: (value: string) => void
}

export function RelationClassField({
  label,
  value,
  error,
  allClasses,
  modules,
  currentModuleId,
  onValueChange,
}: RelationClassFieldProps) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <ClassPicker
        value={value}
        onValueChange={onValueChange}
        allClasses={allClasses}
        modules={modules}
        currentModuleId={currentModuleId}
      />
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}
