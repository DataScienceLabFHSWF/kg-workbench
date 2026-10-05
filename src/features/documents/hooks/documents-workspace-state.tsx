"use client"

import {
  createContext,
  useContext,
  useMemo,
  useReducer,
  type ReactNode,
} from "react"

import type { EffectiveStatus } from "@/lib/types"

import type {
  EntitySelection,
  FactHighlightSource,
} from "../components/fact-inspector/types"
import {
  createAllEffectiveStatuses,
  hasAllEffectiveStatuses,
} from "../utils/fact-status"
import {
  createDefaultDocumentFiltersState,
  DOCUMENT_FILTER_ALL,
  type DocumentConcreteFilterValue,
  type DocumentEntityFilter,
  type DocumentExtractedRelationFilter,
  type DocumentFiltersState,
  type DocumentSingleFilterValue,
} from "../utils/document-filters"

export type ViewMode = "reader" | "graph" | "table"

interface DocumentsWorkspaceState {
  sharedFilters: DocumentFiltersState
  nodesOnly: boolean
  selectedDocumentId: string | null
  anchorFilter: string | null
  jumpToParagraphId: string | null
  paragraphFactCounts: Map<string, number>
  activeSectionId: string | null
  scrollToSectionId: string | null
  syncEnabled: boolean
  viewMode: ViewMode
  inspectorEntitySelection: EntitySelection | null
  highlightedFactId: string | null
  highlightedFactSource: FactHighlightSource | null
  highlightedFactRequestKey: number
}

type DocumentsWorkspaceAction =
  | { type: "reset_workspace" }
  | { type: "toggle_status"; status: EffectiveStatus }
  | { type: "select_all_statuses" }
  | { type: "set_section"; value: DocumentSingleFilterValue }
  | { type: "set_module"; value: DocumentSingleFilterValue }
  | { type: "set_class"; value: DocumentSingleFilterValue }
  | { type: "set_subject_class"; value: DocumentSingleFilterValue }
  | { type: "set_object_class"; value: DocumentSingleFilterValue }
  | { type: "set_relation"; value: DocumentSingleFilterValue }
  | {
      type: "set_entity"
      value: DocumentConcreteFilterValue<DocumentEntityFilter>
    }
  | {
      type: "set_subject_entity"
      value: DocumentConcreteFilterValue<DocumentEntityFilter>
    }
  | {
      type: "set_object_entity"
      value: DocumentConcreteFilterValue<DocumentEntityFilter>
    }
  | {
      type: "set_extracted_relation"
      value: DocumentConcreteFilterValue<DocumentExtractedRelationFilter>
    }
  | { type: "set_scope"; value: DocumentFiltersState["scope"] }
  | { type: "set_module_link"; value: DocumentFiltersState["moduleLink"] }
  | {
      type: "set_completeness"
      value: DocumentFiltersState["completeness"]
    }
  | { type: "set_nodes_only"; value: boolean }
  | { type: "select_document"; documentId: string | null }
  | { type: "toggle_anchor_filter"; paragraphId: string | null }
  | { type: "jump_to_paragraph"; paragraphId: string | null }
  | { type: "set_paragraph_fact_counts"; counts: Map<string, number> }
  | { type: "set_active_section"; sectionId: string | null }
  | { type: "scroll_to_section"; sectionId: string | null }
  | { type: "clear_scroll_to_section" }
  | { type: "toggle_sync" }
  | { type: "set_view_mode"; value: ViewMode }
  | { type: "set_inspector_entity_selection"; value: EntitySelection | null }
  | {
      type: "highlight_fact"
      factId: string | null
      source: FactHighlightSource | null
    }

