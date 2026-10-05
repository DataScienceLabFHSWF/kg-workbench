"use client"

import { BaseEdge, Edge, getBezierPath, type EdgeProps } from "@xyflow/react"

import { RelationEdgeLabel } from "./components/relation-edge-label"
import type { RelationEdgeData } from "./types"

type RelationEdgeType = Edge<RelationEdgeData, "relationEdge">

export function RelationEdge({
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
}: EdgeProps<RelationEdgeType>) {
  const isSelfLoop = source === target

  if (isSelfLoop) {
    const loopR = 40
    // Loop path: start at source, curve out to the right and back
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
        <path
          id={id}
          d={d}
          fill="none"
          className="react-flow__edge-path"
          style={{
            ...style,
            stroke: selected ? "var(--primary)" : "var(--muted-foreground)",
            strokeWidth: selected ? 2 : 1.5,
          }}
          markerEnd={markerEnd}
        />
        <RelationEdgeLabel
          data={data}
          selected={selected}
          labelX={labelX}
          labelY={labelY}
        />
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
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          ...style,
          stroke: selected ? "var(--primary)" : "var(--muted-foreground)",
          strokeWidth: selected ? 2 : 1.5,
        }}
      />
      <RelationEdgeLabel
        data={data}
        selected={selected}
        labelX={labelX}
        labelY={labelY}
      />
    </>
  )
}
