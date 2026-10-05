"use client"

import { useTransition } from "react"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { OntologyModule } from "@/domain/ontology"
import type { OntologyClassWithAttributes } from "@/features/ontology/server/queries"
import { updateClass } from "@/features/ontology/server/actions/classes"
import { ClassPicker } from "@/components/shared/class-picker"

interface ClassDetailHeaderProps {
  cls: OntologyClassWithAttributes
  modules: OntologyModule[]
  allClasses: OntologyClassWithAttributes[]
}

export function ClassDetailHeader({
  cls,
  modules,
  allClasses,
}: ClassDetailHeaderProps) {
  const [isPending, startTransition] = useTransition()
  const parentOptions = allClasses.filter((c) => c.id !== cls.id)

  function handleModuleChange(moduleId: string) {
    startTransition(async () => {
      await updateClass(cls.id, {
        moduleId: moduleId === "__none__" ? null : moduleId,
      })
    })
  }

  function handleParentChange(parentId: string) {
    startTransition(async () => {
      await updateClass(cls.id, {
        parentClassId: parentId === "__none__" ? null : parentId,
      })
    })
  }

  return (
    <div className="flex flex-col gap-4 md:flex-row md:flex-wrap md:items-start">
      <div className="w-full min-w-0 md:w-fit">
        <p className="mb-1 text-xs font-medium text-muted-foreground">Module</p>
        <Select
          value={cls.module_id ?? "__none__"}
          onValueChange={handleModuleChange}
          disabled={isPending}
        >
          <SelectTrigger className="h-8 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__none__">None</SelectItem>
            {modules.map((m) => (
              <SelectItem key={m.id} value={m.id}>
                {m.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="w-full min-w-0 md:w-fit">
        <p className="mb-1 text-xs font-medium text-muted-foreground">
          Parent class
        </p>
        <ClassPicker
          value={cls.parent_class_id ?? "__none__"}
          onValueChange={handleParentChange}
          allClasses={parentOptions}
          modules={modules}
          currentModuleId={cls.module_id}
          disabled={isPending}
          noneOption={{ label: "None", value: "__none__" }}
          className="w-fit max-w-full"
        />
      </div>
    </div>
  )
}
