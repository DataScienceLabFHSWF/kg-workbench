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

import type { OntologyRelationAttribute } from "@/domain/ontology"
import {
  deleteRelationAttribute,
  updateRelationAttribute,
} from "@/features/ontology/server/actions/relation-attributes"
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
import { DataTypePicker } from "@/features/ontology/components/shared/datatype-picker/datatype-picker"
import {
  getOntologyDataTypeIri,
  normalizeOntologyDataTypeOrDefault,
} from "@/features/ontology/utils/data-types"

interface RelationAttributeRowProps {
  attribute: OntologyRelationAttribute
  onOpenMetadata: (attribute: OntologyRelationAttribute) => void
}

export function RelationAttributeRow({
  attribute,
  onOpenMetadata,
}: RelationAttributeRowProps) {
  const [editing, setEditing] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [draft, setDraft] = useState({
    name: attribute.name,
    dataType: normalizeOntologyDataTypeOrDefault(attribute.data_type),
    required: attribute.required,
    description: attribute.description,
  })

  function handleSave() {
    setEditing(false)
    startTransition(async () => {
      await updateRelationAttribute(attribute.id, {
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
      required: attribute.required,
      description: attribute.description,
    })
  }

  function handleDelete() {
    startTransition(async () => {
      await deleteRelationAttribute(attribute.id)
    })
  }

  if (editing) {
    return (
      <TableRow>
        <TableCell>
          <Input
            value={draft.name}
            onChange={(event) =>
              setDraft((current) => ({ ...current, name: event.target.value }))
            }
            className="h-7 text-xs"
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
            onChange={(event) =>
              setDraft((current) => ({
                ...current,
                required: event.target.checked,
              }))
            }
          />
        </TableCell>
        <TableCell>
          <Textarea
            value={draft.description}
            onChange={(event) =>
              setDraft((current) => ({
                ...current,
                description: event.target.value,
              }))
            }
            rows={2}
            className="min-h-0 resize-none px-2 py-1.5 text-xs"
            onKeyDown={(event) => {
              if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
                event.preventDefault()
                handleSave()
              }
              if (event.key === "Escape") handleCancel()
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
              aria-label="Save relation attribute"
            >
              <Check className="h-3 w-3" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              onClick={handleCancel}
              disabled={isPending}
              aria-label="Cancel editing relation attribute"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </TableCell>
      </TableRow>
    )
  }

  return (
    <TableRow className={isPending ? "opacity-50" : undefined}>
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
            <Button type="button" variant="ghost" size="icon-xs">
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
