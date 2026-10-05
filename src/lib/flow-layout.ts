import dagre from "dagre"
import type { Edge, Node } from "@xyflow/react"

export const NODE_WIDTH = 200
export const NODE_HEIGHT = 64

/**
 * Pick source/target handle IDs based on the relative positions of two nodes.
 * Uses the handle that points most directly toward the other node.
 */
export function selectHandles(
  sX: number,
  sY: number,
  tX: number,
  tY: number
): { sourceHandle: string; targetHandle: string } {
  const dx = tX - sX
  const dy = tY - sY
  if (Math.abs(dx) >= Math.abs(dy)) {
    return dx >= 0
      ? { sourceHandle: "s-right", targetHandle: "t-left" }
      : { sourceHandle: "s-left", targetHandle: "t-right" }
  }
  return dy >= 0
    ? { sourceHandle: "s-bottom", targetHandle: "t-top" }
    : { sourceHandle: "s-top", targetHandle: "t-bottom" }
}

export function layoutWithDagre(
  nodes: Node[],
  edges: Edge[],
  direction: "LR" | "TB" = "LR"
): Node[] {
  const g = new dagre.graphlib.Graph()
  g.setDefaultEdgeLabel(() => ({}))
  g.setGraph({ rankdir: direction, nodesep: 80, ranksep: 150 })

  for (const node of nodes) {
    g.setNode(node.id, { width: NODE_WIDTH, height: NODE_HEIGHT })
  }

  for (const edge of edges) {
    // dagre can't handle self-loops; skip them
    if (edge.source !== edge.target) {
      g.setEdge(edge.source, edge.target)
    }
  }

  dagre.layout(g)

  return nodes.map((node) => {
    const pos = g.node(node.id)
    return {
      ...node,
      position: {
        x: pos.x - NODE_WIDTH / 2,
        y: pos.y - NODE_HEIGHT / 2,
      },
    }
  })
}
