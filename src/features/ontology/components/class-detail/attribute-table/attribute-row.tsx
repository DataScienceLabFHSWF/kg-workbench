"use client"

import { useState, useTransition } from "react"
import {
  Check,
  MoreHorizontal,
  Pencil,
  Settings2,
  Trash2,
  X,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { TableCell, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import type { OntologyAttribute } from "@/domain/ontology"
import { DataTypePicker } from "@/features/ontology/components/shared/datatype-picker/datatype-picker"
import {
  deleteAttribute,
  updateAttribute,
} from "@/features/ontology/server/actions/attributes"
import {
  getOntologyDataTypeIri,
  normalizeOntologyDataTypeOrDefault,
} from "@/features/ontology/utils/data-types"
import { cn } from "@/lib/utils"

interface AttributeRowProps {
  attribute: OntologyAttribute
  onOpenMetadata: (attribute: OntologyAttribute) => void
}

export function AttributeRow({ attribute, onOpenMetadata }: AttributeRowProps) {
  const [editing, setEditing] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [draft, setDraft] = useState({
    name: attribute.name,
    dataType: normalizeOntologyDataTypeOrDefault(attribute.data_type),
    required: attribute.required ?? false,
    description: attribute.description,
  })

  function handleSave() {
    setEditing(false)
    startTransition(async () => {
      await updateAttribute(attribute.id, {
        name: draft.name,
        dataType: draft.dataType,
        required: draft.required,
        description: draft.description,
      })
    })
  }

  function handleCancel() {
    setEditing(false)
    setDraft({
      name: attribute.name,
      dataType: normalizeOntologyDataTypeOrDefault(attribute.data_type),
      required: attribute.required ?? false,
      description: attribute.description,
    })
  }

  function handleDelete() {
    startTransition(async () => {
      await deleteAttribute(attribute.id)
    })
  }

  if (editing) {
    return (
      <TableRow>
        <TableCell>
          <Input
            value={draft.name}
            onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
            className="h-7 text-xs"
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSave()
              if (e.key === "Escape") handleCancel()
            }}
          />
        </TableCell>
        <TableCell>
          <DataTypePicker
            value={draft.dataType}
            onValueChange={(value) =>
              setDraft((current) => ({ ...current, dataType: value }))
            }
          />
        </TableCell>
        <TableCell className="text-center">
          <input
            type="checkbox"
            checked={draft.required}
            onChange={(e) =>
              setDraft((d) => ({ ...d, required: e.target.checked }))
            }
          />
        </TableCell>
        <TableCell>
          <Textarea
            value={draft.description}
            onChange={(e) =>
              setDraft((d) => ({ ...d, description: e.target.value }))
            }
            rows={2}
            className="min-h-0 resize-none px-2 py-1.5 text-xs"
            onKeyDown={(e) => {
              if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
                e.preventDefault()
                handleSave()
              }
              if (e.key === "Escape") handleCancel()
            }}
          />
        </TableCell>
        <TableCell>
          <div className="flex gap-1">
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              onClick={handleSave}
              disabled={isPending}
              aria-label="Save attribute"
            >
              <Check className="h-3 w-3" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              onClick={handleCancel}
              disabled={isPending}
              aria-label="Cancel editing attribute"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </TableCell>
      </TableRow>
    )
  }

  return (
    <TableRow className={cn(isPending && "opacity-50")}>
      <TableCell className="text-xs font-medium">{attribute.name}</TableCell>
      <TableCell
        className="text-xs break-words whitespace-normal"
        title={getOntologyDataTypeIri(attribute.data_type) ?? undefined}
      >
        {normalizeOntologyDataTypeOrDefault(attribute.data_type)}
      </TableCell>
      <TableCell className="text-center text-xs">
        {attribute.required ? "Yes" : "No"}
      </TableCell>
      <TableCell className="max-w-0 text-xs break-words whitespace-normal text-muted-foreground">
        {attribute.description || "-"}
      </TableCell>
      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon-xs">
              <MoreHorizontal className="h-3.5 w-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onOpenMetadata(attribute)}>
              <Settings2 className="mr-2 h-3.5 w-3.5" />
              Metadata
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setEditing(true)}>
              <Pencil className="mr-2 h-3.5 w-3.5" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={handleDelete}
              className="text-destructive"
            >
              <Trash2 className="mr-2 h-3.5 w-3.5" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  )
}
