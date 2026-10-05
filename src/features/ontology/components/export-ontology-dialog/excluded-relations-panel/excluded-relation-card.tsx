import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import type { OntologyRelation } from "@/domain/ontology"
import type { OntologyClassWithAttributes } from "@/features/ontology/server/queries"

interface ExcludedRelationCardProps {
  relation: OntologyRelation
  domainClass: OntologyClassWithAttributes | undefined
  rangeClass: OntologyClassWithAttributes | undefined
  groupModuleId: string | null
  getModuleLabel: (moduleId: string | null) => string
  onRestoreRelation: (relationId: string) => void
}

export function ExcludedRelationCard({
  relation,
  domainClass,
  rangeClass,
  groupModuleId,
  getModuleLabel,
  onRestoreRelation,
}: ExcludedRelationCardProps) {
  function getClassLabel(cls: OntologyClassWithAttributes | undefined) {
    if (!cls) return "Unknown class"
    if (cls.module_id === groupModuleId) return cls.name
    return `${cls.name} (Module: ${getModuleLabel(cls.module_id)})`
  }

  const relationPath = `${getClassLabel(domainClass)} → ${getClassLabel(
    rangeClass
  )}`

  return (
    <div className="flex items-center justify-between gap-3 rounded-md border px-3 py-2">
      <div className="min-w-0">
        <p className="truncate font-medium">{relation.name}</p>
        <Tooltip>
          <TooltipTrigger asChild>
            <p className="truncate text-muted-foreground">{relationPath}</p>
          </TooltipTrigger>
          <TooltipContent side="top" align="start" className="max-w-80">
            {relationPath}
          </TooltipContent>
        </Tooltip>
      </div>
      <Button
        type="button"
        size="sm"
        variant="outline"
        className="shrink-0"
        onClick={() => onRestoreRelation(relation.id)}
      >
        Restore
      </Button>
    </div>
  )
}
