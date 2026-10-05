"use client"

import { NodeResizer, type ResizeParams } from "@xyflow/react"

import type { ModuleGroupNodeData } from "../use-ontology-flow"

interface ModuleGroupNodeProps {
  id: string
  data: ModuleGroupNodeData
  selected: boolean
}

export function ModuleGroupNode({ id, data, selected }: ModuleGroupNodeProps) {
  function handleResizeEnd(_: unknown, params: ResizeParams) {
    data.onResizeEnd?.(id, params.x, params.y, params.width, params.height)
  }

  return (
    <>
      <NodeResizer
        isVisible={selected}
        minWidth={160}
        minHeight={80}
        onResizeEnd={handleResizeEnd}
      />
      <div
        className="h-full w-full rounded-lg border-2"
        style={{ borderColor: data.color, backgroundColor: `${data.color}14` }}
      >
        <span
          className="block px-3 py-2 text-xs font-semibold"
          style={{ color: data.color }}
        >
          {data.label}
        </span>
      </div>
    </>
  )
}
