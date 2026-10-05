"use client"

import type { EntityWithAttributes } from "@/domain/documents"

import type { DocumentOntology } from "../../server/queries"
import type { FactSectionGroup } from "../../utils/document-filters"
import { FactTableRow } from "./fact-table-row"
import { FactTableSectionHeaderRow } from "./fact-table-section-header-row"

interface FactTableSectionRowsProps {
  group: FactSectionGroup
  open: boolean
  documentId: string
  completenessOntology: DocumentOntology | null | undefined
  entityById: Map<string, EntityWithAttributes>
  selectedIds: Set<string>
  onRevealInspector?: () => void
  onOpenChange: (open: boolean) => void
  onSectionFilterChange: (
    sectionId: string,
    sectionTitle: string | null
  ) => void
  onCrossChapterFilterChange: () => void
  onSelectChange: (id: string, checked: boolean) => void
}

export function FactTableSectionRows({
  group,
  open,
  documentId,
  completenessOntology,
  entityById,
  selectedIds,
  onRevealInspector,
  onOpenChange,
  onSectionFilterChange,
  onCrossChapterFilterChange,
  onSelectChange,
}: FactTableSectionRowsProps) {
  return (
    <>
      <FactTableSectionHeaderRow
        group={group}
        open={open}
        onOpenChange={onOpenChange}
        onSectionFilterChange={onSectionFilterChange}
        onCrossChapterFilterChange={onCrossChapterFilterChange}
      />
      {open &&
        group.facts.map((fact) => (
          <FactTableRow
            key={fact.id}
            fact={fact}
            documentId={documentId}
            completenessOntology={completenessOntology}
            entityById={entityById}
            selectedIds={selectedIds}
            onRevealInspector={onRevealInspector}
            onSelectChange={onSelectChange}
          />
        ))}
    </>
  )
}
