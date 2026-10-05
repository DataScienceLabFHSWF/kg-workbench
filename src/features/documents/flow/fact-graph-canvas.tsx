"use client"

import { useEffect, useMemo } from "react"

import {
  Background,
  Controls,
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
  type EdgeMouseHandler,
  type NodeMouseHandler,
} from "@xyflow/react"
import "@xyflow/react/dist/style.css"

import type { EntitySelection } from "../components/fact-inspector/types"
import { ClassLegend } from "./class-legend"
import { FactGraphEdge } from "./fact-graph-edge"
import { FactGraphNode } from "./fact-graph-node"
import { FactModuleGroup } from "./fact-module-group"
import type {
  AnyFactGraphNode,
  ClassColorEntry,
  FactGraphEdge as FactGraphEdgeType,
  FactGraphNode as FactGraphNodeType,
} from "./use-fact-graph"

const nodeTypes = {
  factGraphNode: FactGraphNode,
  factModuleGroup: FactModuleGroup,
}
const edgeTypes = { factGraphEdge: FactGraphEdge }

function buildVisibleGraphKey(
  nodes: AnyFactGraphNode[],
  edges: FactGraphEdgeType[]
) {
  return JSON.stringify({
    nodes: nodes.map((node) => ({
      id: node.id,
      type: node.type,
      parentId: "parentId" in node ? (node.parentId ?? null) : null,
    })),
    edges: edges.map((edge) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
    })),
  })
}

interface FactGraphCanvasProps {
  nodes: AnyFactGraphNode[]
  edges: FactGraphEdgeType[]
  classColorEntries: ClassColorEntry[]
  onNodeClick: (selection: EntitySelection) => void
  onEdgeClick: (factId: string) => void
}

function FactGraphCanvasInner({
  nodes,
  edges,
  classColorEntries,
  onNodeClick,
  onEdgeClick,
}: FactGraphCanvasProps) {
  const { fitView } = useReactFlow()
  const visibleGraphKey = useMemo(
    () => buildVisibleGraphKey(nodes, edges),
    [nodes, edges]
  )

  useEffect(() => {
    const frameId = requestAnimationFrame(() => {
      fitView({ padding: 0.15, duration: 300 })
    })

    return () => window.cancelAnimationFrame(frameId)
  }, [fitView, visibleGraphKey])

  const handleNodeClick: NodeMouseHandler<AnyFactGraphNode> = (_, node) => {
    if (node.type === "factModuleGroup") return
    onNodeClick({
      entityId: (node as FactGraphNodeType).data.entityId,
      entityText: (node as FactGraphNodeType).data.entityText,
    })
  }

  const handleEdgeClick: EdgeMouseHandler<FactGraphEdgeType> = (_, edge) => {
    if (edge.data) onEdgeClick(edge.data.factId)
  }

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
      onNodeClick={handleNodeClick}
      onEdgeClick={handleEdgeClick}
      minZoom={0.1}
      maxZoom={2}
    >
      <Background />
      <Controls />

      <ClassLegend classColorEntries={classColorEntries} />
    </ReactFlow>
  )
}

export function FactGraphCanvas(props: FactGraphCanvasProps) {
  return (
    <ReactFlowProvider>
      <FactGraphCanvasInner {...props} />
    </ReactFlowProvider>
  )
}
