"use client"

import type { EffectiveStatus } from "@/lib/types"
import type { FactWithAnchors } from "../../../server/queries"
import { RelationFactRow } from "./relation-fact-row"

interface RelationFactListProps {
  facts: FactWithAnchors[]
  statuses?: Map<string, EffectiveStatus>
  highlightedFactId?: string | null
  onFactClick?: (factId: string) => void
  onFilter?: (relationText: string) => void
  className?: string
}

export function RelationFactList({
  facts,
  statuses,
  highlightedFactId,
  onFactClick,
  onFilter,
  className = "",
}: RelationFactListProps) {
  return (
    <div className={className}>
      {facts.map((fact) => (
        <RelationFactRow
          key={fact.id}
          fact={fact}
          status={statuses?.get(fact.id)}
          highlighted={highlightedFactId === fact.id}
          onClick={onFactClick}
          onFilter={onFilter}
        />
      ))}
    </div>
  )
}
