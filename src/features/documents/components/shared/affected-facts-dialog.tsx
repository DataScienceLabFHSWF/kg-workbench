"use client"

import type { ReactNode } from "react"

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

export interface AffectedFactPreview {
  id: string
  subject_text: string
  relation_text: string
  object_text: string
}

interface AffectedFactsDialogProps {
  open: boolean
  title: string
  description: ReactNode
  confirmLabel: string
  affectedFacts: AffectedFactPreview[]
  onConfirm: () => void
  onCancel: () => void
}

export function AffectedFactsDialog({
  open,
  title,
  description,
  confirmLabel,
  affectedFacts,
  onConfirm,
  onCancel,
}: AffectedFactsDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={(next) => !next && onCancel()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-3">
              {description}
              <ul className="space-y-1 rounded-md border bg-muted/40 px-3 py-2">
                {affectedFacts.map((fact) => (
                  <li key={fact.id} className="text-xs text-foreground">
                    <span className="font-medium">{fact.subject_text}</span>
                    <span className="mx-1 text-muted-foreground italic">
                      {fact.relation_text}
                    </span>
                    <span className="font-medium">{fact.object_text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
