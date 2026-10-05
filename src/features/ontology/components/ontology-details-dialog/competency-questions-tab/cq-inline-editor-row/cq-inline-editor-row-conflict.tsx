import { TriangleAlert } from "lucide-react"

import { Button } from "@/components/ui/button"
import { TableCell, TableRow } from "@/components/ui/table"

interface CQInlineEditorRowConflictProps {
  subjectConflict: boolean
  objectConflict: boolean
  onUseRelationClasses: () => void
}

export function CQInlineEditorRowConflict({
  subjectConflict,
  objectConflict,
  onUseRelationClasses,
}: CQInlineEditorRowConflictProps) {
  return (
    <TableRow className="bg-amber-50/70 hover:bg-amber-50/70 dark:bg-amber-950/10">
      <TableCell colSpan={8} className="whitespace-normal">
        <div className="flex items-start gap-2 rounded border border-amber-200 bg-amber-50 p-3 dark:border-amber-800 dark:bg-amber-950/20">
          <TriangleAlert className="mt-0.5 size-4 shrink-0 text-amber-600" />
          <div className="flex-1 text-sm">
            <p className="font-medium text-amber-800 dark:text-amber-200">
              Class conflict
            </p>
            <p className="mt-0.5 text-amber-700 dark:text-amber-300">
              The selected{" "}
              {subjectConflict && objectConflict
                ? "subject and object classes differ"
                : subjectConflict
                  ? "subject class differs"
                  : "object class differs"}{" "}
              from the relation&apos;s domain/range.
            </p>
            <Button
              size="sm"
              variant="outline"
              className="mt-2 h-7 border-amber-300 bg-transparent text-xs hover:bg-amber-100 dark:border-amber-700"
              onClick={onUseRelationClasses}
            >
              Use relation classes
            </Button>
          </div>
        </div>
      </TableCell>
    </TableRow>
  )
}
