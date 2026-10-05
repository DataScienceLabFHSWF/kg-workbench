import type { Edge, Node } from "@xyflow/react"

import type { EffectiveStatus } from "@/lib/types"

export interface FactGraphNodeData extends Record<string, unknown> {
  entityText: string
  entityId: string | null
  classId: string | null
  className: string | null
  classColor: string
  effectiveStatus: EffectiveStatus | "mixed"
  factCount: number
  onFilter?: (() => void) | undefined
}

export interface FactGraphEdgeData extends Record<string, unknown> {
  label: string
  confidence: number | null
  effectiveStatus: EffectiveStatus
  factId: string
  highlighted?: boolean
}

export interface FactModuleGroupData extends Record<string, unknown> {
  label: string
  color: string
}

export type FactGraphNode = Node<FactGraphNodeData, "factGraphNode">
export type FactGraphEdge = Edge<FactGraphEdgeData, "factGraphEdge">
export type FactModuleGroupNode = Node<FactModuleGroupData, "factModuleGroup">

export type AnyFactGraphNode = FactGraphNode | FactModuleGroupNode

export interface ClassColorEntry {
  classId: string
  className: string
  color: string
}
