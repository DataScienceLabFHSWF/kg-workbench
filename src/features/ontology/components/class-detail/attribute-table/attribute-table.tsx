"use client"

import { useState, useTransition } from "react"
import { Check, Plus, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import type {
  OntologyAttribute,
  OntologyExample,
  OntologyLanguage,
  OntologyLocalizedText,
  OntologyNote,
} from "@/domain/ontology"
import { DataTypePicker } from "@/features/ontology/components/shared/datatype-picker/datatype-picker"
import { addAttribute } from "@/features/ontology/server/actions/attributes"
import { DEFAULT_ONTOLOGY_DATA_TYPE } from "@/features/ontology/utils/data-types"
import { AttributeRow } from "./attribute-row"
import { AttributeMetadataSheet } from "../../shared/attribute-metadata-sheet/attribute-metadata-sheet"
import {
  filterExamples,
  filterLocalizedTexts,
  filterNotes,
} from "../../shared/metadata-target"

interface AttributeTableProps {
  ontologyId: string
  classId: string
  attributes: OntologyAttribute[]
  languages: OntologyLanguage[]
  defaultLanguage?: string | null
  localizedTexts: OntologyLocalizedText[]
  notes: OntologyNote[]
  examples: OntologyExample[]
}

export function AttributeTable({
  ontologyId,
  classId,
  attributes,
  languages,
  defaultLanguage,
  localizedTexts,
  notes,
  examples,
}: AttributeTableProps) {
  const [adding, setAdding] = useState(false)
  const [metadataAttribute, setMetadataAttribute] =
    useState<OntologyAttribute | null>(null)
  const [isPending, startTransition] = useTransition()
  const [draft, setDraft] = useState({
    name: "",
    dataType: DEFAULT_ONTOLOGY_DATA_TYPE,
    required: false,
    description: "",
  })

  function handleAdd() {
    if (!draft.name.trim()) return
    startTransition(async () => {
      await addAttribute(classId, {
        name: draft.name.trim(),
        dataType: draft.dataType,
        required: draft.required,
        description: draft.description.trim(),
      })
      setDraft({
        name: "",
        dataType: DEFAULT_ONTOLOGY_DATA_TYPE,
        required: false,
        description: "",
      })
      setAdding(false)
    })
  }

  return (
    <div className="min-w-0">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-xs font-medium text-muted-foreground">
          Attributes ({attributes.length})
        </p>
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={() => setAdding(true)}
          disabled={adding}
        >
          <Plus className="h-3.5 w-3.5" />
        </Button>
      </div>
      <Table className="table-fixed">
        <TableHeader>
          <TableRow>
            <TableHead className="w-30 text-xs">Name</TableHead>
            <TableHead className="w-36 text-xs">Type</TableHead>
            <TableHead className="w-14 text-center text-xs">Required</TableHead>
            <TableHead className="w-[38%] text-xs">Description</TableHead>
            <TableHead className="w-16" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {attributes.map((attr) => (
            <AttributeRow
              key={attr.id}
              attribute={attr}
              onOpenMetadata={setMetadataAttribute}
            />
          ))}
          {adding && (
            <TableRow>
              <TableCell>
                <Input
                  value={draft.name}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, name: e.target.value }))
                  }
                  placeholder="Attribute name"
                  className="h-7 text-xs"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleAdd()
                    if (e.key === "Escape") setAdding(false)
                  }}
                />
              </TableCell>
              <TableCell>
                <DataTypePicker
                  value={draft.dataType}
                  onValueChange={(value) =>
                    setDraft((current) => ({ ...current, dataType: value }))
                  }
                />
              </TableCell>
              <TableCell className="text-center">
                <input
                  type="checkbox"
                  checked={draft.required}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, required: e.target.checked }))
                  }
                />
              </TableCell>
              <TableCell>
                <Textarea
                  value={draft.description}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, description: e.target.value }))
                  }
                  placeholder="Description"
                  rows={2}
                  className="min-h-0 resize-none px-2 py-1.5 text-xs"
                  onKeyDown={(e) => {
                    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
                      e.preventDefault()
                      handleAdd()
                    }
                    if (e.key === "Escape") setAdding(false)
                  }}
                />
              </TableCell>
              <TableCell>
                <div className="flex gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    onClick={handleAdd}
                    disabled={isPending || !draft.name.trim()}
                    aria-label="Save attribute"
                  >
                    <Check className="h-3 w-3" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => setAdding(false)}
                    disabled={isPending}
                    aria-label="Cancel adding attribute"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          )}
          {attributes.length === 0 && !adding && (
            <TableRow>
              <TableCell
                colSpan={5}
                className="text-center text-xs text-muted-foreground"
              >
                No attributes yet.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <AttributeMetadataSheet
        open={metadataAttribute !== null}
        onOpenChange={(open) => {
          if (!open) setMetadataAttribute(null)
        }}
        ontologyId={ontologyId}
        target={
          metadataAttribute
            ? { type: "attribute", attribute: metadataAttribute }
            : null
        }
        languages={languages}
        defaultLanguage={defaultLanguage}
        localizedTexts={
          metadataAttribute
            ? filterLocalizedTexts(localizedTexts, {
                type: "attribute",
                id: metadataAttribute.id,
              })
            : []
        }
        notes={
          metadataAttribute
            ? filterNotes(notes, {
                type: "attribute",
                id: metadataAttribute.id,
              })
            : []
        }
        examples={
          metadataAttribute
            ? filterExamples(examples, {
                type: "attribute",
                id: metadataAttribute.id,
              })
            : []
        }
      />
    </div>
  )
}
