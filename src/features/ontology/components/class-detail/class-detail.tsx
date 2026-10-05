"use client"

import { useMemo, useTransition } from "react"
import { Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type {
  OntologyExample,
  OntologyLanguage,
  OntologyLocalizedText,
  OntologyModule,
  OntologyNote,
  OntologyRelation,
} from "@/domain/ontology"
import type { OntologyClassWithAttributes } from "@/features/ontology/server/queries"
import {
  deleteClass,
  updateClass,
} from "@/features/ontology/server/actions/classes"
import { AttributeTable } from "./attribute-table/attribute-table"
import { ClassDetailHeader } from "./class-detail-header"
import { ClassDetailRelations } from "./class-detail-relations"
import { EntityInstances } from "../shared/entity-instances/entity-instances"
import { LocalizedTextEditor } from "../shared/localized-text-editor/localized-text-editor"
import { NotesEditor } from "../shared/notes-editor/notes-editor"

interface ClassDetailProps {
  cls: OntologyClassWithAttributes
  modules: OntologyModule[]
  allClasses: OntologyClassWithAttributes[]
  relations: OntologyRelation[]
  onNavigateToRelation: (relationId: string) => void
  ontologyId: string
  languages: OntologyLanguage[]
  defaultLanguage?: string | null
  localizedTexts: OntologyLocalizedText[]
  notes: OntologyNote[]
  examples: OntologyExample[]
  attributeMetadata: {
    localizedTexts: OntologyLocalizedText[]
    notes: OntologyNote[]
    examples: OntologyExample[]
    languages: OntologyLanguage[]
    defaultLanguage?: string | null
  }
}

export function ClassDetail({
  cls,
  modules,
  allClasses,
  relations,
  onNavigateToRelation,
  ontologyId,
  languages,
  defaultLanguage,
  localizedTexts,
  notes,
  examples,
  attributeMetadata,
}: ClassDetailProps) {
  const [isPending, startTransition] = useTransition()

  const classMap = useMemo(
    () => new Map(allClasses.map((c) => [c.id, c])),
    [allClasses]
  )
  const relationCount = useMemo(
    () =>
      relations.filter(
        (relation) =>
          relation.domain_class_id === cls.id ||
          relation.range_class_id === cls.id
      ).length,
    [cls.id, relations]
  )

  function handleDelete() {
    if (!confirm(`Delete class "${cls.name}"? This cannot be undone.`)) return
    startTransition(async () => {
      await deleteClass(cls.id)
    })
  }

  return (
    <Tabs defaultValue="general" className="min-w-0 px-6 pt-3 pb-6">
      <TabsList className="w-full justify-start" variant="line">
        <TabsTrigger value="general">General</TabsTrigger>
        <TabsTrigger value="instances">
          Instances ({examples.length})
        </TabsTrigger>
        <TabsTrigger value="attributes">
          Attributes ({cls.attributes.length})
        </TabsTrigger>
        <TabsTrigger value="relations">Relations ({relationCount})</TabsTrigger>
        <TabsTrigger value="notes">Notes ({notes.length})</TabsTrigger>
      </TabsList>

      <TabsContent value="general" className="mt-1.5 space-y-6">
        <ClassDetailHeader
          cls={cls}
          modules={modules}
          allClasses={allClasses}
        />

        <section>
          <LocalizedTextEditor
            ontologyId={ontologyId}
            target={{ type: "class", id: cls.id }}
            languages={languages}
            localizedTexts={localizedTexts}
            defaultLanguage={defaultLanguage}
            fields={[
              {
                name: "name",
                label: "Name",
                canonicalValue: cls.name,
                onSaveCanonical: (name) => updateClass(cls.id, { name }),
              },
              {
                name: "description",
                label: "Description",
                canonicalValue: cls.description,
                multiline: true,
                placeholder: "No description",
                onSaveCanonical: (description) =>
                  updateClass(cls.id, { description }),
              },
            ]}
          />
        </section>

        <div>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDelete}
            disabled={isPending}
          >
            <Trash2 className="mr-1.5 h-3.5 w-3.5" />
            Delete class
          </Button>
        </div>
      </TabsContent>

      <TabsContent value="instances" className="mt-1.5 space-y-6">
        <EntityInstances
          ontologyId={ontologyId}
          target={{ type: "class", id: cls.id }}
          instancePolicy={cls.instance_policy}
          examples={examples}
          instanceCandidateLabel="Allowed instance"
          candidatePluralLabel="allowed instances"
          onInstancePolicyChange={(nextPolicy) =>
            updateClass(cls.id, { instancePolicy: nextPolicy })
          }
        />
      </TabsContent>

      <TabsContent value="attributes" className="mt-1.5 space-y-6">
        <AttributeTable
          key={cls.id}
          ontologyId={ontologyId}
          classId={cls.id}
          attributes={cls.attributes}
          languages={attributeMetadata.languages}
          defaultLanguage={attributeMetadata.defaultLanguage}
          localizedTexts={attributeMetadata.localizedTexts}
          notes={attributeMetadata.notes}
          examples={attributeMetadata.examples}
        />
      </TabsContent>

      <TabsContent value="relations" className="mt-1.5 space-y-6">
        <ClassDetailRelations
          classId={cls.id}
          relations={relations}
          classMap={classMap}
          onNavigateToRelation={onNavigateToRelation}
        />
      </TabsContent>

      <TabsContent value="notes" className="mt-1.5 space-y-6">
        <NotesEditor
          ontologyId={ontologyId}
          target={{ type: "class", id: cls.id }}
          notes={notes}
        />
      </TabsContent>
    </Tabs>
  )
}