export interface DocumentsWorkspaceController extends DocumentsWorkspaceState {
  toggleStatus: (status: EffectiveStatus) => void
  selectAllStatuses: () => void
  setSection: (value: DocumentSingleFilterValue) => void
  setSectionId: (sectionId: string | null) => void
  setModule: (value: DocumentSingleFilterValue) => void
  setClass: (value: DocumentSingleFilterValue) => void
  setSubjectClass: (value: DocumentSingleFilterValue) => void
  setObjectClass: (value: DocumentSingleFilterValue) => void
  setRelation: (value: DocumentSingleFilterValue) => void
  setEntity: (value: DocumentConcreteFilterValue<DocumentEntityFilter>) => void
  setSubjectEntity: (
    value: DocumentConcreteFilterValue<DocumentEntityFilter>
  ) => void
  setObjectEntity: (
    value: DocumentConcreteFilterValue<DocumentEntityFilter>
  ) => void
  setExtractedRelation: (
    value: DocumentConcreteFilterValue<DocumentExtractedRelationFilter>
  ) => void
  setScope: (value: DocumentFiltersState["scope"]) => void
  setModuleLink: (value: DocumentFiltersState["moduleLink"]) => void
  setCompleteness: (value: DocumentFiltersState["completeness"]) => void
  setNodesOnly: (value: boolean) => void
  selectDocument: (documentId: string | null) => void
  toggleAnchorFilter: (paragraphId: string | null) => void
  jumpToParagraph: (paragraphId: string | null) => void
  setParagraphFactCounts: (counts: Map<string, number>) => void
  setActiveSection: (sectionId: string | null) => void
  scrollToSection: (sectionId: string | null) => void
  clearScrollToSection: () => void
  toggleSync: () => void
  setViewMode: (value: ViewMode) => void
  setInspectorEntitySelection: (value: EntitySelection | null) => void
  highlightFact: (
    factId: string | null,
    source?: FactHighlightSource | null
  ) => void
  resetWorkspace: () => void
}

const DocumentsWorkspaceContext =
  createContext<DocumentsWorkspaceController | null>(null)

function createDefaultDocumentsWorkspaceState(): DocumentsWorkspaceState {
  return {
    sharedFilters: createDefaultDocumentFiltersState(),
    nodesOnly: false,
    selectedDocumentId: null,
    anchorFilter: null,
    jumpToParagraphId: null,
    paragraphFactCounts: new Map(),
    activeSectionId: null,
    scrollToSectionId: null,
    syncEnabled: true,
    viewMode: "reader" as ViewMode,
    inspectorEntitySelection: null,
    highlightedFactId: null,
    highlightedFactSource: null,
    highlightedFactRequestKey: 0,
  }
}

function clearFactSelectionState(state: DocumentsWorkspaceState) {
  return {
    ...state,
    inspectorEntitySelection: null,
    highlightedFactId: null,
    highlightedFactSource: null,
    highlightedFactRequestKey: 0,
  }
}

