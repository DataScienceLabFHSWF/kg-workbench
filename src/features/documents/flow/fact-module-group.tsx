"use client"

import type { NodeProps } from "@xyflow/react"

import type { FactModuleGroupNode } from "./types"

export function FactModuleGroup({ data }: NodeProps<FactModuleGroupNode>) {
  return (
    <div
      className="h-full w-full rounded-lg border-2"
      style={{
        borderColor: data.color,
        backgroundColor: `${data.color}14`,
      }}
    >
      <span
        className="block px-3 py-2 text-xs font-semibold"
        style={{ color: data.color }}
      >
        {data.label}
      </span>
    </div>
  )
}
