import type { FormEvent, ReactNode } from "react"

import { Button } from "@/components/ui/button"
import { DialogFooter } from "@/components/ui/dialog"

import { ValidationError } from "./validation-error"

interface EmptyModuleFormProps {
  canSubmit: boolean
  metadataEditor: ReactNode
  validationError: string | null
  isPending: boolean
  onCancel: () => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
}

export function EmptyModuleForm({
  canSubmit,
  metadataEditor,
  validationError,
  isPending,
  onCancel,
  onSubmit,
}: EmptyModuleFormProps) {
  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      <div>{metadataEditor}</div>

      <ValidationError message={validationError} />

      <DialogFooter>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isPending}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isPending || !canSubmit || Boolean(validationError)}
        >
          {isPending ? "Creating..." : "Create"}
        </Button>
      </DialogFooter>
    </form>
  )
}
