"use client"

import { EdgeLabelRenderer } from "@xyflow/react"

import { cn } from "@/lib/utils"

import type { RelationEdgeData } from "../../types"

interface RelationEdgeLabelProps {
  data: RelationEdgeData | undefined
  selected: boolean | undefined
  labelX: number
  labelY: number
}

const EMPTY_EXAMPLE_HINT = "Add an example in Instances"

export function RelationEdgeLabel({
  data,
  selected,
  labelX,
  labelY,
}: RelationEdgeLabelProps) {
  if (!data?.label) {
    return null
  }

  const exampleText = data.example?.trim()
  const detailText = selected ? exampleText || EMPTY_EXAMPLE_HINT : null

  return (
    <EdgeLabelRenderer>
      <div
        className={cn(
          "nodrag nopan pointer-events-none absolute max-w-64 rounded bg-background px-1.5 py-0.5 text-xs shadow-sm",
          detailText && "py-1",
          selected ? "font-medium text-primary" : "text-muted-foreground"
        )}
        style={{
          transform: `translate(${labelX}px, ${labelY}px) translate(-50%, -50%)`,
        }}
      >
        <div className="whitespace-nowrap">{data.label}</div>
        {detailText && (
          <div className="mt-0.5 text-[11px] leading-4 whitespace-normal text-muted-foreground">
            {detailText}
          </div>
        )}
      </div>
    </EdgeLabelRenderer>
  )
}
