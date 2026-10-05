"use client"

import { updateAttribute } from "@/features/ontology/server/actions/attributes"
import { updateRelationAttribute } from "@/features/ontology/server/actions/relation-attributes"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"

import { ExamplesEditor } from "../examples-editor/examples-editor"
import { LocalizedTextEditor } from "../localized-text-editor/localized-text-editor"
import { NotesEditor } from "../notes-editor/notes-editor"
import type { AttributeMetadataSheetProps } from "./types"

export function AttributeMetadataSheet({
  open,
  onOpenChange,
  ontologyId,
  target,
  languages,
  defaultLanguage,
  localizedTexts,
  notes,
  examples,
}: AttributeMetadataSheetProps) {
  const attribute = target?.attribute
  const metadataTarget = target
    ? ({ type: target.type, id: target.attribute.id } as const)
    : null

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex w-[520px] flex-col gap-0 p-0 sm:max-w-[520px]"
      >
        <SheetHeader className="border-b px-6 py-4">
          <SheetTitle>{attribute?.name ?? "Attribute metadata"}</SheetTitle>
        </SheetHeader>
        {attribute && metadataTarget ? (
          <div className="min-h-0 flex-1 space-y-6 overflow-y-auto p-6">
            <section>
              <LocalizedTextEditor
                ontologyId={ontologyId}
                target={metadataTarget}
                languages={languages}
                localizedTexts={localizedTexts}
                defaultLanguage={defaultLanguage}
                fields={[
                  {
                    name: "name",
                    label: "Name",
                    canonicalValue: attribute.name,
                    onSaveCanonical: (name) =>
                      target.type === "attribute"
                        ? updateAttribute(attribute.id, { name })
                        : updateRelationAttribute(attribute.id, { name }),
                  },
                  {
                    name: "description",
                    label: "Description",
                    canonicalValue: attribute.description,
                    multiline: true,
                    placeholder: "No description",
                    onSaveCanonical: (description) =>
                      target.type === "attribute"
                        ? updateAttribute(attribute.id, { description })
                        : updateRelationAttribute(attribute.id, {
                            description,
                          }),
                  },
                ]}
              />
            </section>

            <Separator />

            <ExamplesEditor
              ontologyId={ontologyId}
              target={metadataTarget}
              examples={examples}
              mode="value"
            />

            <Separator />

            <NotesEditor
              ontologyId={ontologyId}
              target={metadataTarget}
              notes={notes}
            />
          </div>
        ) : null}
      </SheetContent>
    </Sheet>
  )
}
