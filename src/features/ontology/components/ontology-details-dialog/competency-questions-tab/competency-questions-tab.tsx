"use client"

import { useMemo, useState, useTransition } from "react"
import { Plus } from "lucide-react"
import { toast } from "sonner"

import type {
  OntologyExample,
  OntologyModule,
  OntologyRelation,
} from "@/domain/ontology"
import type {
  OntologyClassWithAttributes,
  OntologyCQWithModules,
  OntologyDocumentWithModules,
} from "@/features/ontology/server/queries"
import { deleteCQ } from "@/features/ontology/server/actions/competency-questions"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { MultiSelectDropdown } from "@/components/shared/multi-select-dropdown"
import { EmptyState } from "@/features/ontology/components/shared/empty-state"
import { SearchInput } from "@/features/ontology/components/shared/search-input"

import { CompetencyQuestionsTable } from "./competency-questions-table/competency-questions-table"

interface CompetencyQuestionsTabProps {
  ontology: OntologyDocumentWithModules
  modules: OntologyModule[]
  classes: OntologyClassWithAttributes[]
  relations: OntologyRelation[]
  cqs: OntologyCQWithModules[]
  examples: OntologyExample[]
  createModuleId?: string | null
  createRequestId?: number
  filterModuleId?: string | null
}

export function CompetencyQuestionsTab({
  ontology,
  modules,
  classes,
  relations,
  cqs,
  examples,
  createModuleId,
  createRequestId = 0,
  filterModuleId,
}: CompetencyQuestionsTabProps) {
  const [search, setSearch] = useState("")
  const [moduleFilter, setModuleFilter] = useState<Set<string>>(() =>
    filterModuleId ? new Set([filterModuleId]) : new Set()
  )
  const [editingCQId, setEditingCQId] = useState<string | null>(null)
  const [createDraftKey, setCreateDraftKey] = useState(0)
  const [closedCreateRequestId, setClosedCreateRequestId] = useState(0)
  const [deletingCQ, setDeletingCQ] = useState<OntologyCQWithModules | null>(
    null
  )
  const [isDeleting, startDelete] = useTransition()

  const classMap = useMemo(
    () => new Map(classes.map((c) => [c.id, c])),
    [classes]
  )
  const relationMap = useMemo(
    () => new Map(relations.map((r) => [r.id, r])),
    [relations]
  )
  const exampleMap = useMemo(
    () => new Map(examples.map((example) => [example.id, example] as const)),
    [examples]
  )

  const filteredCQs = useMemo(() => {
    return cqs.filter((cq) => {
      if (search && !cq.question.toLowerCase().includes(search.toLowerCase())) {
        return false
      }
      if (moduleFilter.size > 0) {
        const cqModuleIds = new Set(cq.modules.map((m) => m.id))
        if (![...moduleFilter].some((id) => cqModuleIds.has(id))) return false
      }
      return true
    })
  }, [cqs, search, moduleFilter])

  const hasActiveFilter = search !== "" || moduleFilter.size > 0

  function handleEdit(cq: OntologyCQWithModules) {
    setClosedCreateRequestId(createRequestId)
    setCreateDraftKey(0)
    setEditingCQId(cq.id)
  }

  function handleAdd() {
    setClosedCreateRequestId(createRequestId)
    setEditingCQId(null)
    setCreateDraftKey(Date.now())
  }

  function handleConfirmDelete() {
    if (!deletingCQ) return
    const id = deletingCQ.id
    setDeletingCQ(null)
    startDelete(async () => {
      try {
        await deleteCQ(id)
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Delete failed.")
      }
    })
  }

  const moduleOptions = modules.map((m) => ({ value: m.id, label: m.name }))
  const isCreateRequestOpen =
    createRequestId > 0 && closedCreateRequestId !== createRequestId
  const showCreateRow = isCreateRequestOpen || createDraftKey !== 0
  const createRowKey = isCreateRequestOpen
    ? `request-${createRequestId}`
    : `draft-${createDraftKey}`
  const resolvedInitialModuleId = isCreateRequestOpen
    ? (createModuleId ?? null)
    : null
  const shouldShowEmptyState = cqs.length === 0 && !showCreateRow

  function closeCreateRow() {
    setCreateDraftKey(0)
    setClosedCreateRequestId(createRequestId)
  }

  return (
    <div className="flex h-full flex-col">
      {/* Toolbar */}
      <div className="flex items-center gap-2 border-b px-4 py-3">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search questions…"
        />
        <MultiSelectDropdown
          label="Modules"
          options={moduleOptions}
          selectedValues={moduleFilter}
          onToggle={(id) => {
            const next = new Set(moduleFilter)
            if (next.has(id)) {
              next.delete(id)
            } else {
              next.add(id)
            }
            setModuleFilter(next)
          }}
          onToggleAll={() => {
            if (moduleFilter.size === modules.length) {
              setModuleFilter(new Set())
            } else {
              setModuleFilter(new Set(modules.map((m) => m.id)))
            }
          }}
          onClear={() => setModuleFilter(new Set())}
        />
        <Button size="sm" onClick={handleAdd} className="ml-auto shrink-0">
          <Plus className="mr-1.5 size-4" />
          Add CQ
        </Button>
      </div>

      {/* Table or empty states */}
      {shouldShowEmptyState ? (
        <div className="flex flex-1 items-center justify-center p-6">
          <EmptyState
            title="No competency questions"
            description="Competency questions help define what the ontology should be able to answer."
          />
        </div>
      ) : filteredCQs.length === 0 && !showCreateRow ? (
        <div className="flex flex-1 items-center justify-center p-6">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              No CQs match the current filters.
            </p>
            {hasActiveFilter && (
              <Button
                variant="link"
                size="sm"
                className="mt-1 h-auto p-0 text-xs"
                onClick={() => {
                  setSearch("")
                  setModuleFilter(new Set())
                }}
              >
                Clear filters
              </Button>
            )}
          </div>
        </div>
      ) : (
        <div className="min-h-0 flex-1 overflow-auto">
          <CompetencyQuestionsTable
            ontology={ontology}
            modules={modules}
            classes={classes}
            relations={relations}
            filteredCQs={filteredCQs}
            classMap={classMap}
            relationMap={relationMap}
            exampleMap={exampleMap}
            editingCQId={editingCQId}
            showCreateRow={showCreateRow}
            createRowKey={createRowKey}
            initialModuleId={resolvedInitialModuleId}
            onCloseCreateRow={closeCreateRow}
            onEdit={handleEdit}
            onStopEdit={() => setEditingCQId(null)}
            onDelete={setDeletingCQ}
          />
        </div>
      )}

      <AlertDialog
        open={deletingCQ !== null}
        onOpenChange={(open) => {
          if (!open) setDeletingCQ(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete competency question?</AlertDialogTitle>
            <AlertDialogDescription>
              {deletingCQ?.question
                ? `"${deletingCQ.question}"`
                : "This competency question"}{" "}
              will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="text-destructive-foreground bg-destructive hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
