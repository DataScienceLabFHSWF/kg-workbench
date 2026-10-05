"use client"

import { Badge } from "@/components/ui/badge"
import type { OntologyRelation } from "@/domain/ontology"
import type { OntologyClassWithAttributes } from "@/features/ontology/server/queries"
import { truncateWithEllipsis } from "@/lib/truncate-with-ellipsis"
import { cn } from "@/lib/utils"

const RELATION_NAME_MAX_LENGTH = 35

interface RelationBrowserItemProps {
  relation: OntologyRelation
  classMap: Map<string, OntologyClassWithAttributes>
  attributeCount: number
  noteCount: number
  instanceCount: number
  isSelected: boolean
  onSelect: () => void
}

export function RelationBrowserItem({
  relation,
  classMap,
  attributeCount,
  noteCount,
  instanceCount,
  isSelected,
  onSelect,
}: RelationBrowserItemProps) {
  const domainClass = classMap.get(relation.domain_class_id)
  const rangeClass = classMap.get(relation.range_class_id)
  const relationName = truncateWithEllipsis(
    relation.name,
    RELATION_NAME_MAX_LENGTH
  )

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "flex w-full flex-col gap-1 rounded-md px-3 py-2 text-left text-sm hover:bg-muted",
        isSelected && "bg-muted"
      )}
    >
      <div className="flex min-w-0 items-center gap-2">
        <span className="min-w-0 font-medium" title={relation.name}>
          {relationName}
        </span>
        {relation.cardinality && (
          <Badge
            variant="outline"
            className="max-w-[8rem] shrink-0 text-[10px]"
            title={relation.cardinality}
          >
            {relation.cardinality}
          </Badge>
        )}
      </div>
      <p className="text-xs text-muted-foreground">
        {domainClass?.name ?? "?"} {"->"} {rangeClass?.name ?? "?"}
      </p>
      <div className="flex gap-2 text-xs text-muted-foreground">
        <span>{instanceCount} inst</span>
        <span>{attributeCount} attrs</span>
        <span>{noteCount} notes</span>
      </div>
    </button>
  )
}
