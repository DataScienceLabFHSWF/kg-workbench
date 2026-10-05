import { MarkerType } from "@xyflow/react"

import { getClassColor } from "@/lib/colors"
import type { EffectiveStatus } from "@/lib/types"

import type { DocumentOntology, FactWithAnchors } from "../../server/queries"
import { getEffectiveStatus } from "../../utils/fact-status"
import type {
  ClassColorEntry,
  FactGraphEdge,
  FactGraphNode,
  FactGraphNodeData,
} from "../types"

export const STATUS_PRIORITY: Record<EffectiveStatus, number> = {
  unmapped: 0,
  pending: 1,
  rejected: 2,
  accepted: 3,
}

export function worstStatus(
  a: EffectiveStatus | "mixed",
  b: EffectiveStatus
): EffectiveStatus | "mixed" {
  if (a === "mixed") return "mixed"
  if (a === b) return a
  if (STATUS_PRIORITY[a] !== STATUS_PRIORITY[b]) {
    return STATUS_PRIORITY[a] < STATUS_PRIORITY[b] ? a : b
  }
  return "mixed"
}

export function entityKey(text: string, classId: string | null): string {
  return `entity::${text.toLowerCase().trim()}::${classId ?? "unmapped"}`
}

interface EntityMeta {
  entityText: string
  entityIds: Set<string>
  classId: string | null
  className: string | null
  classColor: string
  status: EffectiveStatus | "mixed" | null
  factCount: number
}

export function buildClassColorEntries(
  ontology: DocumentOntology,
  classColors: Map<string, string>
): ClassColorEntry[] {
  return ontology.classes.map((cls) => ({
    classId: cls.id,
    className: cls.name,
    color: getClassColor(cls.id, classColors),
  }))
}

export function buildEntityMeta(
  facts: FactWithAnchors[],
  classMap: Map<string, { module_id: string | null; name: string }>,
  classColors: Map<string, string>
): Map<string, EntityMeta> {
  const entityMeta = new Map<string, EntityMeta>()

  for (const fact of facts) {
    const subKey = entityKey(fact.subject_text, fact.subject_class_id)
    const objKey = entityKey(fact.object_text, fact.object_class_id)
    const status = getEffectiveStatus(fact)

    for (const [key, text, classId, entityId] of [
      [
        subKey,
        fact.subject_text,
        fact.subject_class_id,
        fact.subject_entity_id,
      ] as const,
      [
        objKey,
        fact.object_text,
        fact.object_class_id,
        fact.object_entity_id,
      ] as const,
    ]) {
      const existing = entityMeta.get(key)
      if (!existing) {
        const className = classId ? (classMap.get(classId)?.name ?? null) : null
        const classColor = getClassColor(classId, classColors)
        entityMeta.set(key, {
          entityText: text,
          entityIds: entityId ? new Set([entityId]) : new Set(),
          classId,
          className,
          classColor,
          status,
          factCount: 1,
        })
      } else {
        existing.status =
          existing.status === null
            ? status
            : worstStatus(existing.status, status)
        existing.factCount += 1
        if (entityId) {
          existing.entityIds.add(entityId)
        }
      }
    }
  }

  return entityMeta
}

export function buildRawNodes(
  entityMeta: Map<string, EntityMeta>,
  visibleEntityKeys: Set<string>
): { rawNodes: FactGraphNode[]; nodeIdByKey: Map<string, string> } {
  const rawNodes: FactGraphNode[] = []
  const nodeIdByKey = new Map<string, string>()
  let nodeIdx = 0

  for (const [key, meta] of entityMeta) {
    if (!visibleEntityKeys.has(key)) continue
    const nodeId = `n${nodeIdx++}`
    nodeIdByKey.set(key, nodeId)
    rawNodes.push({
      id: nodeId,
      type: "factGraphNode",
      position: { x: 0, y: 0 },
      data: {
        entityText: meta.entityText,
        entityId:
          meta.entityIds.size === 1
            ? (Array.from(meta.entityIds)[0] ?? null)
            : null,
        classId: meta.classId,
        className: meta.className,
        classColor: meta.classColor,
        effectiveStatus: (meta.status ??
          "pending") as FactGraphNodeData["effectiveStatus"],
        factCount: meta.factCount,
      },
    })
  }

  return { rawNodes, nodeIdByKey }
}

export function buildRawEdges(
  filteredFacts: FactWithAnchors[],
  nodeIdByKey: Map<string, string>
): FactGraphEdge[] {
  return filteredFacts.map((fact) => {
    const srcKey = entityKey(fact.subject_text, fact.subject_class_id)
    const tgtKey = entityKey(fact.object_text, fact.object_class_id)
    return {
      id: fact.id,
      source: nodeIdByKey.get(srcKey)!,
      target: nodeIdByKey.get(tgtKey)!,
      type: "factGraphEdge",
      markerEnd: { type: MarkerType.ArrowClosed, width: 14, height: 14 },
      data: {
        label: fact.relation_text,
        confidence: fact.confidence,
        effectiveStatus: getEffectiveStatus(fact),
        factId: fact.id,
      },
    }
  })
}
