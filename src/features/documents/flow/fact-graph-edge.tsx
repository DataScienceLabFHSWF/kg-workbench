"use client"

import {
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  type Edge,
  type EdgeProps,
} from "@xyflow/react"

import { getReviewStatusStrokeColor } from "@/lib/colors"
import { cn } from "@/lib/utils"

import type { FactGraphEdgeData } from "./use-fact-graph"

type FactGraphEdgeType = Edge<FactGraphEdgeData, "factGraphEdge">

export function FactGraphEdge({
  id,
  source,
  target,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  selected,
  markerEnd,
  style,
}: EdgeProps<FactGraphEdgeType>) {
  const isSelfLoop = source === target
  const status = data?.effectiveStatus ?? "pending"
  const isHighlighted = data?.highlighted ?? false
  const stroke = getReviewStatusStrokeColor(status)
  const strokeWidth = 1.5
  const opacity = status === "rejected" ? 0.45 : 1

  const confidenceLabel =
    data?.confidence != null ? `${Math.round(data.confidence * 100)}%` : null
  const fullLabel = [data?.label, confidenceLabel].filter(Boolean).join(" · ")

  if (isSelfLoop) {
    const loopR = 40
    const d = [
      `M ${sourceX} ${sourceY}`,
      `C ${sourceX + loopR * 2} ${sourceY - loopR}`,
      `${sourceX + loopR * 2} ${sourceY + loopR}`,
      `${targetX} ${targetY - 2}`,
    ].join(" ")
    const labelX = sourceX + loopR * 2 + 8
    const labelY = sourceY

    return (
      <>
        {isHighlighted && (
          <path
            d={d}
            fill="none"
            stroke="var(--app-selection-border)"
            strokeWidth={strokeWidth + 8}
            opacity={0.35}
          />
        )}
        <path
          id={id}
          d={d}
          fill="none"
          className="react-flow__edge-path"
          style={{ ...style, stroke, strokeWidth, opacity }}
          markerEnd={markerEnd}
        />
        {fullLabel && (
          <EdgeLabelRenderer>
            <div
              className={cn(
                "nodrag nopan pointer-events-none absolute rounded bg-background px-1.5 py-0.5 text-xs",
                selected ? "font-medium text-primary" : "text-muted-foreground"
              )}
              style={{
                transform: `translate(${labelX}px, ${labelY}px) translate(-50%, -50%)`,
                opacity,
              }}
            >
              {fullLabel}
            </div>
          </EdgeLabelRenderer>
        )}
      </>
    )
  }

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  })

  return (
    <>
      {isHighlighted && (
        <path
          d={edgePath}
          fill="none"
          stroke="var(--app-selection-border)"
          strokeWidth={strokeWidth + 8}
          opacity={0.35}
        />
      )}
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={markerEnd}
        style={{ ...style, stroke, strokeWidth, opacity }}
      />
      {fullLabel && (
        <EdgeLabelRenderer>
          <div
            className={cn(
              "nodrag nopan pointer-events-none absolute rounded bg-background px-1.5 py-0.5 text-xs",
              selected ? "font-medium text-primary" : "text-muted-foreground"
            )}
            style={{
              transform: `translate(${labelX}px, ${labelY}px) translate(-50%, -50%)`,
              opacity,
            }}
          >
            {fullLabel}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  )
}
