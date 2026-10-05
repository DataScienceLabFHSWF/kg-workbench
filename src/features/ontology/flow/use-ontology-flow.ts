"use client"

import { useMemo } from "react"

import { buildClassColorMap, getModuleColor } from "@/lib/colors"
import { NODE_HEIGHT, NODE_WIDTH } from "@/lib/flow-layout"
import type {
  OntologyExample,
  OntologyModule,
  OntologyNote,
  OntologyRelation,
} from "@/domain/ontology"

import type {
  ClassPositionsByModule,
  ModuleLayoutMap,
  OntologyClassWithAttributes,
} from "../server/queries"
import { formatRelationExample, getClassExampleValues } from "./example-preview"
import { buildAllModulesView } from "./utils/all-modules-view"
import { buildModuleView } from "./utils/module-view"

// Re-export types for backward compatibility
export type {
  ClassNodeData,
  ModuleGroupNodeData,
  OntologyEdge,
  OntologyNode,
  RelationEdgeData,
} from "./types"

export { NODE_WIDTH, NODE_HEIGHT, getModuleColor }

// ─── Hook ─────────────────────────────────────────────────────────────────────

interface UseOntologyFlowOptions {
  classes: OntologyClassWithAttributes[]
  relations: OntologyRelation[]
  examples: OntologyExample[]
  notes: OntologyNote[]
  modules: OntologyModule[]
  activeModuleId: string | null
  savedPositions?: ClassPositionsByModule
  savedModuleLayouts?: ModuleLayoutMap
}

export function useOntologyFlow({
  classes,
  relations,
  examples,
  notes,
  modules,
  activeModuleId,
  savedPositions,
  savedModuleLayouts,
}: UseOntologyFlowOptions) {
  return useMemo(() => {
    const classColors = buildClassColorMap(classes.map((cls) => cls.id))
    const classExamplesByClassId = new Map<string, string[]>()
    const classNoteCountByClassId = new Map<string, number>()
    const relationExampleByRelationId = new Map<string, string>()

    for (const example of examples) {
      if (example.target_class_id) {
        const currentExamples =
          classExamplesByClassId.get(example.target_class_id) ?? []
        currentExamples.push(...getClassExampleValues([example]))
        classExamplesByClassId.set(example.target_class_id, currentExamples)
      }

      if (
        example.target_relation_id &&
        !relationExampleByRelationId.has(example.target_relation_id)
      ) {
        const formattedExample = formatRelationExample(example)
        if (formattedExample) {
          relationExampleByRelationId.set(
            example.target_relation_id,
            formattedExample
          )
        }
      }
    }

    for (const note of notes) {
      if (note.target_class_id) {
        classNoteCountByClassId.set(
          note.target_class_id,
          (classNoteCountByClassId.get(note.target_class_id) ?? 0) + 1
        )
      }
    }

    if (activeModuleId) {
      return buildModuleView(
        classes,
        relations,
        classExamplesByClassId,
        classNoteCountByClassId,
        relationExampleByRelationId,
        modules,
        activeModuleId,
        savedPositions?.[activeModuleId],
        classColors
      )
    }
    return buildAllModulesView(
      classes,
      relations,
      classExamplesByClassId,
      classNoteCountByClassId,
      relationExampleByRelationId,
      modules,
      savedModuleLayouts,
      savedPositions,
      classColors
    )
  }, [
    classes,
    relations,
    examples,
    notes,
    modules,
    activeModuleId,
    savedPositions,
    savedModuleLayouts,
  ])
}
