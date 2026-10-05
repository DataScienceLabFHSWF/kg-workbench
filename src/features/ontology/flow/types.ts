import type { Edge, Node } from "@xyflow/react"

export interface ClassNodeData extends Record<string, unknown> {
  label: string
  classColor: string
  moduleColor: string
  noteCount: number
  examples: string[]
  external: boolean
}

export interface ModuleGroupNodeData extends Record<string, unknown> {
  label: string
  color: string
  onResizeEnd?: (
    moduleId: string,
    x: number,
    y: number,
    width: number,
    height: number
  ) => void
}

export interface RelationEdgeData extends Record<string, unknown> {
  label: string
  example: string | null
}

export type OntologyNode =
  | Node<ClassNodeData, "classNode">
  | Node<ModuleGroupNodeData, "moduleGroup">
export type OntologyEdge = Edge<RelationEdgeData>