function documentsWorkspaceReducer(
  state: DocumentsWorkspaceState,
  action: DocumentsWorkspaceAction
): DocumentsWorkspaceState {
  switch (action.type) {
    case "reset_workspace":
      return {
        ...state,
        sharedFilters: createDefaultDocumentFiltersState(),
        nodesOnly: false,
        anchorFilter: null,
        jumpToParagraphId: null,
        inspectorEntitySelection: null,
        highlightedFactId: null,
        highlightedFactSource: null,
        highlightedFactRequestKey: 0,
      }
    case "toggle_status": {
      const next = new Set(state.sharedFilters.statuses)
      if (next.has(action.status)) {
        if (next.size === 1) {
          return state
        }
        next.delete(action.status)
      } else {
        next.add(action.status)
      }
      return {
        ...state,
        sharedFilters: { ...state.sharedFilters, statuses: next },
      }
    }
    case "select_all_statuses":
      return hasAllEffectiveStatuses(state.sharedFilters.statuses)
        ? state
        : {
            ...state,
            sharedFilters: {
              ...state.sharedFilters,
              statuses: createAllEffectiveStatuses(),
            },
          }
    case "set_section":
      return {
        ...state,
        sharedFilters: { ...state.sharedFilters, section: action.value },
      }
    case "set_module":
      return {
        ...state,
        sharedFilters: { ...state.sharedFilters, module: action.value },
      }
    case "set_class":
      return {
        ...state,
        sharedFilters: { ...state.sharedFilters, class: action.value },
      }
    case "set_subject_class":
      return {
        ...state,
        sharedFilters: { ...state.sharedFilters, subjectClass: action.value },
      }
    case "set_object_class":
      return {
        ...state,
        sharedFilters: { ...state.sharedFilters, objectClass: action.value },
      }
    case "set_relation":
      return {
        ...state,
        sharedFilters: { ...state.sharedFilters, relation: action.value },
      }
    case "set_entity":
      return {
        ...state,
        sharedFilters: { ...state.sharedFilters, entity: action.value },
      }
    case "set_subject_entity":
      return {
        ...state,
        sharedFilters: { ...state.sharedFilters, subjectEntity: action.value },
      }
    case "set_object_entity":
      return {
        ...state,
        sharedFilters: { ...state.sharedFilters, objectEntity: action.value },
      }
    case "set_extracted_relation":
      return {
        ...state,
        sharedFilters: {
          ...state.sharedFilters,
          extractedRelation: action.value,
        },
      }
    case "set_scope":
      return {
        ...state,
        sharedFilters: { ...state.sharedFilters, scope: action.value },
      }
    case "set_module_link":
      return {
        ...state,
        sharedFilters: { ...state.sharedFilters, moduleLink: action.value },
      }
    case "set_completeness":
      return {
        ...state,
        sharedFilters: { ...state.sharedFilters, completeness: action.value },
      }
    case "set_nodes_only":
      return {
        ...state,
        nodesOnly: action.value,
      }
    case "select_document":
      return {
        ...state,
        selectedDocumentId: action.documentId,
        sharedFilters: createDefaultDocumentFiltersState(),
        nodesOnly: false,
        anchorFilter: null,
        jumpToParagraphId: null,
        paragraphFactCounts: new Map(),
        activeSectionId: null,
        scrollToSectionId: null,
        inspectorEntitySelection: null,
        highlightedFactId: null,
        highlightedFactSource: null,
        highlightedFactRequestKey: 0,
      }
    case "toggle_anchor_filter":
      return {
        ...state,
        anchorFilter:
          state.anchorFilter === action.paragraphId ? null : action.paragraphId,
      }
    case "jump_to_paragraph":
      return {
        ...state,
        jumpToParagraphId:
          state.jumpToParagraphId === action.paragraphId
            ? null
            : action.paragraphId,
      }
    case "set_paragraph_fact_counts":
      return { ...state, paragraphFactCounts: action.counts }
    case "set_active_section":
      return { ...state, activeSectionId: action.sectionId }
    case "scroll_to_section":
      return { ...state, scrollToSectionId: action.sectionId }
    case "clear_scroll_to_section":
      return state.scrollToSectionId === null
        ? state
        : { ...state, scrollToSectionId: null }
    case "toggle_sync":
      return { ...state, syncEnabled: !state.syncEnabled }
    case "set_view_mode":
      return {
        ...clearFactSelectionState(state),
        viewMode: action.value,
        nodesOnly: action.value === "graph" ? state.nodesOnly : false,
        anchorFilter: null,
      }
    case "set_inspector_entity_selection":
      return {
        ...clearFactSelectionState(state),
        inspectorEntitySelection: action.value,
      }
    case "highlight_fact":
      return {
        ...state,
        inspectorEntitySelection: null,
        highlightedFactId: action.factId,
        highlightedFactSource: action.source,
        highlightedFactRequestKey: state.highlightedFactRequestKey + 1,
      }
  }
}

