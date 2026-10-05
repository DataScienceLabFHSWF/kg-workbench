"use client"

import { useState, useTransition } from "react"
import { useQuery } from "@tanstack/react-query"
import { toast } from "sonner"
import { Pencil, Trash2 } from "lucide-react"

import type { OntologyExample } from "@/domain/ontology"
import {
  deleteExample,
  updateExample,
} from "@/features/ontology/server/actions/examples"
import { getAffectedCompetencyQuestionsForExample } from "@/features/ontology/server/queries"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"

import type { ExamplesEditorMode } from "./types"
import { ExampleImpactDialog } from "./example-impact-dialog"

interface ExampleRowProps {
  example: OntologyExample
  mode: ExamplesEditorMode
  instanceCandidateLabel?: string
}

function buildTripleSummary(
  subject: string,
  predicate: string,
  object: string
) {
  return [subject, predicate, object].filter(Boolean).join(" ")
}

export function ExampleRow({
  example,
  mode,
  instanceCandidateLabel,
}: ExampleRowProps) {
  const [pendingAction, setPendingAction] = useState<
    "delete" | "clear-candidate" | null
  >(null)
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState(example.value)
  const [subjectLabel, setSubjectLabel] = useState(example.subject_label ?? "")
  const [predicateLabel, setPredicateLabel] = useState(
    example.predicate_label ?? ""
  )
  const [objectLabel, setObjectLabel] = useState(example.object_label ?? "")
  const [isPending, startTransition] = useTransition()
  const { data: impacts = [], isLoading: isLoadingImpacts } = useQuery({
    queryKey: ["ontology", "example-impacts", example.id],
    queryFn: () => getAffectedCompetencyQuestionsForExample(example.id),
    enabled: pendingAction !== null,
  })

  function handleSave() {
    const summary =
      value.trim() ||
      (mode === "triple"
        ? buildTripleSummary(subjectLabel, predicateLabel, objectLabel)
        : "")
    if (!summary) return
    startTransition(async () => {
      try {
        await updateExample(example.id, {
          value: summary,
          subjectLabel: mode === "triple" ? subjectLabel.trim() || null : null,
          predicateLabel:
            mode === "triple" ? predicateLabel.trim() || null : null,
          objectLabel: mode === "triple" ? objectLabel.trim() || null : null,
        })
        setValue(summary)
        setEditing(false)
        toast.success("Example saved.")
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Save failed.")
      }
    })
  }

  function handleDelete() {
    setPendingAction("delete")
  }

  function handleCandidateChange(isInstanceCandidate: boolean) {
    if (!isInstanceCandidate) {
      setPendingAction("clear-candidate")
      return
    }
    startTransition(async () => {
      try {
        await updateExample(example.id, { isInstanceCandidate })
        toast.success("Example saved.")
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Save failed.")
      }
    })
  }

  function handleConfirmPendingAction() {
    const action = pendingAction
    if (!action) return
    setPendingAction(null)

    startTransition(async () => {
      try {
        if (action === "delete") {
          await deleteExample(example.id)
          toast.success("Example deleted.")
        } else {
          await updateExample(example.id, { isInstanceCandidate: false })
          toast.success("Example saved.")
        }
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : action === "delete"
              ? "Delete failed."
              : "Save failed."
        )
      }
    })
  }

  if (editing) {
    return (
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
              setValue(example.value)
              setSubjectLabel(example.subject_label ?? "")
              setPredicateLabel(example.predicate_label ?? "")
              setObjectLabel(example.object_label ?? "")
              setEditing(false)
            }}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handleSave}
            disabled={isPending}
          >
            Save
          </Button>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="flex gap-2 rounded-md border p-3">
        <div className="min-w-0 flex-1">
          <p className="text-sm break-words">{example.value}</p>
          {mode === "triple" &&
          (example.subject_label ||
            example.predicate_label ||
            example.object_label) ? (
            <p className="mt-1 truncate text-xs text-muted-foreground">
              {[
                example.subject_label,
                example.predicate_label,
                example.object_label,
              ]
                .filter(Boolean)
                .join(" / ")}
            </p>
          ) : null}
          {instanceCandidateLabel ? (
            <div className="mt-2 flex items-center gap-2">
              <Switch
                id={`example-candidate-${example.id}`}
                checked={example.is_instance_candidate}
                onCheckedChange={handleCandidateChange}
                disabled={isPending}
              />
              <Label
                htmlFor={`example-candidate-${example.id}`}
                className="text-xs font-normal text-muted-foreground"
              >
                {instanceCandidateLabel}
              </Label>
            </div>
          ) : null}
        </div>
        <div className="flex shrink-0 gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            onClick={() => setEditing(true)}
            disabled={isPending}
            aria-label="Edit example"
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            className="text-destructive hover:text-destructive"
            onClick={handleDelete}
            disabled={isPending}
            aria-label="Delete example"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
      <ExampleImpactDialog
        open={pendingAction !== null}
        onOpenChange={(open) => {
          if (!open) setPendingAction(null)
        }}
        action={pendingAction ?? "delete"}
        exampleValue={example.value}
        instanceCandidateLabel={instanceCandidateLabel}
        impacts={impacts}
        isLoading={isLoadingImpacts}
        isPending={isPending}
        onConfirm={handleConfirmPendingAction}
      />
    </>
  )
}
