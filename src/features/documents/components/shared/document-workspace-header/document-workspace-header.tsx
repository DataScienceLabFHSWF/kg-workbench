"use client"

import { useQuery } from "@tanstack/react-query"

import { cn } from "@/lib/utils"
import {
  useDocumentsWorkspace,
  type ViewMode,
} from "../../../hooks/documents-workspace-state"
import {
  fetchDocumentWithSections,
  getExtractionRuns,
} from "../../../server/queries"
import { DocStatusBadge } from "../doc-status-badge"
import { ExtractionRunMetadataBadges } from "../extraction-run-metadata-badges"

const VIEW_MODE_LABELS: Record<ViewMode, string> = {
  reader: "Reader",
  graph: "Graph",
  table: "Table",
}

export function DocumentWorkspaceHeader() {
  const {
    selectedDocumentId: documentId,
    viewMode,
    setViewMode,
  } = useDocumentsWorkspace()
  const { data: document } = useQuery({
    queryKey: ["document", documentId],
    queryFn: () => fetchDocumentWithSections(documentId!),
    enabled: !!documentId,
  })
  const { data: extractionRuns = [] } = useQuery({
    queryKey: ["extraction-runs", documentId],
    queryFn: () => getExtractionRuns(documentId!),
    enabled: !!documentId,
  })

  const latestRun = extractionRuns[0]

  return (
    <div className="shrink-0 border-b">
      <div className="grid min-h-10 grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-2">
        <div className="flex min-w-0 items-center gap-2">
          <h2 className="truncate text-sm font-semibold">
            {document?.title ?? "No document selected"}
          </h2>
          {document ? (
            <DocStatusBadge
              status={document.status}
              className="shrink-0 text-xs"
            />
          ) : null}
          {latestRun ? <ExtractionRunMetadataBadges run={latestRun} /> : null}
        </div>

        <div className="flex shrink-0 items-center gap-2 justify-self-end">
          <div className="flex h-9 overflow-hidden rounded-md border border-input bg-background text-xs">
            {(["reader", "graph", "table"] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setViewMode(mode)}
                disabled={!documentId}
                className={cn(
                  "h-full px-3 transition-colors",
                  viewMode === mode
                    ? "bg-foreground font-medium text-background"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                  !documentId && "cursor-not-allowed opacity-50"
                )}
              >
                {VIEW_MODE_LABELS[mode]}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
