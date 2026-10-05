"use client"

import { useMemo, useState } from "react"
import { Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import type {
  OntologyExample,
  OntologyLanguage,
  OntologyModule,
  OntologyNote,
  OntologyRelation,
} from "@/domain/ontology"
import type { OntologyClassWithAttributes } from "@/features/ontology/server/queries"
import { cn } from "@/lib/utils"
import { CreateClassDialog } from "../dialogs/create-class-dialog"
import { SearchInput } from "../shared/search-input"
import { ClassBrowserItem } from "./class-browser-item"

interface ClassBrowserProps {
  classes: OntologyClassWithAttributes[]
  relations: OntologyRelation[]
  modules: OntologyModule[]
  notes: OntologyNote[]
  examples: OntologyExample[]
  ontologyId: string
  languages: OntologyLanguage[]
  defaultLanguage?: string | null
  activeModuleId: string | null
  selectedId: string | null
  onSelect: (id: string) => void
  onCreated: (classId: string) => void
}

export function ClassBrowser({
  classes,
  relations,
  modules,
  notes,
  examples,
  ontologyId,
  languages,
  defaultLanguage,
  activeModuleId,
  selectedId,
  onSelect,
  onCreated,
}: ClassBrowserProps) {
  const [search, setSearch] = useState("")
  const [filterNoAttrs, setFilterNoAttrs] = useState(false)
  const [filterNoRelations, setFilterNoRelations] = useState(false)
  const [filterHasNotes, setFilterHasNotes] = useState(false)
  const [filterNoInstances, setFilterNoInstances] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)

  const moduleMap = useMemo(
    () => new Map(modules.map((m) => [m.id, m])),
    [modules]
  )

  const relationCountMap = useMemo(() => {
    const map = new Map<string, number>()
    for (const r of relations) {
      map.set(r.domain_class_id, (map.get(r.domain_class_id) ?? 0) + 1)
      if (r.range_class_id !== r.domain_class_id) {
        map.set(r.range_class_id, (map.get(r.range_class_id) ?? 0) + 1)
      }
    }
    return map
  }, [relations])

  const noteCountMap = useMemo(() => {
    const map = new Map<string, number>()
    for (const note of notes) {
      const classId = note.target_class_id
      if (!classId) continue
      map.set(classId, (map.get(classId) ?? 0) + 1)
    }
    return map
  }, [notes])

  const instanceCountMap = useMemo(() => {
    const map = new Map<string, number>()
    for (const example of examples) {
      if (!example.is_instance_candidate || !example.target_class_id) continue
      map.set(
        example.target_class_id,
        (map.get(example.target_class_id) ?? 0) + 1
      )
    }
    return map
  }, [examples])

  const filtered = useMemo(() => {
    let result = classes
    if (search) {
      const lower = search.toLowerCase()
      result = result.filter((c) => c.name.toLowerCase().includes(lower))
    }
    if (filterNoAttrs) {
      result = result.filter((c) => c.attributes.length === 0)
    }
    if (filterNoRelations) {
      result = result.filter((c) => (relationCountMap.get(c.id) ?? 0) === 0)
    }
    if (filterHasNotes) {
      result = result.filter((c) => (noteCountMap.get(c.id) ?? 0) > 0)
    }
    if (filterNoInstances) {
      result = result.filter((c) => (instanceCountMap.get(c.id) ?? 0) === 0)
    }
    return result
  }, [
    classes,
    search,
    filterNoAttrs,
    filterNoRelations,
    filterHasNotes,
    filterNoInstances,
    relationCountMap,
    noteCountMap,
    instanceCountMap,
  ])

  return (
    <>
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="flex items-center gap-2 px-3 py-2">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Filter classes..."
          />
          <Button
            variant="outline"
            size="icon-xs"
            title="Add Class"
            onClick={() => setDialogOpen(true)}
          >
            <Plus className="h-3.5 w-3.5" />
          </Button>
        </div>
        <div className="flex gap-1.5 px-3 pb-2">
          <button
            type="button"
            onClick={() => setFilterNoInstances((v) => !v)}
            className={cn(
              "rounded-full border px-2 py-0.5 text-[11px] transition-colors",
              filterNoInstances
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border text-muted-foreground hover:border-foreground hover:text-foreground"
            )}
          >
            No inst
          </button>
          <button
            type="button"
            onClick={() => setFilterNoAttrs((v) => !v)}
            className={cn(
              "rounded-full border px-2 py-0.5 text-[11px] transition-colors",
              filterNoAttrs
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border text-muted-foreground hover:border-foreground hover:text-foreground"
            )}
          >
            No attrs
          </button>
          <button
            type="button"
            onClick={() => setFilterNoRelations((v) => !v)}
            className={cn(
              "rounded-full border px-2 py-0.5 text-[11px] transition-colors",
              filterNoRelations
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border text-muted-foreground hover:border-foreground hover:text-foreground"
            )}
          >
            No rels
          </button>
          <button
            type="button"
            onClick={() => setFilterHasNotes((v) => !v)}
            className={cn(
              "rounded-full border px-2 py-0.5 text-[11px] transition-colors",
              filterHasNotes
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border text-muted-foreground hover:border-foreground hover:text-foreground"
            )}
          >
            Has notes
          </button>
        </div>
        <ScrollArea className="min-h-0 flex-1">
          <div className="flex flex-col gap-0.5 px-1 pb-2">
            {filtered.map((cls) => (
              <ClassBrowserItem
                key={cls.id}
                cls={cls}
                module={
                  cls.module_id ? moduleMap.get(cls.module_id) : undefined
                }
                relationCount={relationCountMap.get(cls.id) ?? 0}
                noteCount={noteCountMap.get(cls.id) ?? 0}
                instanceCount={instanceCountMap.get(cls.id) ?? 0}
                isSelected={cls.id === selectedId}
                onSelect={() => onSelect(cls.id)}
              />
            ))}
            {filtered.length === 0 && (
              <p className="px-3 py-4 text-center text-xs text-muted-foreground">
                No classes found.
              </p>
            )}
          </div>
        </ScrollArea>
      </div>

      <CreateClassDialog
        ontologyId={ontologyId}
        languages={languages}
        defaultLanguage={defaultLanguage}
        modules={modules}
        allClasses={classes}
        defaultModuleId={activeModuleId}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={(classId) => {
          setDialogOpen(false)
          onCreated(classId)
        }}
      />
    </>
  )
}
