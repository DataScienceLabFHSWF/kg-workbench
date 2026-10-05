import type { ChangeEvent, FormEvent, ReactNode, RefObject } from "react"
import { FileJson, Upload } from "lucide-react"

import { Button } from "@/components/ui/button"
import { DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"

import { ImportWarningsNotice } from "./import-warnings-notice"
import { ValidationError } from "./validation-error"

interface ModuleJsonImportFormProps {
  fileInputRef: RefObject<HTMLInputElement | null>
  importFile: File | null
  metadataEditor: ReactNode
  warningCount: number
  validationError: string | null
  isPending: boolean
  onFileChange: (event: ChangeEvent<HTMLInputElement>) => void
  onCancel: () => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
}

export function ModuleJsonImportForm({
  fileInputRef,
  importFile,
  metadataEditor,
  warningCount,
  validationError,
  isPending,
  onFileChange,
  onCancel,
  onSubmit,
}: ModuleJsonImportFormProps) {
  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        className="hidden"
        onChange={onFileChange}
      />

      <div>{metadataEditor}</div>

      <div className="space-y-1.5">
        <Label>Module JSON</Label>
        <button
          type="button"
          className="flex w-full items-center justify-between rounded-md border px-3 py-2 text-left text-xs hover:bg-muted/40"
          onClick={() => fileInputRef.current?.click()}
        >
          <span className="flex items-center gap-2">
            {importFile ? (
              <FileJson className="h-4 w-4 text-muted-foreground" />
            ) : (
              <Upload className="h-4 w-4 text-muted-foreground" />
            )}
            {importFile ? importFile.name : "Choose a JSON file"}
          </span>
          <span className="text-muted-foreground">
            {importFile ? "Change" : "Browse"}
          </span>
        </button>
      </div>

      <ImportWarningsNotice warningCount={warningCount} />
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
        <Button type="submit" disabled={isPending}>
          {isPending ? "Importing..." : "Import"}
        </Button>
      </DialogFooter>
    </form>
  )
}