export function useDocumentsWorkspaceState(): DocumentsWorkspaceController {
  const [state, dispatch] = useReducer(
    documentsWorkspaceReducer,
    undefined,
    createDefaultDocumentsWorkspaceState
  )

  const actions = useMemo(
    () => ({
      toggleStatus: (status: EffectiveStatus) =>
        dispatch({ type: "toggle_status", status }),
      selectAllStatuses: () => dispatch({ type: "select_all_statuses" }),
      setSection: (value: DocumentSingleFilterValue) =>
        dispatch({ type: "set_section", value }),
      setSectionId: (sectionId: string | null) =>
        dispatch({
          type: "set_section",
          value:
            sectionId === null
              ? DOCUMENT_FILTER_ALL
              : { id: sectionId, name: sectionId },
        }),
      setModule: (value: DocumentSingleFilterValue) =>
        dispatch({ type: "set_module", value }),
      setClass: (value: DocumentSingleFilterValue) =>
        dispatch({ type: "set_class", value }),
      setSubjectClass: (value: DocumentSingleFilterValue) =>
        dispatch({ type: "set_subject_class", value }),
      setObjectClass: (value: DocumentSingleFilterValue) =>
        dispatch({ type: "set_object_class", value }),
      setRelation: (value: DocumentSingleFilterValue) =>
        dispatch({ type: "set_relation", value }),
      setEntity: (value: DocumentConcreteFilterValue<DocumentEntityFilter>) =>
        dispatch({ type: "set_entity", value }),
      setSubjectEntity: (
        value: DocumentConcreteFilterValue<DocumentEntityFilter>
      ) => dispatch({ type: "set_subject_entity", value }),
      setObjectEntity: (
        value: DocumentConcreteFilterValue<DocumentEntityFilter>
      ) => dispatch({ type: "set_object_entity", value }),
      setExtractedRelation: (
        value: DocumentConcreteFilterValue<DocumentExtractedRelationFilter>
      ) => dispatch({ type: "set_extracted_relation", value }),
      setScope: (value: DocumentFiltersState["scope"]) =>
        dispatch({ type: "set_scope", value }),
      setModuleLink: (value: DocumentFiltersState["moduleLink"]) =>
        dispatch({ type: "set_module_link", value }),
      setCompleteness: (value: DocumentFiltersState["completeness"]) =>
        dispatch({ type: "set_completeness", value }),
      setNodesOnly: (value: boolean) =>
        dispatch({ type: "set_nodes_only", value }),
      selectDocument: (documentId: string | null) =>
        dispatch({ type: "select_document", documentId }),
      toggleAnchorFilter: (paragraphId: string | null) =>
        dispatch({ type: "toggle_anchor_filter", paragraphId }),
      jumpToParagraph: (paragraphId: string | null) =>
        dispatch({ type: "jump_to_paragraph", paragraphId }),
      setParagraphFactCounts: (counts: Map<string, number>) =>
        dispatch({ type: "set_paragraph_fact_counts", counts }),
      setActiveSection: (sectionId: string | null) =>
        dispatch({ type: "set_active_section", sectionId }),
      scrollToSection: (sectionId: string | null) =>
        dispatch({ type: "scroll_to_section", sectionId }),
      clearScrollToSection: () => dispatch({ type: "clear_scroll_to_section" }),
      toggleSync: () => dispatch({ type: "toggle_sync" }),
      setViewMode: (value: ViewMode) =>
        dispatch({ type: "set_view_mode", value }),
      setInspectorEntitySelection: (value: EntitySelection | null) =>
        dispatch({ type: "set_inspector_entity_selection", value }),
      highlightFact: (
        factId: string | null,
        source: FactHighlightSource | null = "inspector"
      ) => dispatch({ type: "highlight_fact", factId, source }),
      resetWorkspace: () => dispatch({ type: "reset_workspace" }),
    }),
    [dispatch]
  )

  return {
    ...state,
    ...actions,
  }
}

export function DocumentsWorkspaceProvider({
  value,
  children,
}: {
  value: DocumentsWorkspaceController
  children: ReactNode
}) {
  return (
    <DocumentsWorkspaceContext.Provider value={value}>
      {children}
    </DocumentsWorkspaceContext.Provider>
  )
}

export function useDocumentsWorkspace() {
  const context = useContext(DocumentsWorkspaceContext)

  if (!context) {
    throw new Error(
      "useDocumentsWorkspace must be used within DocumentsWorkspaceProvider."
    )
  }

  return context
}
