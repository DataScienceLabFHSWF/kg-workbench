"use client"

import { useState } from "react"

import { useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { deleteDocument } from "../server/actions/documents"

interface UseDeleteDocumentOptions {
  onDeleted: (documentId: string) => void
}

interface UseDeleteDocumentResult {
  deletingDocumentId: string | null
  isDeletingDocument: boolean
  handleDeleteDocument: (documentId: string) => Promise<boolean>
}

export function useDeleteDocument({
  onDeleted,
}: UseDeleteDocumentOptions): UseDeleteDocumentResult {
  const queryClient = useQueryClient()
  const [deletingDocumentId, setDeletingDocumentId] = useState<string | null>(
    null
  )

  async function handleDeleteDocument(documentId: string) {
    setDeletingDocumentId(documentId)

    try {
      await deleteDocument(documentId)
      onDeleted(documentId)

      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["document-fact-summaries"],
        }),
        queryClient.removeQueries({
          queryKey: ["document", documentId],
        }),
        queryClient.removeQueries({
          queryKey: ["document-with-sections", documentId],
        }),
        queryClient.removeQueries({
          queryKey: ["document-facts", documentId],
        }),
        queryClient.removeQueries({
          queryKey: ["document-entities", documentId],
        }),
        queryClient.removeQueries({
          queryKey: ["document-ontology", documentId],
        }),
      ])

      toast.success("Document deleted.")
      return true
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not delete document."
      )
      return false
    } finally {
      setDeletingDocumentId(null)
    }
  }

  return {
    deletingDocumentId,
    isDeletingDocument: deletingDocumentId !== null,
    handleDeleteDocument,
  }
}
