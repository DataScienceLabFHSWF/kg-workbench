import { getGraphUnmappedColor, getModuleColor } from "@/lib/colors"
import { NODE_HEIGHT, NODE_WIDTH } from "@/lib/flow-layout"

import type {
  AnyFactGraphNode,
  FactGraphNode,
  FactModuleGroupNode,
} from "../types"
// ─── Layout constants ─────────────────────────────────────────────────────────

const GROUP_PADDING_X = 20
const GROUP_PADDING_TOP = 36 // space for label
const GROUP_PADDING_BOTTOM = 16
const GROUP_GAP = 60 // minimum gap between groups

// ─── Bucket key sentinels ─────────────────────────────────────────────────────

const UNMAPPED_KEY = "__unmapped__"
const NO_MODULE_KEY = "__no-module__"

// ─── Internal types ───────────────────────────────────────────────────────────

interface GroupRect {
  key: string
  /** Intended X from dagre bounding box */
  x: number
  y: number
  w: number
  h: number
  /** Final X after overlap resolution */
  finalX: number
}

// ─── Main function ────────────────────────────────────────────────────────────

/**
 * Takes dagre-laid-out flat nodes (with absolute positions) and wraps them
 * in factModuleGroup container nodes. Applies a greedy non-overlap shift so
 * group bounding boxes never visually intersect. Children are re-positioned
 * relative to their parent group's final position.
 */
export function groupNodesByModule(
  laidOutNodes: FactGraphNode[],
  classMap: Map<string, { module_id: string | null }>,
  moduleIndexMap: Map<string, number>,
  moduleNameMap: Map<string, string>
): AnyFactGraphNode[] {
  // ── 1. Classify nodes into buckets ────────────────────────────────────────

  const buckets = new Map<string, FactGraphNode[]>()

  for (const node of laidOutNodes) {
    const { classId } = node.data
    let bucketKey: string

    if (classId === null) {
      bucketKey = UNMAPPED_KEY
    } else {
      const moduleId = classMap.get(classId)?.module_id ?? null
      bucketKey = moduleId ?? NO_MODULE_KEY
    }

    const existing = buckets.get(bucketKey)
    if (existing) {
      existing.push(node)
    } else {
      buckets.set(bucketKey, [node])
    }
  }

  // ── 2. Compute bounding boxes ─────────────────────────────────────────────

  const rects: GroupRect[] = []

  for (const [key, nodes] of buckets) {
    let minX = Infinity,
      minY = Infinity,
      maxX = -Infinity,
      maxY = -Infinity

    for (const node of nodes) {
      minX = Math.min(minX, node.position.x)
      minY = Math.min(minY, node.position.y)
      maxX = Math.max(maxX, node.position.x + NODE_WIDTH)
      maxY = Math.max(maxY, node.position.y + NODE_HEIGHT)
    }

    const x = minX - GROUP_PADDING_X
    const y = minY - GROUP_PADDING_TOP
    const w = maxX - minX + 2 * GROUP_PADDING_X
    const h = maxY - minY + GROUP_PADDING_TOP + GROUP_PADDING_BOTTOM

    rects.push({ key, x, y, w, h, finalX: x })
  }

  // ── 3. Resolve non-overlapping positions (greedy left-to-right sweep) ────

  // Sort by intended center-X so groups that dagre placed leftmost stay left
  rects.sort((a, b) => a.x + a.w / 2 - (b.x + b.w / 2))

  const placed: GroupRect[] = []

  for (const rect of rects) {
    let finalX = rect.x
    let changed = true

    while (changed) {
      changed = false
      for (const p of placed) {
        // Check vertical overlap (with gap)
        const yOverlap =
          rect.y < p.y + p.h + GROUP_GAP && rect.y + rect.h > p.y - GROUP_GAP
        if (!yOverlap) continue

        // Check horizontal overlap (with gap)
        const xOverlap =
          finalX < p.finalX + p.w + GROUP_GAP &&
          finalX + rect.w > p.finalX - GROUP_GAP
        if (xOverlap) {
          finalX = p.finalX + p.w + GROUP_GAP
          changed = true
          break
        }
      }
    }

    rect.finalX = finalX
    placed.push(rect)
  }

  // ── 4. Build result: sort by bucket priority, emit group then children ────

  // Re-sort by module priority for output order (groups render before children)
  rects.sort(
    (a, b) =>
      bucketRank(a.key, moduleIndexMap) - bucketRank(b.key, moduleIndexMap)
  )

  const result: AnyFactGraphNode[] = []

  for (const rect of rects) {
    const { key, y, w, h, finalX } = rect
    const groupNodes = buckets.get(key)!

    const { label, color } = resolveLabelAndColor(
      key,
      moduleIndexMap,
      moduleNameMap
    )

    const groupNode: FactModuleGroupNode = {
      id: `fact-group-${key}`,
      type: "factModuleGroup",
      position: { x: finalX, y },
      style: { width: w, height: h },
      data: { label, color },
    }

    // Children positions are relative to the group's ORIGINAL bounding box origin
    // (rect.x, rect.y), not finalX — so the shift moves the group + its children
    // together without altering the internal layout.
    const children: FactGraphNode[] = groupNodes.map((node) => ({
      ...node,
      parentId: `fact-group-${key}`,
      extent: "parent" as const,
      position: {
        x: node.position.x - rect.x,
        y: node.position.y - rect.y,
      },
    }))

    // Group before children (React Flow requirement)
    result.push(groupNode, ...children)
  }

  return result
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function bucketRank(
  bucketKey: string,
  moduleIndexMap: Map<string, number>
): number {
  if (bucketKey === NO_MODULE_KEY) return Number.MAX_SAFE_INTEGER - 1
  if (bucketKey === UNMAPPED_KEY) return Number.MAX_SAFE_INTEGER
  return moduleIndexMap.get(bucketKey) ?? 0
}

function resolveLabelAndColor(
  bucketKey: string,
  moduleIndexMap: Map<string, number>,
  moduleNameMap: Map<string, string>
): { label: string; color: string } {
  if (bucketKey === UNMAPPED_KEY) {
    return { label: "Unmapped", color: getGraphUnmappedColor() }
  }
  if (bucketKey === NO_MODULE_KEY) {
    return { label: "No Module", color: getModuleColor(-1) }
  }
  return {
    label: moduleNameMap.get(bucketKey) ?? bucketKey,
    color: getModuleColor(moduleIndexMap.get(bucketKey) ?? -1),
  }
}
