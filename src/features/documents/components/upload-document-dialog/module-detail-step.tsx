import { ArrowLeft } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DependencyReviewPanel } from "@/features/ontology/components/export-ontology-dialog/dependency-review-panel/dependency-review-panel"
import { ExcludedRelationsPanel } from "@/features/ontology/components/export-ontology-dialog/excluded-relations-panel/excluded-relations-panel"
import { ExtraIncludedClassesPanel } from "@/features/ontology/components/export-ontology-dialog/extra-included-classes-panel/extra-included-classes-panel"
import { ModuleSelectionPanel } from "@/components/shared/module-selection-panel/module-selection-panel"
import type { useOntologyModuleLanguageSelection } from "@/hooks/use-ontology-module-language-selection"
import type { OntologyModule } from "@/domain/ontology"

interface ModuleDetailStepProps {
  modules: OntologyModule[]
  selection: ReturnType<typeof useOntologyModuleLanguageSelection>
  onBack: () => void
}

export function ModuleDetailStep({
  modules,
  selection,
  onBack,
}: ModuleDetailStepProps) {
  return (
    <>
      <DialogHeader className="space-y-0">
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="shrink-0"
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back
          </Button>
          <div>
            <DialogTitle>Module selection</DialogTitle>
            <p className="text-sm text-muted-foreground">
              Resolve cross-module dependencies before uploading.
            </p>
          </div>
        </div>
      </DialogHeader>

      <div className="min-h-0 flex-1 overflow-y-auto pr-1 xl:overflow-hidden">
        <div className="grid gap-4 lg:grid-cols-2 xl:h-full xl:min-h-0 xl:grid-cols-[minmax(220px,0.9fr)_minmax(280px,1.2fr)_minmax(220px,0.95fr)_minmax(220px,0.95fr)]">
          <ModuleSelectionPanel
            modules={modules}
            selectedModuleIds={selection.selectedModuleIds}
            moduleCounts={selection.moduleCounts}
            onToggleModule={selection.handleToggleModule}
            onSelectAllModules={selection.handleSelectAllModules}
            onDeselectAllModules={selection.handleDeselectAllModules}
          />

          <DependencyReviewPanel
            unresolvedCount={selection.unresolvedCount}
            dependencyGroups={selection.dependencyGroups}
            expandedDependencyGroups={selection.expandedDependencyGroups}
            relationIssues={selection.relationIssues}
            parentIssues={selection.parentIssues}
            getModuleLabel={selection.getModuleLabel}
            onExcludeAllDependencies={selection.handleExcludeAllDependencies}
            onIncludeDependencyGroup={selection.handleIncludeDependencyGroup}
            onExcludeDependencyGroup={selection.handleExcludeDependencyGroup}
            onDependencyGroupOpenChange={
              selection.handleDependencyGroupOpenChange
            }
            onIncludeClass={selection.handleIncludeClass}
            onExcludeRelation={selection.handleExcludeRelation}
            onDropParent={selection.handleDropParent}
          />

          <ExtraIncludedClassesPanel
            extraSelectedClasses={selection.extraSelectedClasses}
            getModuleLabel={selection.getModuleLabel}
            onRemoveExtraClass={selection.handleRemoveExtraClass}
          />

          <ExcludedRelationsPanel
            excludedRelations={selection.excludedRelations}
            droppedParents={selection.droppedParents}
            classById={selection.classById}
            selectedClassIds={selection.selectedClassIds}
            getModuleLabel={selection.getModuleLabel}
            onRestoreRelation={selection.handleRestoreRelation}
            onRestoreParent={selection.handleRestoreParent}
          />
        </div>
      </div>

      <div className="flex items-center justify-between border-t pt-3">
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary">
            {selection.selectedClassIds.size} classes
          </Badge>
          <Badge variant="secondary">
            {selection.exportRelationIds.length} relations
          </Badge>
        </div>
        <Button
          type="button"
          onClick={onBack}
          disabled={selection.unresolvedCount > 0}
        >
          {selection.unresolvedCount > 0
            ? `${selection.unresolvedCount} unresolved`
            : "Confirm selection"}
        </Button>
      </div>
    </>
  )
}
