import { CollapsibleSidePanel } from "@/components/shared/collapsible-side-panel"
import type { DocumentListItem } from "../../server/queries"

import { useDocumentsWorkspace } from "../../hooks/documents-workspace-state"
import { getDocumentFilterId } from "../../utils/document-filters"
import { DocumentBrowser } from "../document-browser/document-browser"
import type { UploadDocumentResult } from "../upload-document-dialog"

interface DocumentBrowserPanelProps {
  documents: DocumentListItem[]
  isCollapsed: boolean
  browserTab: "documents" | "toc"
  onSelectDocument: (documentId: string) => void
  onDocumentUploaded: (result: UploadDocumentResult) => void
  onDocumentDeleted: (documentId: string) => void
  onTabChange: (tab: "documents" | "toc") => void
  onCollapse: () => void
  onExpand: () => void
}

export function DocumentBrowserPanel({
  documents,
  isCollapsed,
  browserTab,
  onSelectDocument,
  onDocumentUploaded,
  onDocumentDeleted,
  onTabChange,
  onCollapse,
  onExpand,
}: DocumentBrowserPanelProps) {
  const { selectedDocumentId, sharedFilters, scrollToSection, setSectionId } =
    useDocumentsWorkspace()

  return (
    <CollapsibleSidePanel
      side="left"
      title="Browser"
      widthClassName="w-72"
      isCollapsed={isCollapsed}
      isCollapsible
      showHeader
      expandTitle="Show browser"
      collapseTitle="Hide browser"
      onExpand={onExpand}
      onCollapse={onCollapse}
    >
      <DocumentBrowser
        documents={documents}
        selectedId={selectedDocumentId}
        onSelect={onSelectDocument}
        onUploaded={onDocumentUploaded}
        onDeleted={onDocumentDeleted}
        activeTab={browserTab}
        onTabChange={onTabChange}
        documentId={selectedDocumentId}
        onScrollToSection={(sectionId) => scrollToSection(sectionId)}
        onIsolationToggle={setSectionId}
        isolatedSectionId={getDocumentFilterId(sharedFilters.section)}
      />
    </CollapsibleSidePanel>
  )
}
