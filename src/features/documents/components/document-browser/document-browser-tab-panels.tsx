"use client"

import type { DocumentStatusFilter } from "@/lib/types"

import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import type { DocumentListItem, FactStatusSummary } from "../../server/queries"
import { TableOfContents } from "../table-of-contents/table-of-contents"
import { DocumentBrowserItem } from "./document-browser-item"
import { DocumentBrowserEmptyState } from "./document-browser-empty-state"
import { DocumentBrowserSearchUploadBar } from "./document-browser-search-upload-bar"
import { DocumentBrowserStatusFilterRow } from "./document-browser-status-filter-row"

interface DocumentBrowserTabPanelsProps {
  documents: DocumentListItem[]
  selectedId: string | null
  factSummaries: Record<string, FactStatusSummary> | undefined
  deletingDocumentId: string | null
  activeTab: "documents" | "toc"
  onTabChange: (tab: "documents" | "toc") => void
  documentId: string | null
  onScrollToSection: (sectionId: string) => void
  onIsolationToggle: (sectionId: string | null) => void
  isolatedSectionId: string | null
  statusFilter: DocumentStatusFilter
  statusCounts: Record<DocumentStatusFilter, number>
  onStatusFilterChange: (status: DocumentStatusFilter) => void
  search: string
  onSearchChange: (value: string) => void
  onUploadClick: () => void
  hasFilters: boolean
  onSelect: (id: string) => void
  onRequestDelete: (document: DocumentListItem) => void
}

export function DocumentBrowserTabPanels({
  documents,
  selectedId,
  factSummaries,
  deletingDocumentId,
  activeTab,
  onTabChange,
  documentId,
  onScrollToSection,
  onIsolationToggle,
  isolatedSectionId,
  statusFilter,
  statusCounts,
  onStatusFilterChange,
  search,
  onSearchChange,
  onUploadClick,
  hasFilters,
  onSelect,
  onRequestDelete,
}: DocumentBrowserTabPanelsProps) {
  return (
    <Tabs
      value={activeTab}
      onValueChange={(value) => onTabChange(value as "documents" | "toc")}
      className="flex min-h-0 flex-1 flex-col"
    >
      <TabsList className="h-8 w-full shrink-0 rounded-none border-b bg-transparent px-0">
        <TabsTrigger
          value="documents"
          className="h-full flex-1 rounded-none text-xs data-[state=active]:border-b-2 data-[state=active]:border-foreground data-[state=active]:shadow-none"
        >
          Documents
        </TabsTrigger>
        <TabsTrigger
          value="toc"
          disabled={!documentId}
          className="h-full flex-1 rounded-none text-xs data-[state=active]:border-b-2 data-[state=active]:border-foreground data-[state=active]:shadow-none"
        >
          Table of Contents
        </TabsTrigger>
      </TabsList>

      <TabsContent
        value="documents"
        className="mt-0 flex min-h-0 flex-1 flex-col"
      >
        <DocumentBrowserStatusFilterRow
          statusFilter={statusFilter}
          statusCounts={statusCounts}
          onStatusFilterChange={onStatusFilterChange}
        />

        <DocumentBrowserSearchUploadBar
          search={search}
          onSearchChange={onSearchChange}
          onUploadClick={onUploadClick}
        />

        <ScrollArea className="min-h-0 flex-1">
          {documents.length === 0 ? (
            <DocumentBrowserEmptyState hasFilters={hasFilters} />
          ) : (
            <ul>
              {documents.map((doc) => (
                <DocumentBrowserItem
                  key={doc.id}
                  doc={doc}
                  isSelected={doc.id === selectedId}
                  factSummary={factSummaries?.[doc.id]}
                  onSelect={() => onSelect(doc.id)}
                  onDelete={() => onRequestDelete(doc)}
                  isDeleting={deletingDocumentId === doc.id}
                />
              ))}
            </ul>
          )}
        </ScrollArea>
      </TabsContent>

      <TabsContent value="toc" className="mt-0 flex min-h-0 flex-1 flex-col">
        {documentId ? (
          <TableOfContents
            documentId={documentId}
            onScrollToSection={onScrollToSection}
            onIsolationToggle={onIsolationToggle}
            isolatedSectionId={isolatedSectionId}
          />
        ) : (
          <p className="px-4 py-6 text-center text-xs text-muted-foreground">
            Select a document to view its table of contents.
          </p>
        )}
      </TabsContent>
    </Tabs>
  )
}
