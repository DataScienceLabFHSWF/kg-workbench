"use client"

import { useState, useTransition } from "react"
import { Plus } from "lucide-react"
import { toast } from "sonner"

import { createExample } from "@/features/ontology/server/actions/examples"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

import { ExampleRow } from "./example-row"
import type { ExamplesEditorProps } from "./types"

function buildTripleSummary(
  subject: string,
  predicate: string,
  object: string
) {
  return [subject, predicate, object].filter(Boolean).join(" ")
}

export function ExamplesEditor({
  ontologyId,
  target,
  examples,
  mode,
  instanceCandidateLabel,
}: ExamplesEditorProps) {
  const [adding, setAdding] = useState(false)
  const [value, setValue] = useState("")
  const [subjectLabel, setSubjectLabel] = useState("")
  const [predicateLabel, setPredicateLabel] = useState("")
  const [objectLabel, setObjectLabel] = useState("")
  const [isPending, startTransition] = useTransition()

  function resetDraft() {
    setValue("")
    setSubjectLabel("")
    setPredicateLabel("")
    setObjectLabel("")
  }

  function handleAdd() {
    const summary =
      value.trim() ||
      (mode === "triple"
        ? buildTripleSummary(subjectLabel, predicateLabel, objectLabel)
        : "")
    if (!summary) return
    const nextSortOrder =
      examples.reduce((max, example) => Math.max(max, example.sort_order), -1) +
      1
    startTransition(async () => {
      try {
        await createExample(ontologyId, target, {
          value: summary,
          subjectLabel: mode === "triple" ? subjectLabel.trim() || null : null,
          predicateLabel:
            mode === "triple" ? predicateLabel.trim() || null : null,
          objectLabel: mode === "triple" ? objectLabel.trim() || null : null,
          isInstanceCandidate: false,
          sortOrder: nextSortOrder,
        })
        resetDraft()
        setAdding(false)
        toast.success("Example added.")
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Save failed.")
      }
    })
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-medium text-muted-foreground">
          Examples ({examples.length})
        </p>
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          onClick={() => setAdding(true)}
          disabled={adding}
          aria-label="Add example"
        >
          <Plus className="h-3.5 w-3.5" />
        </Button>
      </div>

      {adding ? (
        <div className="space-y-2 rounded-md border p-3">
          {mode === "triple" ? (
            <div className="grid gap-2 sm:grid-cols-3">
              <Input
                value={subjectLabel}
                onChange={(event) => setSubjectLabel(event.target.value)}
                placeholder="Subject label"
                className="h-8"
                disabled={isPending}
              />
              <Input
                value={predicateLabel}
                onChange={(event) => setPredicateLabel(event.target.value)}
                placeholder="Predicate label"
                className="h-8"
                disabled={isPending}
              />
              <Input
                value={objectLabel}
                onChange={(event) => setObjectLabel(event.target.value)}
                placeholder="Object label"
                className="h-8"
                disabled={isPending}
              />
            </div>
          ) : null}
          <Input
            value={value}
            onChange={(event) => setValue(event.target.value)}
            placeholder={mode === "triple" ? "Summary" : "Example value"}
            className="h-8"
            disabled={isPending}
          />
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                resetDraft()
                setAdding(false)
              }}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleAdd}
              disabled={isPending}
            >
              Add
            </Button>
          </div>
        </div>
      ) : null}

      <div className="space-y-2">
        {examples.length > 0 ? (
          examples.map((example) => (
            <ExampleRow
              key={example.id}
              example={example}
              mode={mode}
              instanceCandidateLabel={instanceCandidateLabel}
            />
          ))
        ) : (
          <p className="rounded-md border border-dashed p-3 text-sm text-muted-foreground">
            No examples yet.
          </p>
        )}
      </div>
    </div>
  )
}
