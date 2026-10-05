import { Button } from "@/components/ui/button"

import { DependencyGroupCard } from "./dependency-group-card"
import { NO_MODULE_GROUP_KEY } from "../export-utils"
import type {
  DependencyGroup,
  ParentDependencyIssue,
  RelationDependencyIssue,
} from "../types"

interface DependencyReviewPanelProps {
  unresolvedCount: number
  dependencyGroups: DependencyGroup[]
  expandedDependencyGroups: Set<string>
  relationIssues: RelationDependencyIssue[]
  parentIssues: ParentDependencyIssue[]
  getModuleLabel: (moduleId: string | null) => string
  onExcludeAllDependencies: () => void
  onIncludeDependencyGroup: (group: DependencyGroup) => void
  onExcludeDependencyGroup: (group: DependencyGroup) => void
  onDependencyGroupOpenChange: (groupKey: string, open: boolean) => void
  onIncludeClass: (classId: string) => void
  onExcludeRelation: (relationId: string) => void
  onDropParent: (childId: string) => void
}

export function DependencyReviewPanel({
  unresolvedCount,
  dependencyGroups,
  expandedDependencyGroups,
  relationIssues,
  parentIssues,
  getModuleLabel,
  onExcludeAllDependencies,
  onIncludeDependencyGroup,
  onExcludeDependencyGroup,
  onDependencyGroupOpenChange,
  onIncludeClass,
  onExcludeRelation,
  onDropParent,
}: DependencyReviewPanelProps) {
  return (
    <section className="flex min-h-0 flex-col space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-medium">Dependency review</p>
          <p className="text-muted-foreground">
            {unresolvedCount === 0
              ? "Everything currently selected can be exported."
              : `${unresolvedCount} included ${
                  unresolvedCount === 1
                    ? "class has a relation"
                    : "classes have relations"
                } to excluded ${unresolvedCount === 1 ? "class" : "classes"}.`}
          </p>
        </div>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={onExcludeAllDependencies}
          disabled={unresolvedCount === 0}
        >
          Exclude all
        </Button>
      </div>

      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto rounded-md border p-3">
        {dependencyGroups.map((group) => {
          const groupKey = group.moduleId ?? NO_MODULE_GROUP_KEY

          return (
            <DependencyGroupCard
              key={groupKey}
              group={group}
              isOpen={expandedDependencyGroups.has(groupKey)}
              getModuleLabel={getModuleLabel}
              onOpenChange={(open) =>
                onDependencyGroupOpenChange(groupKey, open)
              }
              onIncludeGroup={onIncludeDependencyGroup}
              onExcludeGroup={onExcludeDependencyGroup}
              onIncludeClass={onIncludeClass}
              onExcludeRelation={onExcludeRelation}
              onDropParent={onDropParent}
            />
          )
        })}

        {relationIssues.length === 0 && parentIssues.length === 0 ? (
          <p className="text-muted-foreground">
            No unresolved cross-module relations or parent dependencies.
          </p>
        ) : null}
      </div>
    </section>
  )
}
