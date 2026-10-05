"use client"

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

interface ModuleImportConfirmationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  warnings: string[]
  isPending: boolean
  onConfirm: () => void
}

export function ModuleImportConfirmationDialog({
  open,
  onOpenChange,
  warnings,
  isPending,
  onConfirm,
}: ModuleImportConfirmationDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-lg">
        <AlertDialogHeader>
          <AlertDialogTitle>Import with skipped items?</AlertDialogTitle>
          <AlertDialogDescription>
            Some uploaded references cannot be preserved inside a single module
            import. Review the warnings below before continuing.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="max-h-64 space-y-2 overflow-y-auto rounded-md border p-3">
          {warnings.map((warning) => (
            <p key={warning} className="text-xs text-muted-foreground">
              {warning}
            </p>
          ))}
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} disabled={isPending}>
            {isPending ? "Importing..." : "Import anyway"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
