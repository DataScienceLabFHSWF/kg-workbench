"use client"

import { Badge } from "@/components/ui/badge"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { FilterIconButton } from "@/components/shared/filter-icon-button"
import { ChevronDown, ChevronRight } from "lucide-react"

import type { DocumentOntology, FactWithAnchors } from "../../../server/queries"
import { FactCard } from "../../fact-card/fact-card"

interface CQSectionProps {
  cq: DocumentOntology["cqs"][number]
  pattern: string
  facts: FactWithAnchors[]
  documentId: string
  open: boolean
  highlightedFactId?: string | null
  onOpenChange: (open: boolean) => void
  onApplyFilter: () => void
  onJumpToParagraph: (id: string | null) => void
  onEntityClick?: (entityId: string) => void
  onFactClick?: (factId: string) => void
}

export function CQSection({
  cq,
  pattern,
  facts,
  documentId,
  open,
  highlightedFactId,
  onOpenChange,
  onApplyFilter,
  onJumpToParagraph,
  onEntityClick,
  onFactClick,
}: CQSectionProps) {
  return (
    <Collapsible open={open} onOpenChange={onOpenChange}>
      <div className="border-b">
        <CollapsibleTrigger className="flex w-full items-start gap-2 px-3 py-2 text-left hover:bg-muted/60">
          {open ? (
            <ChevronDown className="mt-0.5 h-3 w-3 shrink-0 text-muted-foreground" />
          ) : (
            <ChevronRight className="mt-0.5 h-3 w-3 shrink-0 text-muted-foreground" />
          )}
          <div className="min-w-0 flex-1">
            <div className="flex items-start gap-2">
              <p className="min-w-0 flex-1 text-xs font-medium break-words">
                {cq.question || "Untitled competency question"}
              </p>
              <span className="shrink-0 text-[10px] text-muted-foreground">
                ({facts.length})
              </span>
            </div>
            {pattern ? (
              <p className="mt-1 text-[11px] text-muted-foreground">
                {pattern}
              </p>
            ) : null}
            {cq.modules.length > 0 ? (
              <div className="mt-1 flex flex-wrap gap-1">
                {cq.modules.map((module) => (
                  <Badge
                    key={module.id}
                    variant="outline"
                    className="text-[9px]"
                  >
                    {module.name}
                  </Badge>
                ))}
              </div>
            ) : (
              <div className="mt-1">
                <Badge variant="secondary" className="text-[9px]">
                  Ontology-wide
                </Badge>
              </div>
            )}
          </div>
          <FilterIconButton
            onClick={(event) => {
              event.stopPropagation()
              onApplyFilter()
            }}
            label="Apply competency question filter"
            className="mt-0.5 shrink-0 rounded p-1 text-muted-foreground/60 hover:bg-accent hover:text-foreground"
          />
        </CollapsibleTrigger>
        <CollapsibleContent>
          {facts.length > 0 ? (
            <div className="space-y-2 px-3 pt-1 pb-3">
              {facts.map((fact) => (
                <div
                  key={fact.id}
                  className={
                    highlightedFactId === fact.id
                      ? "rounded-md ring-2 ring-primary ring-offset-1"
                      : undefined
                  }
                >
                  <FactCard
                    fact={fact}
                    documentId={documentId}
                    onAnchorClick={onJumpToParagraph}
                    onEntityClick={onEntityClick}
                    onGoToGraph={onFactClick}
                  />
                </div>
              ))}
            </div>
          ) : (
            <p className="px-3 pt-1 pb-3 text-xs text-muted-foreground">
              No facts match this CQ with the current filters.
            </p>
          )}
        </CollapsibleContent>
      </div>
    </Collapsible>
  )
}
