import type { Node } from "@xyflow/react"

import { getModuleColor } from "@/lib/colors"
import {
  layoutWithDagre,
  NODE_HEIGHT,
  NODE_WIDTH,
  selectHandles,
} from "@/lib/flow-layout"
import type { OntologyModule, OntologyRelation } from "@/domain/ontology"

import type { OntologyClassWithAttributes } from "../../server/queries"
import type { ClassNodeData, OntologyEdge, OntologyNode } from "../types"

export function buildModuleView(
  allClasses: OntologyClassWithAttributes[],
  relations: OntologyRelation[],
  classExamplesByClassId: Map<string, string[]>,
  classNoteCountByClassId: Map<string, number>,
  relationExampleByRelationId: Map<string, string>,
  modules: OntologyModule[],
  activeModuleId: string,
  modulePositions: Record<string, { x: number; y: number }> | undefined,
  classColors: Map<string, string>
): { nodes: OntologyNode[]; edges: OntologyEdge[] } {
  const moduleClasses = allClasses.filter((c) => c.module_id === activeModuleId)
  const moduleClassIds = new Set(moduleClasses.map((c) => c.id))
  const classMap = new Map(allClasses.map((c) => [c.id, c]))

  const relevantRelations = relations.filter(
    (r) =>
      moduleClassIds.has(r.domain_class_id) ||
      moduleClassIds.has(r.range_class_id)
  )

  const externalClassIds = new Set<string>()
  for (const relation of relevantRelations) {
    if (!moduleClassIds.has(relation.domain_class_id)) {
      externalClassIds.add(relation.domain_class_id)
    }
    if (!moduleClassIds.has(relation.range_class_id)) {
      externalClassIds.add(relation.range_class_id)
    }
  }

  const moduleIdx = modules.findIndex((module) => module.id === activeModuleId)
  const moduleColor = getModuleColor(moduleIdx)

  const nodes: OntologyNode[] = [
    ...moduleClasses.map(
      (cls): Node<ClassNodeData, "classNode"> => ({
        id: cls.id,
        type: "classNode",
        position: { x: 0, y: 0 },
        data: {
          label: cls.name,
          classColor: classColors.get(cls.id) ?? moduleColor,
          moduleColor,
          noteCount: classNoteCountByClassId.get(cls.id) ?? 0,
          examples: classExamplesByClassId.get(cls.id) ?? [],
          external: false,
        },
      })
    ),
    ...Array.from(externalClassIds).flatMap((classId) => {
      const cls = classMap.get(classId)
      if (!cls) return []

      const extModIdx = cls.module_id
        ? modules.findIndex((module) => module.id === cls.module_id)
        : -1
      const externalModuleColor = getModuleColor(extModIdx)

      return [
        {
          id: cls.id,
          type: "classNode" as const,
          position: { x: 0, y: 0 },
          data: {
            label: cls.name,
            classColor: classColors.get(cls.id) ?? externalModuleColor,
            moduleColor: externalModuleColor,
            noteCount: classNoteCountByClassId.get(cls.id) ?? 0,
            examples: classExamplesByClassId.get(cls.id) ?? [],
            external: true,
          },
        } satisfies Node<ClassNodeData, "classNode">,
      ]
    }),
  ]

  const laidOut = layoutWithDagre(
    nodes,
    relevantRelations.map((relation) => ({
      id: relation.id,
      source: relation.domain_class_id,
      target: relation.range_class_id,
      type: "relationEdge",
      data: { label: relation.name },
    })),
    "LR"
  )

  const positioned = laidOut.map((node) => {
    const saved = modulePositions?.[node.id]
    return saved ? { ...node, position: saved } : node
  })

  const centerMap = new Map(
    positioned
      .filter((node) => node.type === "classNode")
      .map((node) => [
        node.id,
        {
          x: node.position.x + NODE_WIDTH / 2,
          y: node.position.y + NODE_HEIGHT / 2,
        },
      ])
  )

  const edges: OntologyEdge[] = relevantRelations.map((relation) => {
    const src = centerMap.get(relation.domain_class_id)
    const tgt = centerMap.get(relation.range_class_id)
    const handles =
      src && tgt && relation.domain_class_id !== relation.range_class_id
        ? selectHandles(src.x, src.y, tgt.x, tgt.y)
        : { sourceHandle: "s-right", targetHandle: "t-left" }

    return {
      id: relation.id,
      source: relation.domain_class_id,
      target: relation.range_class_id,
      type: "relationEdge",
      data: {
        label: relation.name,
        example: relationExampleByRelationId.get(relation.id) ?? null,
      },
      ...handles,
    }
  })

  return { nodes: positioned as OntologyNode[], edges }
}
