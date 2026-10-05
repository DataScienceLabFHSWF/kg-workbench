import { Check, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { TableCell } from "@/components/ui/table"

interface CQInlineEditorRowActionsProps {
  isPending: boolean
  isEditing: boolean
  onSave: () => void
  onCancel: () => void
}

export function CQInlineEditorRowActions({
  isPending,
  isEditing,
  onSave,
  onCancel,
}: CQInlineEditorRowActionsProps) {
  return (
    <TableCell className="min-w-28 align-top whitespace-normal">
      <div className="flex gap-1">
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          onClick={onSave}
          disabled={isPending}
          aria-label={
            isEditing ? "Save competency question" : "Add competency question"
          }
        >
          <Check className="h-3 w-3" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          onClick={onCancel}
          disabled={isPending}
          aria-label={
            isEditing
              ? "Discard competency question changes"
              : "Cancel adding competency question"
          }
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
    </TableCell>
  )
}
