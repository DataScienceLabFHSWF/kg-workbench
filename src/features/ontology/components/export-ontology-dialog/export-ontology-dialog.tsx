"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import { DependencyReviewPanel } from "./dependency-review-panel/dependency-review-panel"
import { ExcludedRelationsPanel } from "./excluded-relations-panel/excluded-relations-panel"
import { LanguageControls } from "@/components/shared/language-controls/language-controls"
import { ExtraIncludedClassesPanel } from "./extra-included-classes-panel/extra-included-classes-panel"
import { ModuleSelectionPanel } from "@/components/shared/module-selection-panel/module-selection-panel"
import type { ExportOntologyDialogProps } from "./types"
import { useOntologyExportState } from "./use-ontology-export-state"

export function ExportOntologyDialog({
  open,
  onOpenChange,
  defaultLanguage,
  mode,
  ontologyId,
  ontologyName,
  ontologyUsecase,
  languages,
  localizedTexts,
  modules,
  classes,
  relations,
}: ExportOntologyDialogProps) {
  const exportState = useOntologyExportState({
    defaultLanguage,
    ontologyId,
    ontologyUsecase,
    languages,
    localizedTexts,
    modules,
    classes,
    relations,
    onOpenChange,
  })
  const isOwlMode = mode === "owl"
  const isExporting = exportState.isExporting

  function handleOpenChange(nextOpen: boolean) {
    if (nextOpen) {
      exportState.resetState()
      onOpenChange(true)
      return
    }

    exportState.closeAndResetDialog()
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="flex h-[calc(100vh-2rem)] max-h-[960px] w-[calc(100vw-2rem)] max-w-none flex-col overflow-hidden sm:max-w-none 2xl:max-w-[1680px]">
        <DialogHeader className="space-y-0">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
            <div className="max-w-2xl space-y-3 text-left">
              <DialogTitle>
                {isOwlMode ? "Export ontology as OWL" : "Export ontology"}
              </DialogTitle>
              <DialogDescription>
                Choose which modules to include from {ontologyName} and resolve
                any cross-module dependencies before exporting.
              </DialogDescription>
            </div>
            <div className="xl:pl-6">
              <LanguageControls
                defaultLanguage={defaultLanguage}
                exportLanguage={exportState.exportLanguage}
                exportLanguageOptions={exportState.exportLanguageOptions}
                missingTranslationBehavior={
                  exportState.missingTranslationBehavior
                }
                missingTranslationSummary={
                  exportState.missingTranslationSummary
                }
                missingTranslationSummaryText={
                  exportState.missingTranslationSummaryText
                }
                onExportLanguageChange={exportState.setExportLanguage}
                onMissingTranslationBehaviorChange={
                  exportState.setMissingTranslationBehavior
                }
              />
            </div>
          </div>
        </DialogHeader>

        {isOwlMode ? (
          <div className="max-w-xl space-y-1.5">
            <Label htmlFor="owl-base-iri">Base IRI</Label>
            <Input
              id="owl-base-iri"
              value={exportState.baseIri}
              onChange={(event) =>
                exportState.handleBaseIriChange(event.target.value)
              }
              placeholder="https://example.com/ontology/"
            />
            {exportState.baseIriError && (
              <p className="text-xs text-destructive">
                {exportState.baseIriError}
              </p>
            )}
          </div>
        ) : null}

        <div className="min-h-0 flex-1 overflow-y-auto pr-1 xl:overflow-hidden">
          <div className="grid gap-4 lg:grid-cols-2 xl:h-full xl:min-h-0 xl:grid-cols-[minmax(220px,0.9fr)_minmax(280px,1.2fr)_minmax(220px,0.95fr)_minmax(220px,0.95fr)]">
            <ModuleSelectionPanel
              modules={modules}
              selectedModuleIds={exportState.selectedModuleIds}
              moduleCounts={exportState.moduleCounts}
              onToggleModule={exportState.handleToggleModule}
              onSelectAllModules={exportState.handleSelectAllModules}
              onDeselectAllModules={exportState.handleDeselectAllModules}
            />

            <DependencyReviewPanel
              unresolvedCount={exportState.unresolvedCount}
              dependencyGroups={exportState.dependencyGroups}
              expandedDependencyGroups={exportState.expandedDependencyGroups}
              relationIssues={exportState.relationIssues}
              parentIssues={exportState.parentIssues}
              getModuleLabel={exportState.getModuleLabel}
              onExcludeAllDependencies={
                exportState.handleExcludeAllDependencies
              }
              onIncludeDependencyGroup={
                exportState.handleIncludeDependencyGroup
              }
              onExcludeDependencyGroup={
                exportState.handleExcludeDependencyGroup
              }
              onDependencyGroupOpenChange={
                exportState.handleDependencyGroupOpenChange
              }
              onIncludeClass={exportState.handleIncludeClass}
              onExcludeRelation={exportState.handleExcludeRelation}
              onDropParent={exportState.handleDropParent}
            />

            <ExtraIncludedClassesPanel
              extraSelectedClasses={exportState.extraSelectedClasses}
              getModuleLabel={exportState.getModuleLabel}
              onRemoveExtraClass={exportState.handleRemoveExtraClass}
            />

            <ExcludedRelationsPanel
              excludedRelations={exportState.excludedRelations}
              droppedParents={exportState.droppedParents}
              classById={exportState.classById}
              selectedClassIds={exportState.selectedClassIds}
              getModuleLabel={exportState.getModuleLabel}
              onRestoreRelation={exportState.handleRestoreRelation}
              onRestoreParent={exportState.handleRestoreParent}
            />
          </div>
        </div>

        <DialogFooter className="flex-col gap-3 border-t pt-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">
              {exportState.selectedClassIds.size} classes
            </Badge>
            <Badge variant="secondary">
              {exportState.exportRelationIds.length} relations
            </Badge>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={exportState.closeAndResetDialog}
              disabled={isExporting}
            >
              Cancel
            </Button>
            {!isOwlMode && (
              <label className="flex items-center gap-2 rounded-md border px-3 py-2 font-medium">
                <input
                  type="checkbox"
                  className="h-4 w-4"
                  checked={exportState.includeVisual}
                  disabled={isExporting}
                  onChange={(event) =>
                    exportState.setIncludeVisual(event.target.checked)
                  }
                />
                Include visual layout
              </label>
            )}
            <Button
              type="button"
              onClick={
                isOwlMode
                  ? exportState.handleOwlExport
                  : exportState.handleExport
              }
              disabled={isExporting || exportState.unresolvedCount > 0}
            >
              {isExporting
                ? "Exporting..."
                : isOwlMode
                  ? "Export OWL"
                  : "Export JSON"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
