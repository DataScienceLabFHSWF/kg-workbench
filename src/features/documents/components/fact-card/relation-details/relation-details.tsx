"use client"

import { useState } from "react"
import { AlertTriangle, ChevronDown, ChevronRight } from "lucide-react"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { APP_COLOR_CLASSES } from "@/lib/colors"
import { cn } from "@/lib/utils"

import type { DocumentOntology, FactWithAnchors } from "../../../server/queries"
import { RelationDetailRow } from "./relation-detail-row"

interface RelationDetailsProps {
  fact: FactWithAnchors
  documentId: string
  relationAttributes: DocumentOntology["relationAttributes"]
  disabled: boolean
  initiallyOpen?: boolean
}

export function RelationDetails({
  fact,
  documentId,
  relationAttributes,
  disabled,
  initiallyOpen = false,
}: RelationDetailsProps) {
  const attributes = relationAttributes.filter(
    (attribute) => attribute.relationId === fact.relation_type_id
  )
  const [open, setOpen] = useState(initiallyOpen)
  const valueByAttributeId = new Map(
    fact.relation_attribute_values.map((value) => [
      value.relation_attribute_id,
      value,
    ])
  )
  const missingRequiredCount = attributes.filter(
    (attribute) => attribute.required && !valueByAttributeId.has(attribute.id)
  ).length

  if (fact.relation_type_id === null || attributes.length === 0) {
    return null
  }

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <div className="rounded-md border border-border/60 bg-muted/20">
        <CollapsibleTrigger className="flex w-full items-center gap-2 px-2 py-1.5 text-left hover:bg-muted/40">
          {open ? (
            <ChevronDown className="size-3 shrink-0 text-muted-foreground" />
          ) : (
            <ChevronRight className="size-3 shrink-0 text-muted-foreground" />
          )}
          <span className="text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">
            Relation Attributes
          </span>
          <span className="text-[10px] text-muted-foreground">
            ({attributes.length})
          </span>
          {missingRequiredCount > 0 ? (
            <span
              className={cn(
                "ml-auto inline-flex items-center gap-1 text-[10px]",
                APP_COLOR_CLASSES.warningText
              )}
            >
              <AlertTriangle className="size-3 shrink-0" />
              {missingRequiredCount} missing
            </span>
          ) : null}
        </CollapsibleTrigger>
        <CollapsibleContent className="px-2 pb-2">
          <div className="space-y-0.5">
            {attributes.map((attribute) => (
              <RelationDetailRow
                key={attribute.id}
                factId={fact.id}
                documentId={documentId}
                attribute={attribute}
                value={valueByAttributeId.get(attribute.id) ?? null}
                disabled={disabled}
              />
            ))}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  )
}
