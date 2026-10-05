import { getModuleColor } from "@/lib/colors"
import { NODE_HEIGHT, NODE_WIDTH, selectHandles } from "@/lib/flow-layout"
import type { OntologyModule, OntologyRelation } from "@/domain/ontology"

import type {
  ClassPositionsByModule,
  ModuleLayoutMap,
  OntologyClassWithAttributes,
} from "../../server/queries"
import type { OntologyEdge, OntologyNode } from "../types"

const GROUP_PADDING_X = 20
const GROUP_PADDING_TOP = 36
const GROUP_PADDING_BOTTOM = 16
const NODE_GAP = 12

const GROUP_GAP_X = 60
const GROUP_GAP_Y = 60
const GROUPS_PER_ROW = 3

export function buildAllModulesView(
  allClasses: OntologyClassWithAttributes[],
  relations: OntologyRelation[],
  classExamplesByClassId: Map<string, string[]>,
  classNoteCountByClassId: Map<string, number>,
  relationExampleByRelationId: Map<string, string>,
  modules: OntologyModule[],
  savedModuleLayouts: ModuleLayoutMap | undefined,
  savedPositions: ClassPositionsByModule | undefined,
  classColors: Map<string, string>
): { nodes: OntologyNode[]; edges: OntologyEdge[] } {
  const groupWidth = NODE_WIDTH + 2 * GROUP_PADDING_X

  const classesByModule = new Map<string, OntologyClassWithAttributes[]>()
  for (const ontologyModule of modules)
    classesByModule.set(ontologyModule.id, [])
  classesByModule.set("none", [])

  for (const cls of allClasses) {
    const key = cls.module_id ?? "none"
    if (!classesByModule.has(key)) classesByModule.set(key, [])
    classesByModule.get(key)!.push(cls)
  }

  const groupKeys = [
    ...modules.map((ontologyModule) => ontologyModule.id),
    ...(classesByModule.get("none")!.length > 0 ? ["none"] : []),
  ]

  const moduleMap = new Map(
    modules.map((ontologyModule) => [ontologyModule.id, ontologyModule])
  )

  const nodes: OntologyNode[] = []
  const nodeAbsCenter = new Map<string, { x: number; y: number }>()

  let currentX = 0
  let currentY = 0
  let rowMaxHeight = 0

  groupKeys.forEach((key, idx) => {
    const groupClasses = classesByModule.get(key) ?? []
    const groupHeight =
      GROUP_PADDING_TOP +
      groupClasses.length * (NODE_HEIGHT + NODE_GAP) -
      (groupClasses.length > 0 ? NODE_GAP : 0) +
      GROUP_PADDING_BOTTOM

    if (idx > 0 && idx % GROUPS_PER_ROW === 0) {
      currentY += rowMaxHeight + GROUP_GAP_Y
      currentX = 0
      rowMaxHeight = 0
    }

    const groupX = currentX
    const groupY = currentY

    rowMaxHeight = Math.max(rowMaxHeight, groupHeight)
    currentX += groupWidth + GROUP_GAP_X

    const moduleIdx =
      key === "none" ? -1 : modules.findIndex((m) => m.id === key)
    const moduleColor = getModuleColor(moduleIdx)
    const label =
      key === "none" ? "No Module" : (moduleMap.get(key)?.name ?? key)

    const savedLayout = key !== "none" ? savedModuleLayouts?.[key] : undefined
    nodes.push({
      id: `group-${key}`,
      type: "moduleGroup",
      position: savedLayout
        ? { x: savedLayout.x, y: savedLayout.y }
        : { x: groupX, y: groupY },
      style: {
        width: savedLayout?.width ?? groupWidth,
        height: savedLayout?.height ?? groupHeight,
      },
      data: { label, color: moduleColor },
    })

    const resolvedGroupX = savedLayout?.x ?? groupX
    const resolvedGroupY = savedLayout?.y ?? groupY

    groupClasses.forEach((cls, index) => {
      const savedClassPos =
        key !== "none" ? savedPositions?.[key]?.[cls.id] : undefined
      const defaultRelY = GROUP_PADDING_TOP + index * (NODE_HEIGHT + NODE_GAP)
      const relX = savedClassPos?.x ?? GROUP_PADDING_X
      const relY = savedClassPos?.y ?? defaultRelY

      nodeAbsCenter.set(cls.id, {
        x: resolvedGroupX + relX + NODE_WIDTH / 2,
        y: resolvedGroupY + relY + NODE_HEIGHT / 2,
      })
      nodes.push({
        id: cls.id,
        type: "classNode",
        parentId: `group-${key}`,
        extent: "parent",
        position: { x: relX, y: relY },
        data: {
          label: cls.name,
          classColor: classColors.get(cls.id) ?? moduleColor,
          moduleColor,
          noteCount: classNoteCountByClassId.get(cls.id) ?? 0,
          examples: classExamplesByClassId.get(cls.id) ?? [],
          external: false,
        },
      })
    })
  })

  const edges: OntologyEdge[] = relations.map((relation) => {
    const src = nodeAbsCenter.get(relation.domain_class_id)
    const tgt = nodeAbsCenter.get(relation.range_class_id)
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

  return { nodes, edges }
}
