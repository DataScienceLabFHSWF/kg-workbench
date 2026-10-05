"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { toast } from "sonner"

import {
  Background,
  Controls,
  MarkerType,
  ReactFlow,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
  useReactFlow,
  type EdgeMouseHandler,
  type EdgeTypes,
  type NodeMouseHandler,
  type Node,
  type NodeTypes,
  type OnNodeDrag,
} from "@xyflow/react"
import "@xyflow/react/dist/style.css"

import {
  saveClassPosition,
  saveModuleLayout,
} from "@/features/ontology/server/actions/layout"
import type {
  ClassPositionsByModule,
  ModuleLayoutMap,
  OntologyClassWithAttributes,
} from "@/features/ontology/server/queries"
import type {
  OntologyExample,
  OntologyLanguage,
  OntologyModule,
  OntologyNote,
  OntologyRelation,
} from "@/domain/ontology"

import { CreateClassDialog } from "../../components/dialogs/create-class-dialog"
import { CreateRelationDialog } from "../../components/dialogs/create-relation-dialog"
import { ClassNode } from "../class-node"
import { RelationEdge } from "../relation-edge"
import { useOntologyFlow } from "../use-ontology-flow"
import { CanvasActionsPanel } from "./canvas-actions-panel"
import { ModuleGroupNode } from "./module-group-node"

export interface OntologyCanvasProps {
  ontologyId: string
  classes: OntologyClassWithAttributes[]
  relations: OntologyRelation[]
  examples: OntologyExample[]
  notes: OntologyNote[]
  modules: OntologyModule[]
  languages: OntologyLanguage[]
  defaultLanguage?: string | null
  activeModuleId: string | null
  selectedEntityId: string | null
  savedPositions: ClassPositionsByModule
  savedModuleLayouts: ModuleLayoutMap
  onSelectClass: (id: string) => void
  onSelectRelation: (id: string) => void
  onSelectModule: (id: string) => void
  onClassCreated: (classId: string) => void
  onRelationCreated: (relationId: string) => void
}

const nodeTypes: NodeTypes = {
  classNode: ClassNode,
  moduleGroup: ModuleGroupNode,
}

const edgeTypes: EdgeTypes = {
  relationEdge: RelationEdge,
}

const defaultEdgeOptions = {
  markerEnd: { type: MarkerType.ArrowClosed, width: 14, height: 14 },
}

function buildGraphLayoutKey({
  activeModuleId,
  classes,
  relations,
  modules,
}: Pick<
  OntologyCanvasProps,
  "activeModuleId" | "classes" | "relations" | "modules"
>) {
  return JSON.stringify({
    activeModuleId,
    classIds: classes.map((ontologyClass) => ontologyClass.id).sort(),
    relationIds: relations.map((relation) => relation.id).sort(),
    moduleIds: modules.map((module) => module.id).sort(),
  })
}

function mergeNodePositions<T extends Node>(
  currentNodes: T[],
  nextNodes: T[]
): T[] {
  const currentNodeById = new Map(
    currentNodes.map((node) => [node.id, node] as const)
  )

  return nextNodes.map((node) => {
    const currentNode = currentNodeById.get(node.id)
    if (!currentNode || currentNode.type !== node.type) return node

    return {
      ...node,
      position: currentNode.position,
      measured: currentNode.measured,
      style:
        node.type === "moduleGroup" && currentNode.style
          ? { ...currentNode.style, ...node.style }
          : node.style,
    }
  })
}

