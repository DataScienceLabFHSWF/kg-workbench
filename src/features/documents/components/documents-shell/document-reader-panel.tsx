import { DocumentReader } from "../document-reader/document-reader"
import { FactGraphView } from "../fact-graph-view"
import { useDocumentsWorkspace } from "../../hooks/documents-workspace-state"

export function DocumentReaderPanel() {
  const { viewMode, selectedDocumentId } = useDocumentsWorkspace()

  return (
    <div className="min-h-0 min-w-0 flex-1">
      <DocumentReader>
        {viewMode === "graph" && selectedDocumentId ? <FactGraphView /> : null}
      </DocumentReader>
    </div>
  )
}
