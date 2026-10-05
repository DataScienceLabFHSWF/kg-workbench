"use client"

import type { OntologyExampleImpact } from "@/features/ontology/server/queries"
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

interface ExampleImpactDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  action: "delete" | "clear-candidate"
  exampleValue: string
  instanceCandidateLabel?: string
  impacts: OntologyExampleImpact[]
  isLoading: boolean
  isPending: boolean
  onConfirm: () => void
}

function formatRoles(roles: OntologyExampleImpact["roles"]) {
  return roles.map((role) => role[0].toUpperCase() + role.slice(1)).join(", ")
}

export function ExampleImpactDialog({
  open,
  onOpenChange,
  action,
  exampleValue,
  instanceCandidateLabel,
  impacts,
  isLoading,
  isPending,
  onConfirm,
}: ExampleImpactDialogProps) {
  const isDelete = action === "delete"
  const title = isDelete
    ? "Delete example?"
    : `Remove ${instanceCandidateLabel?.toLowerCase() ?? "allowed example"}?`
  const description = isDelete
    ? `This will permanently delete "${exampleValue}".`
    : `This will remove "${exampleValue}" as ${instanceCandidateLabel?.toLowerCase() ?? "an allowed example"}.`

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="sm:max-w-lg">
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>
            {description}
            {impacts.length > 0
              ? " The CQ selections below will be cleared."
              : " This cannot be undone."}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {isLoading ? (
          <p className="text-sm text-muted-foreground">
            Loading affected CQs...
          </p>
        ) : impacts.length > 0 ? (
          <div className="max-h-60 space-y-2 overflow-auto rounded-md border p-3">
            <p className="text-xs font-medium text-muted-foreground">
              Affected competency questions
            </p>
            <ul className="space-y-2">
              {impacts.map((impact) => (
                <li
                  key={impact.id}
                  className="rounded-md bg-muted/40 px-2 py-1.5"
                >
                  <p className="text-sm">
                    {impact.question || "Untitled competency question"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Cleared from: {formatRoles(impact.roles)}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isPending || isLoading}
            className="text-destructive-foreground bg-destructive hover:bg-destructive/90"
          >
            {isPending
              ? isDelete
                ? "Deleting..."
                : "Saving..."
              : isDelete
                ? "Delete"
                : "Remove"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
