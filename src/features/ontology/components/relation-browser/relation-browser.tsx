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
  OntologyRelationAttribute,
} from "@/domain/ontology"
import type { OntologyClassWithAttributes } from "@/features/ontology/server/queries"
import { cn } from "@/lib/utils"
import { CreateRelationDialog } from "../dialogs/create-relation-dialog"
import { RelationBrowserItem } from "./relation-browser-item"
import { SearchInput } from "../shared/search-input"

interface RelationBrowserProps {
  relations: OntologyRelation[]
  relationAttributesByRelation: Record<string, OntologyRelationAttribute[]>
  classMap: Map<string, OntologyClassWithAttributes>
  notes: OntologyNote[]
  examples: OntologyExample[]
  ontologyId: string
  allClasses: OntologyClassWithAttributes[]
  modules: OntologyModule[]
  languages: OntologyLanguage[]
  defaultLanguage?: string | null
  currentModuleId: string | null
  selectedId: string | null
  onSelect: (id: string) => void
  onCreated: (relationId: string) => void
}

export function RelationBrowser({
  relations,
  relationAttributesByRelation,
  classMap,
  notes,
  examples,
  ontologyId,
  allClasses,
  modules,
  languages,
  defaultLanguage,
  currentModuleId,
  selectedId,
  onSelect,
  onCreated,
}: RelationBrowserProps) {
  const [search, setSearch] = useState("")
  const [filterNoAttrs, setFilterNoAttrs] = useState(false)
  const [filterHasNotes, setFilterHasNotes] = useState(false)
  const [filterNoInstances, setFilterNoInstances] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)

  const attributeCountMap = useMemo(() => {
    const map = new Map<string, number>()
    for (const relation of relations) {
      map.set(
        relation.id,
        relationAttributesByRelation[relation.id]?.length ?? 0
      )
    }
    return map
  }, [relationAttributesByRelation, relations])

  const noteCountMap = useMemo(() => {
    const map = new Map<string, number>()
    for (const note of notes) {
      const relationId = note.target_relation_id
      if (!relationId) continue
      map.set(relationId, (map.get(relationId) ?? 0) + 1)
    }
    return map
  }, [notes])

  const instanceCountMap = useMemo(() => {
    const map = new Map<string, number>()
    for (const example of examples) {
      if (!example.is_instance_candidate || !example.target_relation_id) {
        continue
      }
      map.set(
        example.target_relation_id,
        (map.get(example.target_relation_id) ?? 0) + 1
      )
    }
    return map
  }, [examples])

  const filtered = useMemo(() => {
    let result = relations
    if (search) {
      const lower = search.toLowerCase()
      result = result.filter((relation) =>
        relation.name.toLowerCase().includes(lower)
      )
    }
    if (filterNoAttrs) {
      result = result.filter(
        (relation) => (attributeCountMap.get(relation.id) ?? 0) === 0
      )
    }
    if (filterHasNotes) {
      result = result.filter(
        (relation) => (noteCountMap.get(relation.id) ?? 0) > 0
      )
    }
    if (filterNoInstances) {
      result = result.filter(
        (relation) => (instanceCountMap.get(relation.id) ?? 0) === 0
      )
    }
    return result
  }, [
    attributeCountMap,
    filterHasNotes,
    filterNoAttrs,
    filterNoInstances,
    instanceCountMap,
    noteCountMap,
    relations,
    search,
  ])

  return (
    <>
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="flex items-center gap-2 px-3 py-2">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Filter relations..."
          />
          <Button
            variant="outline"
            size="icon-xs"
            title="Add Relation"
            onClick={() => setDialogOpen(true)}
          >
            <Plus className="h-3.5 w-3.5" />
          </Button>
        </div>
        <div className="flex gap-1.5 px-3 pb-2">
          <button
            type="button"
            onClick={() => setFilterNoInstances((value) => !value)}
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
            onClick={() => setFilterNoAttrs((value) => !value)}
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
            onClick={() => setFilterHasNotes((value) => !value)}
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
            {filtered.map((rel) => (
              <RelationBrowserItem
                key={rel.id}
                relation={rel}
                classMap={classMap}
                attributeCount={attributeCountMap.get(rel.id) ?? 0}
                noteCount={noteCountMap.get(rel.id) ?? 0}
                instanceCount={instanceCountMap.get(rel.id) ?? 0}
                isSelected={rel.id === selectedId}
                onSelect={() => onSelect(rel.id)}
              />
            ))}
            {filtered.length === 0 && (
              <p className="px-3 py-4 text-center text-xs text-muted-foreground">
                No relations found.
              </p>
            )}
          </div>
        </ScrollArea>
      </div>

      <CreateRelationDialog
        ontologyId={ontologyId}
        allClasses={allClasses}
        modules={modules}
        languages={languages}
        defaultLanguage={defaultLanguage}
        currentModuleId={currentModuleId}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={(relationId) => {
          setDialogOpen(false)
          onCreated(relationId)
        }}
      />
    </>
  )
}
