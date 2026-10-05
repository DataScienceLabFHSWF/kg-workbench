"use client"

import Link from "next/link"
import type { KeyboardEvent } from "react"

import { routes } from "@/lib/routes"
import { cn } from "@/lib/utils"
import type { FactStatusSummary, DocumentListItem } from "../../server/queries"
import { DocStatusBadge } from "../shared/doc-status-badge"
import { FactStatusCountBadge } from "../shared/fact-status-count-badge"
import { DocumentBrowserItemActions } from "./document-browser-item-actions"

interface DocumentBrowserItemProps {
  doc: DocumentListItem
  isSelected: boolean
  factSummary: FactStatusSummary | undefined
  onSelect: () => void
  onDelete: () => void
  isDeleting: boolean
}

export function DocumentBrowserItem({
  doc,
  isSelected,
  factSummary,
  onSelect,
  onDelete,
  isDeleting,
}: DocumentBrowserItemProps) {
  const isProcessing = doc.status === "processing"
  const isDisabled = isProcessing || isDeleting
  const hasFactCounts =
    factSummary &&
    factSummary.pending +
      factSummary.accepted +
      factSummary.rejected +
      factSummary.unmapped >
      0

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (isDisabled) {
      return
    }

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault()
      onSelect()
    }
  }

  return (
    <li>
      <div className="group relative">
        <div
          role="button"
          tabIndex={isDisabled ? -1 : 0}
          aria-disabled={isDisabled}
          onClick={isDisabled ? undefined : onSelect}
          onKeyDown={handleKeyDown}
          className={cn(
            "flex w-full flex-col gap-1 px-3 py-2 pr-10 text-left transition-colors",
            isDisabled ? "cursor-default opacity-50" : "hover:bg-muted/50",
            isSelected && !isDisabled && "bg-muted"
          )}
        >
          <span className="line-clamp-1 text-sm font-medium">{doc.title}</span>

          {doc.ontologyBase ? (
            <Link
              href={routes.ontology.document(doc.ontologyBase.ontologyId)}
              title={
                doc.ontologyBase.ontologyVersion
                  ? `${doc.ontologyBase.ontologyName} v${doc.ontologyBase.ontologyVersion}`
                  : doc.ontologyBase.ontologyName
              }
              onClick={(event) => event.stopPropagation()}
              onKeyDown={(event) => event.stopPropagation()}
              className="inline-flex max-w-full items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              <span className="shrink-0">Ontology:</span>
              <span className="truncate font-medium text-foreground/90">
                {doc.ontologyBase.ontologyName}
              </span>
            </Link>
          ) : null}

          <div className="flex items-center gap-1.5">
            <DocStatusBadge status={doc.status} />
            {doc.uploaded_at && (
              <span className="ml-auto text-[10px] text-muted-foreground">
                {new Date(doc.uploaded_at).toLocaleDateString()}
              </span>
            )}
          </div>
          {hasFactCounts && (
            <div className="flex flex-wrap gap-1">
              <FactStatusCountBadge
                status="unmapped"
                count={factSummary.unmapped}
              />
              <FactStatusCountBadge
                status="pending"
                count={factSummary.pending}
              />
              <FactStatusCountBadge
                status="accepted"
                count={factSummary.accepted}
              />
              <FactStatusCountBadge
                status="rejected"
                count={factSummary.rejected}
              />
            </div>
          )}
        </div>

        {!isProcessing ? (
          <DocumentBrowserItemActions
            title={doc.title}
            isSelected={isSelected}
            isDeleting={isDeleting}
            onDelete={onDelete}
          />
        ) : null}
      </div>
    </li>
  )
}
