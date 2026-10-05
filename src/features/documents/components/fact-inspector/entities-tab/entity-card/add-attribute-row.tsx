"use client"

import { Check, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { DocumentOntology } from "../../../../server/queries"

interface AddAttributeRowProps {
  availableAttributes: DocumentOntology["attributes"]
  value: string
  attributeId: string
  isSaving: boolean
  onValueChange: (value: string) => void
  onAttributeChange: (attributeId: string) => void
  onSave: () => Promise<void>
  onCancel: () => void
}

export function AddAttributeRow({
  availableAttributes,
  value,
  attributeId,
  isSaving,
  onValueChange,
  onAttributeChange,
  onSave,
  onCancel,
}: AddAttributeRowProps) {
  return (
    <div className="flex items-center gap-1.5 border-t border-border/40 px-3 py-1.5">
      <Select
        value={attributeId}
        onValueChange={onAttributeChange}
        disabled={isSaving}
      >
        <SelectTrigger className="h-6 w-32 shrink-0 text-[11px]">
          <SelectValue placeholder="Attribute..." />
        </SelectTrigger>
        <SelectContent>
          {availableAttributes.map((attribute) => (
            <SelectItem
              key={attribute.id}
              value={attribute.id}
              className="text-[11px]"
            >
              {attribute.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Input
        value={value}
        onChange={(event) => onValueChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") void onSave()
          if (event.key === "Escape") onCancel()
        }}
        placeholder="Value..."
        disabled={isSaving}
        className="h-6 min-w-0 flex-1 text-[11px]"
        autoFocus
      />
      <Button
        variant="ghost"
        size="icon"
        className="size-6 shrink-0"
        disabled={isSaving || !attributeId || !value.trim()}
        onClick={() => void onSave()}
      >
        <Check className="size-3" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="size-6 shrink-0"
        disabled={isSaving}
        onClick={onCancel}
      >
        <X className="size-3" />
      </Button>
    </div>
  )
}
