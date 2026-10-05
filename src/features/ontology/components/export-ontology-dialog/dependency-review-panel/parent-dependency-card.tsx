import { Button } from "@/components/ui/button"

import type { ParentDependencyIssue } from "../types"

interface ParentDependencyCardProps extends ParentDependencyIssue {
  getModuleLabel: (moduleId: string | null) => string
  onIncludeClass: (classId: string) => void
  onDropParent: (childId: string) => void
}

export function ParentDependencyCard({
  child,
  parent,
  getModuleLabel,
  onIncludeClass,
  onDropParent,
}: ParentDependencyCardProps) {
  return (
    <div className="space-y-2 rounded-md border px-3 py-2">
      <div>
        <p className="font-medium">{child.name}</p>
        <p className="text-muted-foreground">
          Parent class {parent.name} is currently excluded from{" "}
          {getModuleLabel(parent.module_id)}.
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => onIncludeClass(parent.id)}
        >
          Include parent class
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => onDropParent(child.id)}
        >
          Drop parent link
        </Button>
      </div>
    </div>
  )
}
