"use client"

import type { KeyboardEvent } from "react"
import { Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { TableCell, TableRow } from "@/components/ui/table"

interface CreateLanguageRowProps {
  code: string
  label: string
  isCreating: boolean
  isDuplicateCode: boolean
  onCodeChange: (value: string) => void
  onLabelChange: (value: string) => void
  onCreate: () => void
}

export function CreateLanguageRow({
  code,
  label,
  isCreating,
  isDuplicateCode,
  onCodeChange,
  onLabelChange,
  onCreate,
}: CreateLanguageRowProps) {
  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      onCreate()
    }
  }

  return (
    <TableRow>
      <TableCell>
        <Input
          value={code}
          onChange={(event) => onCodeChange(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="en, de, en-US"
          className="h-8"
          disabled={isCreating}
          aria-label="New language code"
        />
      </TableCell>
      <TableCell>
        <div className="space-y-1">
          <Input
            value={label}
            onChange={(event) => onLabelChange(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="English"
            className="h-8"
            disabled={isCreating}
            aria-label="New language label"
          />
          {isDuplicateCode && code.trim() && (
            <p className="text-xs text-destructive">
              Language code already exists.
            </p>
          )}
        </div>
      </TableCell>
      <TableCell className="max-w-28 text-xs leading-4 whitespace-normal text-muted-foreground">
        Default can be set later.
      </TableCell>
      <TableCell>
        <Button
          size="icon"
          variant="outline"
          className="size-8"
          onClick={onCreate}
          disabled={isCreating || !code.trim() || isDuplicateCode}
          title={
            isDuplicateCode ? "Language code already exists" : "Add language"
          }
          aria-label="Add language"
        >
          <Plus className="size-4" />
        </Button>
      </TableCell>
    </TableRow>
  )
}
