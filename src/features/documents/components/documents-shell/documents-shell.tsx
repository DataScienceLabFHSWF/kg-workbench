"use client"

import { useEffect, useState } from "react"

import { toast } from "sonner"

import { fetchDocuments, type DocumentListItem } from "../../server/queries"

import {
  importExtractionResults,
  pollExtractionStatus,
} from "../../server/actions/extraction"
import { DocumentFiltersToolbar } from "../shared/document-filters-toolbar/document-filters-toolbar"
import { DocumentWorkspaceHeader } from "../shared/document-workspace-header/document-workspace-header"
import { FactTable } from "../fact-table/fact-table"
import { DocumentBrowserPanel } from "./document-browser-panel"
import {
  DocumentsWorkspaceProvider,
  type ViewMode,
  useDocumentsWorkspaceState,
} from "../../hooks/documents-workspace-state"
import { DocumentReaderPanel } from "./document-reader-panel"
import { FactInspectorPanel } from "./fact-inspector-panel"
import { SyncToggleStrip } from "./sync-toggle-strip"
import type { UploadDocumentResult } from "../upload-document-dialog"

export interface DocumentsShellProps {
  initialDocuments: DocumentListItem[]
}

const DEFAULT_PANEL_COLLAPSE_BY_VIEW: Record<
  ViewMode,
  { browser: boolean; inspector: boolean }
> = {
  reader: { browser: false, inspector: false },
  graph: { browser: true, inspector: false },
  table: { browser: true, inspector: false },
}

export function DocumentsShell({ initialDocuments }: DocumentsShellProps) {
  const workspace = useDocumentsWorkspaceState()
  const {
    viewMode,
    syncEnabled,
    selectDocument,
    selectedDocumentId,
    toggleSync,
  } = workspace

  const [documents, setDocuments] =
    useState<DocumentListItem[]>(initialDocuments)
  const [activeRun, setActiveRun] = useState<{
    runId: string
    documentId: string
    externalApiKey?: string
  } | null>(null)

  const [browserTab, setBrowserTab] = useState<"documents" | "toc">("documents")
  const [panelCollapseByView, setPanelCollapseByView] = useState(
    DEFAULT_PANEL_COLLAPSE_BY_VIEW
  )

  const isBrowserCollapsed = panelCollapseByView[viewMode].browser
  const isInspectorCollapsed = panelCollapseByView[viewMode].inspector

  useEffect(() => {
    if (!activeRun) return

    let stopped = false
    const interval = setInterval(async () => {
      if (stopped) return

      try {
        const externalRuntimeOptions = activeRun.externalApiKey
          ? { externalApiKey: activeRun.externalApiKey }
          : undefined
        const result = await pollExtractionStatus(
          activeRun.runId,
          externalRuntimeOptions
        )
        if (result.status === "completed") {
          stopped = true
          clearInterval(interval)
          await importExtractionResults(activeRun.runId, externalRuntimeOptions)
          const refreshedDocuments = await fetchDocuments()
          setDocuments(refreshedDocuments)
          selectDocument(activeRun.documentId)
          setActiveRun(null)
          toast.success("Extraction complete. Facts are ready for review.")
        } else if (result.status === "failed") {
          stopped = true
          clearInterval(interval)
          setDocuments((prev) =>
            prev.map((document) =>
              document.id === activeRun.documentId
                ? { ...document, status: "uploaded" }
                : document
            )
          )
          setActiveRun(null)
          toast.error(result.error ?? "Extraction failed. Please try again.")
        }
      } catch {
        stopped = true
        clearInterval(interval)
        setActiveRun(null)
        toast.error("Error checking extraction status.")
      }
    }, 3000)

    return () => {
      stopped = true
      clearInterval(interval)
    }
  }, [activeRun, selectDocument])

  function handleDocumentUploaded({
    document,
    runId,
    externalApiKey,
  }: UploadDocumentResult) {
    setDocuments((prev) => [{ ...document, ontologyBase: null }, ...prev])
    setActiveRun({ runId, documentId: document.id, externalApiKey })
  }

  function handleDocumentDeleted(documentId: string) {
    const deletedIndex = documents.findIndex(
      (document) => document.id === documentId
    )
    const nextDocuments = documents.filter(
      (document) => document.id !== documentId
    )

    setDocuments(nextDocuments)
    setActiveRun((prev) => (prev?.documentId === documentId ? null : prev))

    if (selectedDocumentId === documentId) {
      const nextSelectedDocumentId =
        nextDocuments[deletedIndex]?.id ??
        nextDocuments[deletedIndex - 1]?.id ??
        null

      selectDocument(nextSelectedDocumentId)
      setBrowserTab("documents")
    }
  }

  function handleSelectDocument(documentId: string) {
    selectDocument(documentId)
    setBrowserTab("documents")
    setPanelCollapsed("browser", false)
  }

  function setPanelCollapsed(
    panel: "browser" | "inspector",
    collapsed: boolean
  ) {
    setPanelCollapseByView((prev) => ({
      ...prev,
      [viewMode]: {
        ...prev[viewMode],
        [panel]: collapsed,
      },
    }))
  }

  function revealInspectorPanel() {
    setPanelCollapsed("inspector", false)
  }

  return (
    <DocumentsWorkspaceProvider value={workspace}>
      <div className="flex h-screen flex-col">
        <div className="flex min-h-0 flex-1">
          <DocumentBrowserPanel
            documents={documents}
            isCollapsed={isBrowserCollapsed}
            browserTab={browserTab}
            onSelectDocument={handleSelectDocument}
            onDocumentUploaded={handleDocumentUploaded}
            onDocumentDeleted={handleDocumentDeleted}
            onTabChange={setBrowserTab}
            onCollapse={() => setPanelCollapsed("browser", true)}
            onExpand={() => setPanelCollapsed("browser", false)}
          />

          <div className="flex min-h-0 min-w-0 flex-1 flex-col">
            <DocumentWorkspaceHeader />
            <DocumentFiltersToolbar />

            <div className="flex min-h-0 flex-1">
              {viewMode === "table" ? (
                <div className="min-h-0 min-w-0 flex-1">
                  <FactTable onRevealInspector={revealInspectorPanel} />
                </div>
              ) : (
                <>
                  <DocumentReaderPanel />

                  <SyncToggleStrip
                    isGraphMode={viewMode !== "reader"}
                    syncEnabled={syncEnabled}
                    onToggle={toggleSync}
                  />
                </>
              )}

              <FactInspectorPanel
                isCollapsed={isInspectorCollapsed}
                onCollapse={() => setPanelCollapsed("inspector", true)}
                onExpand={() => setPanelCollapsed("inspector", false)}
              />
            </div>
          </div>
        </div>
      </div>
    </DocumentsWorkspaceProvider>
  )
}
