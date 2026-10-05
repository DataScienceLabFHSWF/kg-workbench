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

interface DeleteModuleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  moduleName: string
  classCount: number
  relationCount: number
  isPending: boolean
  onConfirm: () => void
}

export function DeleteModuleDialog({
  open,
  onOpenChange,
  moduleName,
  classCount,
  relationCount,
  isPending,
  onConfirm,
}: DeleteModuleDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete module?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete &ldquo;{moduleName}&rdquo;, including{" "}
            {classCount} {classCount === 1 ? "class" : "classes"} and{" "}
            {relationCount} {relationCount === 1 ? "relation" : "relations"}.
            This cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isPending}
            className="text-destructive-foreground bg-destructive hover:bg-destructive/90"
          >
            {isPending ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
