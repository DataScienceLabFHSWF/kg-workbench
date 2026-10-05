"use client"

import { useState } from "react"
import { AlertTriangle, X } from "lucide-react"
import { useQueryClient } from "@tanstack/react-query"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { APP_COLOR_CLASSES } from "@/lib/colors"
import { cn } from "@/lib/utils"
import type { FactRelationAttributeValue } from "@/domain/documents"

import type { DocumentOntologyRelationAttribute } from "../../../server/queries"
import {
  deleteRelationAttributeValue,
  upsertRelationAttributeValue,
} from "../../../server/actions/relation-attribute-values"
import { InlineEditText } from "../inline-edit-text"

interface RelationDetailRowProps {
  factId: string
  documentId: string
  attribute: DocumentOntologyRelationAttribute
  value: FactRelationAttributeValue | null
  disabled: boolean
}

export function RelationDetailRow({
  factId,
  documentId,
  attribute,
  value,
  disabled,
}: RelationDetailRowProps) {
  const queryClient = useQueryClient()
  const [isPending, setIsPending] = useState(false)
  const isMissingRequired = attribute.required && value === null

  async function refreshFacts() {
    await queryClient.invalidateQueries({
      queryKey: ["document-facts", documentId],
    })
  }

  async function handleSave(nextValue: string) {
    setIsPending(true)
    try {
      await upsertRelationAttributeValue(factId, attribute.id, nextValue)
      await refreshFacts()
    } finally {
      setIsPending(false)
    }
  }

  async function handleDelete() {
    if (!value) return

    setIsPending(true)
    try {
      await deleteRelationAttributeValue(value.id)
      await refreshFacts()
    } finally {
      setIsPending(false)
    }
  }

  return (
    <div
      className={cn(
        "flex items-start gap-2 rounded-sm px-2 py-1",
        isMissingRequired && "bg-amber-50/70"
      )}
    >
      <div className="flex w-28 shrink-0 items-center gap-1 pt-0.5">
        <span className="truncate text-[11px] text-muted-foreground">
          {attribute.name}
        </span>
        {attribute.required && (
          <Badge variant="outline" className="h-4 px-1 text-[9px]">
            Req.
          </Badge>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <InlineEditText
          value={value?.value ?? ""}
          onSave={handleSave}
          disabled={disabled || isPending}
          className="text-[11px]"
          placeholder={
            isMissingRequired ? "Required value missing" : "Add value"
          }
          previewLength={18}
        />
        {attribute.description ? (
          <p className="mt-0.5 text-[10px] text-muted-foreground">
            {attribute.description}
          </p>
        ) : null}
      </div>
      {isMissingRequired ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <AlertTriangle
              className={cn(
                "mt-0.5 size-3.5 shrink-0",
                APP_COLOR_CLASSES.warningText
              )}
            />
          </TooltipTrigger>
          <TooltipContent side="left" className="max-w-48 text-xs">
            This required relation attribute is missing.
          </TooltipContent>
        </Tooltip>
      ) : null}
      {value ? (
        <Button
          variant="ghost"
          size="icon"
          className="mt-0.5 size-5 shrink-0"
          disabled={disabled || isPending}
          onClick={() => void handleDelete()}
        >
          <X className="size-3" />
        </Button>
      ) : null}
    </div>
  )
}