function OntologyCanvasInner({
  ontologyId,
  classes,
  relations,
  examples,
  notes,
  modules,
  languages,
  defaultLanguage,
  activeModuleId,
  selectedEntityId,
  savedPositions,
  savedModuleLayouts,
  onSelectClass,
  onSelectRelation,
  onSelectModule,
  onClassCreated,
  onRelationCreated,
}: OntologyCanvasProps) {
  const [createClassOpen, setCreateClassOpen] = useState(false)
  const [createRelationOpen, setCreateRelationOpen] = useState(false)
  const [localSavedPositions, setLocalSavedPositions] = useState(savedPositions)
  const [localSavedModuleLayouts, setLocalSavedModuleLayouts] =
    useState(savedModuleLayouts)
  const { fitView } = useReactFlow()
  const graphLayoutKey = useMemo(
    () =>
      buildGraphLayoutKey({
        activeModuleId,
        classes,
        relations,
        modules,
      }),
    [activeModuleId, classes, relations, modules]
  )
  const previousGraphLayoutKeyRef = useRef<string | null>(null)
  const { nodes: flowNodes, edges: flowEdges } = useOntologyFlow({
    classes,
    relations,
    examples,
    notes,
    modules,
    activeModuleId,
    savedPositions: localSavedPositions,
    savedModuleLayouts: localSavedModuleLayouts,
  })

  const [nodes, setNodes, onNodesChange] = useNodesState(flowNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(flowEdges)

  useEffect(() => {
    setLocalSavedPositions(savedPositions)
  }, [savedPositions])

  useEffect(() => {
    setLocalSavedModuleLayouts(savedModuleLayouts)
  }, [savedModuleLayouts])

  const persistClassPosition = useCallback(
    async (classId: string, moduleId: string, x: number, y: number) => {
      try {
        await saveClassPosition(ontologyId, classId, moduleId, x, y)
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "Failed to save class position."
        )
      }
    },
    [ontologyId]
  )

  const persistModuleLayout = useCallback(
    async (
      moduleId: string,
      x: number,
      y: number,
      width: number,
      height: number
    ) => {
      try {
        await saveModuleLayout(ontologyId, moduleId, x, y, width, height)
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "Failed to save module layout."
        )
      }
    },
    [ontologyId]
  )

  const handleModuleResizeEnd = useCallback(
    (nodeId: string, x: number, y: number, width: number, height: number) => {
      const moduleId = nodeId.replace(/^group-/, "")
      setLocalSavedModuleLayouts((currentLayouts) => ({
        ...currentLayouts,
        [moduleId]: { x, y, width, height },
      }))
      void persistModuleLayout(moduleId, x, y, width, height)
    },
    [persistModuleLayout]
  )

  // Sync when source data changes; inject resize callback into module group nodes.
  useEffect(() => {
    const nextNodes = flowNodes.map((node) =>
      node.type === "moduleGroup"
        ? {
            ...node,
            selected: node.id === selectedEntityId,
            data: { ...node.data, onResizeEnd: handleModuleResizeEnd },
          }
        : { ...node, selected: node.id === selectedEntityId }
    )
    const graphLayoutChanged =
      previousGraphLayoutKeyRef.current !== graphLayoutKey

    setNodes((currentNodes) =>
      graphLayoutChanged
        ? nextNodes
        : mergeNodePositions(currentNodes, nextNodes)
    )
    setEdges(
      flowEdges.map((edge) => ({
        ...edge,
        selected: edge.id === selectedEntityId,
      }))
    )
    previousGraphLayoutKeyRef.current = graphLayoutKey
  }, [
    flowNodes,
    flowEdges,
    graphLayoutKey,
    handleModuleResizeEnd,
    selectedEntityId,
    setNodes,
    setEdges,
  ])

  // Fit only when the graph context changes, not after drag persistence or metadata refreshes.
  useEffect(() => {
    if (previousGraphLayoutKeyRef.current !== graphLayoutKey) return

    // Fit view after nodes settle.
    const frameId = requestAnimationFrame(() => {
      fitView({ padding: 0.15, duration: 300 })
    })

    return () => window.cancelAnimationFrame(frameId)
  }, [fitView, graphLayoutKey])

  const handleNodeClick = useCallback<NodeMouseHandler>(
    (_, node) => {
      if (node.type === "moduleGroup") {
        const moduleId = node.id.replace(/^group-/, "")
        if (modules.some((ontologyModule) => ontologyModule.id === moduleId)) {
          onSelectModule(moduleId)
        }
        return
      }
      onSelectClass(node.id)
    },
    [modules, onSelectClass, onSelectModule]
  )

  const handleEdgeClick = useCallback<EdgeMouseHandler>(
    (_, edge) => {
      onSelectRelation(edge.id)
    },
    [onSelectRelation]
  )

  const handleNodeDragStop = useCallback<OnNodeDrag>(
    (_, node) => {
      if (node.type === "classNode") {
        // Module-specific view: activeModuleId is the view key.
        // All-modules view: use the class's own module (from parentId "group-<moduleId>").
        const moduleId =
          activeModuleId ?? node.parentId?.replace(/^group-/, "") ?? null
        if (moduleId) {
          const position = { x: node.position.x, y: node.position.y }
          setLocalSavedPositions((currentPositions) => ({
            ...currentPositions,
            [moduleId]: {
              ...currentPositions[moduleId],
              [node.id]: position,
            },
          }))
          void persistClassPosition(node.id, moduleId, position.x, position.y)
        }
      } else if (node.type === "moduleGroup") {
        // id is "group-<moduleId>".
        const moduleId = node.id.replace(/^group-/, "")
        // Use measured dimensions (set by ReactFlow from the DOM) with style fallback.
        const w =
          node.measured?.width ??
          (typeof node.style?.width === "number" ? node.style.width : 0)
        const h =
          node.measured?.height ??
          (typeof node.style?.height === "number" ? node.style.height : 0)
        const layout = {
          x: node.position.x,
          y: node.position.y,
          width: w,
          height: h,
        }
        setLocalSavedModuleLayouts((currentLayouts) => ({
          ...currentLayouts,
          [moduleId]: layout,
        }))
        void persistModuleLayout(
          moduleId,
          layout.x,
          layout.y,
          layout.width,
          layout.height
        )
      }
    },
    [activeModuleId, persistClassPosition, persistModuleLayout]
  )

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
      defaultEdgeOptions={defaultEdgeOptions}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onNodeClick={handleNodeClick}
      onEdgeClick={handleEdgeClick}
      onNodeDragStop={handleNodeDragStop}
      minZoom={0.1}
    >
      <Background />
      <Controls />
      <CanvasActionsPanel
        onCreateClass={() => setCreateClassOpen(true)}
        onCreateRelation={() => setCreateRelationOpen(true)}
      />
      <CreateClassDialog
        ontologyId={ontologyId}
        languages={languages}
        defaultLanguage={defaultLanguage}
        modules={modules}
        allClasses={classes}
        defaultModuleId={activeModuleId}
        open={createClassOpen}
        onOpenChange={setCreateClassOpen}
        onSuccess={(classId) => {
          setCreateClassOpen(false)
          onClassCreated(classId)
        }}
      />
      <CreateRelationDialog
        ontologyId={ontologyId}
        allClasses={classes}
        modules={modules}
        languages={languages}
        defaultLanguage={defaultLanguage}
        currentModuleId={activeModuleId}
        open={createRelationOpen}
        onOpenChange={setCreateRelationOpen}
        onSuccess={(relationId) => {
          setCreateRelationOpen(false)
          onRelationCreated(relationId)
        }}
      />
    </ReactFlow>
  )
}

export function OntologyCanvas(props: OntologyCanvasProps) {
  return (
    <div className="h-full w-full">
      <ReactFlowProvider>
        <OntologyCanvasInner {...props} />
      </ReactFlowProvider>
    </div>
  )
}
