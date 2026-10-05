"use client"

import { useMemo, useState } from "react"
import { Plus } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import type { OntologyLanguage, OntologyRelation } from "@/domain/ontology"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { OntologyModule } from "@/domain/ontology"
import type { OntologyClassWithAttributes } from "@/features/ontology/server/queries"
import {
  buildModuleExport,
  deleteModule,
  duplicateModule,
  renameModule,
} from "@/features/ontology/server/actions/modules"
import { CreateModuleDialog } from "./dialogs/create-module-dialog/create-module-dialog"
import { DeleteModuleDialog } from "./module-actions/delete-module-dialog"
import { downloadJsonFile } from "./module-actions/download-json-file"
import { ModuleActionsMenu } from "./module-actions/module-actions-menu"
import { RenameModuleDialog } from "./module-actions/rename-module-dialog"
import { ScrollableTabStrip } from "./module-tab-bar/scrollable-tab-strip"

interface ModuleTabBarProps {
  modules: OntologyModule[]
  classes: OntologyClassWithAttributes[]
  relations: OntologyRelation[]
  languages: OntologyLanguage[]
  defaultLanguage?: string | null
  activeModuleId: string | null
  onModuleChange: (moduleId: string | null) => void
  onModuleOverview: (moduleId: string) => void
  ontologyId: string
  onModuleCreated: (moduleId: string) => void
}

const ALL_MODULES = "__all__"

