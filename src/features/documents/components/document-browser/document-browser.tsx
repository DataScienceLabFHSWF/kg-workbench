"use client"

import { useMemo, useState } from "react"

import { useQuery } from "@tanstack/react-query"

import type { DocumentStatusFilter } from "@/lib/types"
import {
  type DocumentListItem,
  fetchDocumentFactSummaries,
  type FactStatusSummary,
} from "../../server/queries"
import { useDeleteDocument } from "../../hooks/use-delete-document"
import {
  UploadDocumentDialog,
  type UploadDocumentResult,
} from "../upload-document-dialog"
import { DocumentBrowserDeleteDialog } from "./document-browser-delete-dialog"
import { DocumentBrowserTabPanels } from "./document-browser-tab-panels"
import { DOCUMENT_FILTER_ALL } from "../../utils/document-filters"

interface DocumentBrowserProps {
  documents: DocumentListItem[]
  selectedId: string | null
  onSelect: (id: string) => void
  onUploaded: (result: UploadDocumentResult) => void
  onDeleted: (documentId: string) => void
  activeTab: "documents" | "toc"
  onTabChange: (tab: "documents" | "toc") => void
  documentId: string | null
  onScrollToSection: (sectionId: string) => void
  onIsolationToggle: (sectionId: string | null) => void
  isolatedSectionId: string | null
}

export function DocumentBrowser({
  documents,
  selectedId,
  onSelect,
  onUploaded,
  onDeleted,
  activeTab,
  onTabChange,
  documentId,
  onScrollToSection,
  onIsolationToggle,
  isolatedSectionId,
}: DocumentBrowserProps) {
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] =
    useState<DocumentStatusFilter>(DOCUMENT_FILTER_ALL)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [pendingDeleteDocument, setPendingDeleteDocument] =
    useState<DocumentListItem | null>(null)

  const documentsSummaryKey = useMemo(
    () =>
      [...documents]
        .map((document) => `${document.id}:${document.status}`)
        .sort()
        .join(","),
    [documents]
  )

  const { data: factSummaries } = useQuery({
    queryKey: ["document-fact-summaries", documentsSummaryKey],
    queryFn: () =>
      fetchDocumentFactSummaries(documents.map((document) => document.id)),
    enabled: documents.length > 0,
  })

  const { deletingDocumentId, isDeletingDocument, handleDeleteDocument } =
    useDeleteDocument({
      onDeleted,
    })

  async function handleConfirmDelete() {
    if (!pendingDeleteDocument) {
      return
    }

    const didDelete = await handleDeleteDocument(pendingDeleteDocument.id)
    if (didDelete) {
      setPendingDeleteDocument(null)
    }
  }

  function handleDeleteDialogOpenChange(open: boolean) {
    if (!open && !isDeletingDocument) {
      setPendingDeleteDocument(null)
    }
  }

  const deleteDialogOpen = pendingDeleteDocument !== null

  const statusCounts = useMemo(() => {
    const counts: Record<DocumentStatusFilter, number> = {
      all: documents.length,
      uploaded: 0,
      processing: 0,
      in_review: 0,
      imported: 0,
    }

    for (const document of documents) {
      counts[document.status] += 1
    }

    return counts
  }, [documents])

  const filteredDocuments = useMemo(() => {
    const byStatus =
      statusFilter === DOCUMENT_FILTER_ALL
        ? documents
        : documents.filter((document) => document.status === statusFilter)

    const query = search.toLowerCase()
    return query
      ? byStatus.filter((document) =>
          document.title.toLowerCase().includes(query)
        )
      : byStatus
  }, [documents, search, statusFilter])

  return (
    <>
      <DocumentBrowserTabPanels
        documents={filteredDocuments}
        selectedId={selectedId}
        factSummaries={
          factSummaries as Record<string, FactStatusSummary> | undefined
        }
        deletingDocumentId={deletingDocumentId}
        activeTab={activeTab}
        onTabChange={onTabChange}
        documentId={documentId}
        onScrollToSection={onScrollToSection}
        onIsolationToggle={onIsolationToggle}
        isolatedSectionId={isolatedSectionId}
        statusFilter={statusFilter}
        statusCounts={statusCounts}
        onStatusFilterChange={setStatusFilter}
        search={search}
        onSearchChange={setSearch}
        onUploadClick={() => setDialogOpen(true)}
        hasFilters={Boolean(search) || statusFilter !== DOCUMENT_FILTER_ALL}
        onSelect={onSelect}
        onRequestDelete={setPendingDeleteDocument}
      />

      <UploadDocumentDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onUploaded={(result) => {
          onUploaded(result)
          setDialogOpen(false)
        }}
      />

      <DocumentBrowserDeleteDialog
        document={pendingDeleteDocument}
        open={deleteDialogOpen}
        isDeleting={isDeletingDocument}
        onOpenChange={handleDeleteDialogOpenChange}
        onConfirm={() => {
          void handleConfirmDelete()
        }}
      />
    </>
  )
}
