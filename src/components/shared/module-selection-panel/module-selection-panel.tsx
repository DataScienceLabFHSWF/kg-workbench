import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { OntologyModule } from "@/domain/ontology"

interface ModuleSelectionPanelProps {
  modules: OntologyModule[]
  selectedModuleIds: Set<string>
  moduleCounts: Map<string, number>
  scrollAreaClassName?: string
  onToggleModule: (moduleId: string) => void
  onSelectAllModules: () => void
  onDeselectAllModules: () => void
}

export function ModuleSelectionPanel({
  modules,
  selectedModuleIds,
  moduleCounts,
  scrollAreaClassName = "min-h-72 flex-1",
  onToggleModule,
  onSelectAllModules,
  onDeselectAllModules,
}: ModuleSelectionPanelProps) {
  return (
    <section className="flex min-h-0 flex-col space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-medium">Modules</p>
          <p className="text-muted-foreground">
            {selectedModuleIds.size} of {modules.length} selected
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onSelectAllModules}
          >
            Select all
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onDeselectAllModules}
          >
            Deselect all
          </Button>
        </div>
      </div>

      <ScrollArea className={`${scrollAreaClassName} rounded-md border`}>
        <div className="space-y-2 p-3">
          {modules.map((module) => (
            <label
              key={module.id}
              className="flex cursor-pointer items-center justify-between gap-3 rounded-md border px-3 py-2 hover:bg-muted/40"
            >
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  className="h-4 w-4"
                  checked={selectedModuleIds.has(module.id)}
                  onChange={() => onToggleModule(module.id)}
                />
                <div>
                  <p className="font-medium">{module.name}</p>
                  <p className="text-muted-foreground">
                    {moduleCounts.get(module.id) ?? 0} classes
                  </p>
                </div>
              </div>
              {selectedModuleIds.has(module.id) ? (
                <Badge variant="secondary">Included</Badge>
              ) : null}
            </label>
          ))}
          {modules.length === 0 ? (
            <p className="text-muted-foreground">
              No modules available in this ontology.
            </p>
          ) : null}
        </div>
      </ScrollArea>
    </section>
  )
}