export function ModuleTabBar({
  modules,
  classes,
  relations,
  languages,
  defaultLanguage,
  activeModuleId,
  onModuleChange,
  onModuleOverview,
  ontologyId,
  onModuleCreated,
}: ModuleTabBarProps) {
  const activeValue = activeModuleId ?? ALL_MODULES
  const [dialogOpen, setDialogOpen] = useState(false)
  const [moduleForRename, setModuleForRename] = useState<OntologyModule | null>(
    null
  )
  const [moduleForDelete, setModuleForDelete] = useState<OntologyModule | null>(
    null
  )
  const [pendingAction, setPendingAction] = useState<
    "rename" | "duplicate" | "export" | "delete" | null
  >(null)

  const moduleImpactById = useMemo(() => {
    const classIdsByModule = new Map<string, Set<string>>()
    for (const cls of classes) {
      if (!cls.module_id) continue
      const classIds = classIdsByModule.get(cls.module_id) ?? new Set<string>()
      classIds.add(cls.id)
      classIdsByModule.set(cls.module_id, classIds)
    }

    const impact = new Map<
      string,
      { classCount: number; relationCount: number }
    >()
    for (const ontologyModule of modules) {
      const moduleClassIds =
        classIdsByModule.get(ontologyModule.id) ?? new Set<string>()
      impact.set(ontologyModule.id, {
        classCount: moduleClassIds.size,
        relationCount: relations.filter(
          (relation) =>
            moduleClassIds.has(relation.domain_class_id) ||
            moduleClassIds.has(relation.range_class_id)
        ).length,
      })
    }

    return impact
  }, [classes, modules, relations])

  async function handleRename(name: string) {
    if (!moduleForRename) return

    setPendingAction("rename")
    try {
      await renameModule(moduleForRename.id, name)
      setModuleForRename(null)
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to rename module."
      )
    } finally {
      setPendingAction(null)
    }
  }

  async function handleDuplicate(ontologyModule: OntologyModule) {
    setPendingAction("duplicate")
    try {
      const result = await duplicateModule(ontologyModule.id)
      if (result.warnings.length > 0) {
        toast.warning("Duplicated with skipped items.", {
          description: result.warnings.slice(0, 2).join(" "),
        })
      }
      onModuleCreated(result.module.id)
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to duplicate module."
      )
    } finally {
      setPendingAction(null)
    }
  }

  async function handleExport(ontologyModule: OntologyModule) {
    setPendingAction("export")
    try {
      const result = await buildModuleExport(ontologyModule.id)
      downloadJsonFile(result.fileName, result.payload)
      if (result.warnings.length > 0) {
        toast.warning("Exported with adjusted links.", {
          description: result.warnings.slice(0, 2).join(" "),
        })
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to export module."
      )
    } finally {
      setPendingAction(null)
    }
  }

  async function handleDelete() {
    if (!moduleForDelete) return

    setPendingAction("delete")
    try {
      await deleteModule(moduleForDelete.id)
      if (activeModuleId === moduleForDelete.id) {
        onModuleChange(null)
      }
      setModuleForDelete(null)
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to delete module."
      )
    } finally {
      setPendingAction(null)
    }
  }

  const createModuleButton = (
    <Button
      type="button"
      variant="ghost"
      size="icon-xs"
      className="shrink-0"
      title="Create Module"
      aria-label="Create module"
      onClick={() => setDialogOpen(true)}
    >
      <Plus className="h-3.5 w-3.5" />
    </Button>
  )

  return (
    <>
      <div className="w-full max-w-full min-w-0 overflow-hidden border-b px-4">
        <ScrollableTabStrip
          activeKey={activeValue}
          itemCount={modules.length + 2}
          endAction={createModuleButton}
        >
          {(activeItemRef, hasOverflow) => (
            <div className="inline-flex w-max max-w-none min-w-max items-center">
              <Tabs
                className="inline-flex w-max max-w-none min-w-max"
                value={activeValue}
                onValueChange={(value) =>
                  onModuleChange(value === ALL_MODULES ? null : value)
                }
              >
                <TabsList className="flex w-max max-w-none min-w-max flex-nowrap">
                  <TabsTrigger
                    ref={activeValue === ALL_MODULES ? activeItemRef : null}
                    value={ALL_MODULES}
                    className="shrink-0"
                  >
                    All
                  </TabsTrigger>
                  {modules.map((mod) => (
                    <div key={mod.id} className="relative shrink-0">
                      <TabsTrigger
                        ref={activeValue === mod.id ? activeItemRef : null}
                        value={mod.id}
                        className="max-w-48 shrink-0 pr-5"
                        title={mod.name}
                      >
                        <span className="min-w-0 truncate">{mod.name}</span>
                      </TabsTrigger>
                      <ModuleActionsMenu
                        moduleName={mod.name}
                        disabled={pendingAction !== null}
                        onOverview={() => onModuleOverview(mod.id)}
                        onRename={() => setModuleForRename(mod)}
                        onDuplicate={() => {
                          void handleDuplicate(mod)
                        }}
                        onExport={() => {
                          void handleExport(mod)
                        }}
                        onDelete={() => setModuleForDelete(mod)}
                      />
                    </div>
                  ))}
                </TabsList>
              </Tabs>
              {!hasOverflow ? (
                <div className="ml-1 shrink-0">{createModuleButton}</div>
              ) : null}
            </div>
          )}
        </ScrollableTabStrip>
      </div>

      <CreateModuleDialog
        ontologyId={ontologyId}
        languages={languages}
        defaultLanguage={defaultLanguage}
        existingModuleNames={modules.map(
          (ontologyModule) => ontologyModule.name
        )}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={(moduleId) => {
          setDialogOpen(false)
          onModuleCreated(moduleId)
        }}
      />

      <RenameModuleDialog
        key={moduleForRename?.id ?? "rename-module-dialog"}
        open={Boolean(moduleForRename)}
        onOpenChange={(open) => {
          if (!open) setModuleForRename(null)
        }}
        moduleName={moduleForRename?.name ?? ""}
        isPending={pendingAction === "rename"}
        onConfirm={(name) => {
          void handleRename(name)
        }}
      />

      <DeleteModuleDialog
        open={Boolean(moduleForDelete)}
        onOpenChange={(open) => {
          if (!open) setModuleForDelete(null)
        }}
        moduleName={moduleForDelete?.name ?? ""}
        classCount={
          moduleForDelete
            ? (moduleImpactById.get(moduleForDelete.id)?.classCount ?? 0)
            : 0
        }
        relationCount={
          moduleForDelete
            ? (moduleImpactById.get(moduleForDelete.id)?.relationCount ?? 0)
            : 0
        }
        isPending={pendingAction === "delete"}
        onConfirm={() => {
          void handleDelete()
        }}
      />
    </>
  )
}
