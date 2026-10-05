"use client"

import { useMemo } from "react"

import {
  layoutWithDagre,
  NODE_HEIGHT,
  NODE_WIDTH,
  selectHandles,
} from "@/lib/flow-layout"
import { buildClassColorMap } from "@/lib/colors"
import type { EffectiveStatus } from "@/lib/types"

import type { DocumentOntology, FactWithAnchors } from "../server/queries"
import { getEffectiveStatus } from "../utils/fact-status"
import type { AnyFactGraphNode, FactGraphNode } from "./types"
import {
  buildClassColorEntries,
  buildEntityMeta,
  buildRawEdges,
  buildRawNodes,
  entityKey,
} from "./utils/graph-builders"
import { groupNodesByModule } from "./utils/group-by-module"

// Re-export types for backward compatibility
export type {
  AnyFactGraphNode,
  ClassColorEntry,
  FactGraphEdge,
  FactGraphEdgeData,
  FactGraphNode,
  FactGraphNodeData,
  FactModuleGroupData,
  FactModuleGroupNode,
} from "./types"

// ─── Hook ─────────────────────────────────────────────────────────────────────

interface UseFactGraphOptions {
  facts: FactWithAnchors[]
  ontology: DocumentOntology | undefined
  activeStatuses: Set<EffectiveStatus>
  isolateSelection?: boolean
  selectedClassId?: string | null
  selectedEntityId?: string | null
  selectedEntityText?: string | null
  highlightedFactId?: string | null
  highlightedEntityId?: string | null
  highlightedEntityText?: string | null
  onEntityFilter?:
    | ((entityId: string | null, entityText: string) => void)
    | null
}

export function useFactGraph({
  facts,
  ontology,
  activeStatuses,
  isolateSelection = false,
  selectedClassId,
  selectedEntityId,
  selectedEntityText,
  highlightedFactId,
  highlightedEntityId,
  highlightedEntityText,
  onEntityFilter,
}: UseFactGraphOptions) {
  return useMemo(() => {
    if (!ontology || facts.length === 0) {
      return { nodes: [], edges: [], classColorEntries: [] }
    }

    const classMap = new Map(
      ontology.classes.map((c) => [
        c.id,
        { module_id: c.module_id, name: c.name },
      ])
    )
    const classColors = buildClassColorMap(ontology.classes.map((c) => c.id))
    const moduleIndexMap = new Map(ontology.modules.map((m, i) => [m.id, i]))
    const moduleNameMap = new Map(ontology.modules.map((m) => [m.id, m.name]))

    const classColorEntries = buildClassColorEntries(ontology, classColors)
    const entityMeta = buildEntityMeta(facts, classMap, classColors)

    // Filter facts by active statuses
    const filteredFacts = facts.filter((f) =>
      activeStatuses.has(getEffectiveStatus(f))
    )

    // Collect entity keys that appear in filtered facts
    const visibleEntityKeys = new Set<string>()
    for (const fact of filteredFacts) {
      visibleEntityKeys.add(entityKey(fact.subject_text, fact.subject_class_id))
      visibleEntityKeys.add(entityKey(fact.object_text, fact.object_class_id))
    }

    const { rawNodes, nodeIdByKey } = buildRawNodes(
      entityMeta,
      visibleEntityKeys
    )
    const normalizedSelectedEntityText =
      selectedEntityText?.trim().toLowerCase() ?? null
    const shouldIsolateSelection =
      isolateSelection &&
      (!!selectedClassId ||
        !!selectedEntityId ||
        !!normalizedSelectedEntityText)
    const isolatedRawNodes = shouldIsolateSelection
      ? rawNodes.filter((node) => {
          const matchesEntityId =
            !!selectedEntityId && node.data.entityId === selectedEntityId
          const matchesEntityText =
            !!normalizedSelectedEntityText &&
            node.data.entityText.trim().toLowerCase() ===
              normalizedSelectedEntityText

          if (selectedEntityId) {
            return matchesEntityId || (!node.data.entityId && matchesEntityText)
          }

          if (normalizedSelectedEntityText) {
            return matchesEntityText
          }

          return node.data.classId === selectedClassId
        })
      : rawNodes
    const rawEdges = shouldIsolateSelection
      ? []
      : buildRawEdges(filteredFacts, nodeIdByKey)

    // Layout with dagre, then group into module containers
    const laidOutNodes = layoutWithDagre(isolatedRawNodes, rawEdges, "LR")

    const groupedNodes = groupNodesByModule(
      laidOutNodes as FactGraphNode[],
      classMap,
      moduleIndexMap,
      moduleNameMap
    ) as AnyFactGraphNode[]

    const normalizedHighlightedEntityText =
      highlightedEntityText?.trim().toLowerCase() ?? null

    const nodes = groupedNodes.map((node) => {
      if (node.type !== "factGraphNode") {
        return node
      }

      const matchesHighlightedEntity =
        (!!highlightedEntityId && node.data.entityId === highlightedEntityId) ||
        (!!normalizedHighlightedEntityText &&
          node.data.entityText.trim().toLowerCase() ===
            normalizedHighlightedEntityText)

      return {
        ...node,
        selected: matchesHighlightedEntity,
        data: {
          ...node.data,
          onFilter: onEntityFilter
            ? () => onEntityFilter(node.data.entityId, node.data.entityText)
            : undefined,
        },
      }
    })

    // Build centerMap from final absolute positions (group.position + child.relativePosition).
    // This must happen after groupNodesByModule so the overlap-resolved positions are used.
    const groupPositions = new Map<string, { x: number; y: number }>()
    for (const node of nodes) {
      if (node.type === "factModuleGroup") {
        groupPositions.set(node.id, node.position)
      }
    }

    const centerMap = new Map<string, { x: number; y: number }>()
    for (const node of nodes) {
      if (node.type === "factGraphNode" && node.parentId) {
        const gp = groupPositions.get(node.parentId) ?? { x: 0, y: 0 }
        centerMap.set(node.id, {
          x: gp.x + node.position.x + NODE_WIDTH / 2,
          y: gp.y + node.position.y + NODE_HEIGHT / 2,
        })
      }
    }

    // Wire smart handles based on final absolute centers
    const edges = rawEdges.map((edge) => {
      const src = centerMap.get(edge.source)
      const tgt = centerMap.get(edge.target)
      const handles =
        src && tgt && edge.source !== edge.target
          ? selectHandles(src.x, src.y, tgt.x, tgt.y)
          : { sourceHandle: "s-right", targetHandle: "t-left" }
      const isHighlightedFact = edge.data?.factId === highlightedFactId

      return {
        ...edge,
        ...handles,
        selected: isHighlightedFact,
        data: edge.data
          ? { ...edge.data, highlighted: isHighlightedFact }
          : edge.data,
      }
    })

    return { nodes, edges, classColorEntries }
  }, [
    facts,
    ontology,
    activeStatuses,
    isolateSelection,
    selectedClassId,
    selectedEntityId,
    selectedEntityText,
    highlightedFactId,
    highlightedEntityId,
    highlightedEntityText,
    onEntityFilter,
  ])
}
