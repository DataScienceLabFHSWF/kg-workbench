import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Info } from "lucide-react"

import type { RelationDependencyIssue } from "../types"

interface RelationDependencyCardProps extends RelationDependencyIssue {
  getModuleLabel: (moduleId: string | null) => string
  onIncludeClass: (classId: string) => void
  onExcludeRelation: (relationId: string) => void
}

export function RelationDependencyCard({
  relation,
  keptClass,
  missingClass,
  getModuleLabel,
  onIncludeClass,
  onExcludeRelation,
}: RelationDependencyCardProps) {
  const isSubjectMissing = missingClass.id === relation.domain_class_id
  const subjectClass = isSubjectMissing ? missingClass : keptClass
  const objectClass = isSubjectMissing ? keptClass : missingClass
  const getIncludedModuleText = (moduleId: string | null) =>
    moduleId === missingClass.module_id
      ? "This module"
      : `Module: ${getModuleLabel(moduleId)}`
  const subjectLabel = isSubjectMissing
    ? "Excluded subject (This module):"
    : `Included subject (${getIncludedModuleText(subjectClass.module_id)}):`
  const objectLabel = isSubjectMissing
    ? `Included object (${getIncludedModuleText(objectClass.module_id)}):`
    : "Excluded object (This module):"

  return (
    <div className="space-y-2 rounded-md border px-3 py-2">
      <div className="flex items-start gap-2">
        <p className="min-w-0 flex-1 truncate text-xs">
          <span className={isSubjectMissing ? "text-muted-foreground" : ""}>
            {subjectClass.name}
          </span>{" "}
          <span>{relation.name}</span>{" "}
          <span className={!isSubjectMissing ? "text-muted-foreground" : ""}>
            {objectClass.name}
          </span>
        </p>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              className="-mt-1 text-muted-foreground"
              aria-label="Show dependency details"
            >
              <Info />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top" align="end" className="max-w-96">
            <dl className="grid grid-cols-[max-content,minmax(0,1fr)] gap-x-2 gap-y-1">
              <dt className="text-background/70">{subjectLabel}</dt>
              <dd className="min-w-0 break-words">{subjectClass.name}</dd>
              <dt className="text-background/70">Relation:</dt>
              <dd className="min-w-0 break-words">{relation.name}</dd>
              <dt className="text-background/70">{objectLabel}</dt>
              <dd className="min-w-0 break-words">{objectClass.name}</dd>
            </dl>
          </TooltipContent>
        </Tooltip>
      </div>
      <div className="flex flex-wrap justify-end gap-2">
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => onIncludeClass(missingClass.id)}
        >
          Include related class
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => onExcludeRelation(relation.id)}
        >
          Exclude relation
        </Button>
      </div>
    </div>
  )
}
