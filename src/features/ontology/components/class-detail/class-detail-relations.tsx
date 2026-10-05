"use client"

import { ArrowRight } from "lucide-react"

import type { OntologyRelation } from "@/domain/ontology"
import type { OntologyClassWithAttributes } from "@/features/ontology/server/queries"
import { cn } from "@/lib/utils"

interface ClassDetailRelationsProps {
  classId: string
  relations: OntologyRelation[]
  classMap: Map<string, OntologyClassWithAttributes>
  onNavigateToRelation: (relationId: string) => void
}

export function ClassDetailRelations({
  classId,
  relations,
  classMap,
  onNavigateToRelation,
}: ClassDetailRelationsProps) {
  const relevant = relations.filter(
    (r) => r.domain_class_id === classId || r.range_class_id === classId
  )

  if (relevant.length === 0) {
    return (
      <div>
        <p className="mb-2 text-xs font-medium text-muted-foreground">
          Relations (0)
        </p>
        <p className="text-xs text-muted-foreground">
          No relations involve this class.
        </p>
      </div>
    )
  }

  return (
    <div>
      <p className="mb-2 text-xs font-medium text-muted-foreground">
        Relations ({relevant.length})
      </p>
      <div className="flex flex-col gap-1">
        {relevant.map((rel) => {
          const isDomain = rel.domain_class_id === classId
          const otherClass = classMap.get(
            isDomain ? rel.range_class_id : rel.domain_class_id
          )

          return (
            <button
              key={rel.id}
              type="button"
              onClick={() => onNavigateToRelation(rel.id)}
              className={cn(
                "flex items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs hover:bg-muted"
              )}
            >
              <span className="font-medium">{rel.name}</span>
              <ArrowRight className="h-3 w-3 text-muted-foreground" />
              <span className="text-muted-foreground">
                {isDomain ? "→" : "←"} {otherClass?.name ?? "Unknown"}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
