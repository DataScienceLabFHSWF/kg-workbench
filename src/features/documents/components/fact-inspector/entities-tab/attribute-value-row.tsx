"use client"

import { useState } from "react"
import { AlertTriangle, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useQueryClient } from "@tanstack/react-query"
import { APP_COLOR_CLASSES } from "@/lib/colors"
import { cn } from "@/lib/utils"
import { InlineEditText } from "../../fact-card/inline-edit-text"
import {
  deleteAttributeValue,
  upsertAttributeValue,
} from "../../../server/actions/entities"

const ATTRIBUTE_VALUE_PREVIEW_LENGTH = 10

interface AttributeValueRowProps {
  id?: string | null
  entityId: string
  attributeId: string
  attributeName: string
  value: string
  isMismatched: boolean
  isMissingRequired?: boolean
  documentId: string
}

export function AttributeValueRow({
  id,
  entityId,
  attributeId,
  attributeName,
  value,
  isMismatched,
  isMissingRequired = false,
  documentId,
}: AttributeValueRowProps) {
  const queryClient = useQueryClient()
  const [isPending, setIsPending] = useState(false)

  async function handleSave(newValue: string) {
    setIsPending(true)
    try {
      await upsertAttributeValue(entityId, attributeId, newValue, documentId)
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["document-entities", documentId],
        }),
        queryClient.invalidateQueries({
          queryKey: ["document-facts", documentId],
        }),
      ])
    } finally {
      setIsPending(false)
    }
  }

  async function handleDelete() {
    if (!id) return

    setIsPending(true)
    try {
      await deleteAttributeValue(id, documentId)
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["document-entities", documentId],
        }),
        queryClient.invalidateQueries({
          queryKey: ["document-facts", documentId],
        }),
      ])
    } finally {
      setIsPending(false)
    }
  }

  return (
    <div
      className={cn(
        "flex items-center gap-2 px-3 py-0.5",
        isMissingRequired && "bg-amber-50/70"
      )}
    >
      <span className="w-28 shrink-0 truncate text-[11px] text-muted-foreground">
        {attributeName}
      </span>
      <div className="min-w-0 flex-1">
        <InlineEditText
          value={value}
          onSave={handleSave}
          disabled={isPending}
          className="text-[11px]"
          placeholder={
            isMissingRequired ? "Required value missing" : "Click to add value"
          }
          previewLength={ATTRIBUTE_VALUE_PREVIEW_LENGTH}
        />
      </div>
      {isMissingRequired && (
        <Tooltip>
          <TooltipTrigger asChild>
            <AlertTriangle
              className={cn("size-3.5 shrink-0", APP_COLOR_CLASSES.warningText)}
            />
          </TooltipTrigger>
          <TooltipContent side="left" className="max-w-48 text-xs">
            This required class attribute is missing.
          </TooltipContent>
        </Tooltip>
      )}
      {isMismatched && (
        <Tooltip>
          <TooltipTrigger asChild>
            <AlertTriangle
              className={cn("size-3.5 shrink-0", APP_COLOR_CLASSES.warningText)}
            />
          </TooltipTrigger>
          <TooltipContent side="left" className="max-w-48 text-xs">
            This attribute belongs to a different class than the entity&apos;s
            current class.
          </TooltipContent>
        </Tooltip>
      )}
      {id ? (
        <Button
          variant="ghost"
          size="icon"
          className="size-5 shrink-0"
          disabled={isPending}
          onClick={handleDelete}
        >
          <X className="size-3" />
        </Button>
      ) : null}
    </div>
  )
}
