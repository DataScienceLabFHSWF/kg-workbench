"use client"

import { useState, useTransition } from "react"
import { Check, Plus, X } from "lucide-react"

import type {
  OntologyExample,
  OntologyLanguage,
  OntologyLocalizedText,
  OntologyNote,
  OntologyRelationAttribute,
} from "@/domain/ontology"
import { DataTypePicker } from "@/features/ontology/components/shared/datatype-picker/datatype-picker"
import { createRelationAttribute } from "@/features/ontology/server/actions/relation-attributes"
import { DEFAULT_ONTOLOGY_DATA_TYPE } from "@/features/ontology/utils/data-types"
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
import { AttributeMetadataSheet } from "../../shared/attribute-metadata-sheet/attribute-metadata-sheet"
import {
  filterExamples,
  filterLocalizedTexts,
  filterNotes,
} from "../../shared/metadata-target"
import { RelationAttributeRow } from "./relation-attribute-row"

interface RelationAttributesProps {
  ontologyId: string
  relationId: string
  attributes: OntologyRelationAttribute[]
  languages: OntologyLanguage[]
  defaultLanguage?: string | null
  localizedTexts: OntologyLocalizedText[]
  notes: OntologyNote[]
  examples: OntologyExample[]
}

export function RelationAttributes({
  ontologyId,
  relationId,
  attributes,
  languages,
  defaultLanguage,
  localizedTexts,
  notes,
  examples,
}: RelationAttributesProps) {
  const [adding, setAdding] = useState(false)
  const [metadataAttribute, setMetadataAttribute] =
    useState<OntologyRelationAttribute | null>(null)
  const [isPending, startTransition] = useTransition()
  const [draft, setDraft] = useState({
    name: "",
    dataType: DEFAULT_ONTOLOGY_DATA_TYPE,
    required: false,
    description: "",
  })

  function handleAdd() {
    if (!draft.name.trim()) return
    const nextSortOrder =
      attributes.reduce(
        (max, attribute) => Math.max(max, attribute.sort_order),
        -1
      ) + 1
    startTransition(async () => {
      await createRelationAttribute(relationId, {
        name: draft.name.trim(),
        dataType: draft.dataType,
        required: draft.required,
        description: draft.description.trim(),
        sortOrder: nextSortOrder,
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
          Relation attributes ({attributes.length})
        </p>
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          onClick={() => setAdding(true)}
          disabled={adding}
          aria-label="Add relation attribute"
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
          {attributes.map((attribute) => (
            <RelationAttributeRow
              key={attribute.id}
              attribute={attribute}
              onOpenMetadata={setMetadataAttribute}
            />
          ))}
          {adding ? (
            <TableRow>
              <TableCell>
                <Input
                  value={draft.name}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      name: event.target.value,
                    }))
                  }
                  placeholder="Name"
                  className="h-7 text-xs"
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
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      required: event.target.checked,
                    }))
                  }
                />
              </TableCell>
              <TableCell>
                <Textarea
                  value={draft.description}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      description: event.target.value,
                    }))
                  }
                  placeholder="Description"
                  rows={2}
                  className="min-h-0 resize-none px-2 py-1.5 text-xs"
                  onKeyDown={(event) => {
                    if (
                      (event.ctrlKey || event.metaKey) &&
                      event.key === "Enter"
                    ) {
                      event.preventDefault()
                      handleAdd()
                    }
                    if (event.key === "Escape") setAdding(false)
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
                    aria-label="Save relation attribute"
                  >
                    <Check className="h-3 w-3" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => setAdding(false)}
                    disabled={isPending}
                    aria-label="Cancel adding relation attribute"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ) : null}
          {attributes.length === 0 && !adding ? (
            <TableRow>
              <TableCell
                colSpan={5}
                className="text-center text-xs text-muted-foreground"
              >
                No relation attributes yet.
              </TableCell>
            </TableRow>
          ) : null}
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
            ? { type: "relation_attribute", attribute: metadataAttribute }
            : null
        }
        languages={languages}
        defaultLanguage={defaultLanguage}
        localizedTexts={
          metadataAttribute
            ? filterLocalizedTexts(localizedTexts, {
                type: "relation_attribute",
                id: metadataAttribute.id,
              })
            : []
        }
        notes={
          metadataAttribute
            ? filterNotes(notes, {
                type: "relation_attribute",
                id: metadataAttribute.id,
              })
            : []
        }
        examples={
          metadataAttribute
            ? filterExamples(examples, {
                type: "relation_attribute",
                id: metadataAttribute.id,
              })
            : []
        }
      />
    </div>
  )
}
