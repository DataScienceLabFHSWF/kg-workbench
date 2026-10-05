import { Button } from "@/components/ui/button"

import { ExportModuleGroupCard } from "../shared/export-module-group-card"
import { ParentDependencyCard } from "./parent-dependency-card"
import { RelationDependencyCard } from "./relation-dependency-card"
import type { DependencyGroup, DependencyResolutionHandlers } from "../types"

interface DependencyGroupCardProps extends DependencyResolutionHandlers {
  group: DependencyGroup
  isOpen: boolean
  getModuleLabel: (moduleId: string | null) => string
  onOpenChange: (open: boolean) => void
  onIncludeGroup: (group: DependencyGroup) => void
  onExcludeGroup: (group: DependencyGroup) => void
}

export function DependencyGroupCard({
  group,
  isOpen,
  getModuleLabel,
  onOpenChange,
  onIncludeGroup,
  onExcludeGroup,
  onIncludeClass,
  onExcludeRelation,
  onDropParent,
}: DependencyGroupCardProps) {
  const groupCount = group.relationIssues.length + group.parentIssues.length

  return (
    <ExportModuleGroupCard
      title={group.moduleLabel}
      description={`${groupCount} ${
        groupCount === 1 ? "dependency points" : "dependencies point"
      } to this module.`}
      open={isOpen}
      onOpenChange={onOpenChange}
      action={
        <div className="flex shrink-0 flex-wrap justify-end gap-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => onIncludeGroup(group)}
          >
            Include all
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => onExcludeGroup(group)}
          >
            Exclude all
          </Button>
        </div>
      }
    >
      {group.relationIssues.map((issue) => (
        <RelationDependencyCard
          key={issue.relation.id}
          relation={issue.relation}
          keptClass={issue.keptClass}
          missingClass={issue.missingClass}
          getModuleLabel={getModuleLabel}
          onIncludeClass={onIncludeClass}
          onExcludeRelation={onExcludeRelation}
        />
      ))}

      {group.parentIssues.map((issue) => (
        <ParentDependencyCard
          key={issue.child.id}
          child={issue.child}
          parent={issue.parent}
          getModuleLabel={getModuleLabel}
          onIncludeClass={onIncludeClass}
          onDropParent={onDropParent}
        />
      ))}
    </ExportModuleGroupCard>
  )
}
