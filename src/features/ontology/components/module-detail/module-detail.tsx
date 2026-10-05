"use client"

import type {
  OntologyExample,
  OntologyLanguage,
  OntologyLocalizedText,
  OntologyModule,
  OntologyNote,
  OntologyRelation,
} from "@/domain/ontology"
import type {
  OntologyClassWithAttributes,
  OntologyCQWithModules,
} from "@/features/ontology/server/queries"
import { updateModule } from "@/features/ontology/server/actions/modules"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { filterLocalizedTexts, filterNotes } from "../shared/metadata-target"
import { LocalizedTextEditor } from "../shared/localized-text-editor/localized-text-editor"
import { NotesEditor } from "../shared/notes-editor/notes-editor"
import { ModuleCQSummary } from "./module-cq-summary"

interface ModuleDetailProps {
  module: OntologyModule
  ontologyId: string
  defaultLanguage?: string | null
  languages: OntologyLanguage[]
  localizedTexts: OntologyLocalizedText[]
  notes: OntologyNote[]
  cqs: OntologyCQWithModules[]
  classes: OntologyClassWithAttributes[]
  relations: OntologyRelation[]
  examples: OntologyExample[]
  onAddCQ: (moduleId: string) => void
  onManageCQs: (moduleId: string) => void
}

export function ModuleDetail({
  module,
  ontologyId,
  defaultLanguage,
  languages,
  localizedTexts,
  notes,
  cqs,
  classes,
  relations,
  examples,
  onAddCQ,
  onManageCQs,
}: ModuleDetailProps) {
  const target = { type: "module", id: module.id } as const
  const targetLocalizedTexts = filterLocalizedTexts(localizedTexts, target)
  const targetNotes = filterNotes(notes, target)
  const competencyQuestionCount = cqs.filter((cq) =>
    cq.modules.some((cqModule) => cqModule.id === module.id)
  ).length

  return (
    <Tabs defaultValue="general" className="min-w-0 px-6 pt-3 pb-6">
      <TabsList className="w-full justify-start" variant="line">
        <TabsTrigger value="general">General</TabsTrigger>
        <TabsTrigger value="competency-questions">
          Competency Questions ({competencyQuestionCount})
        </TabsTrigger>
        <TabsTrigger value="notes">Notes ({targetNotes.length})</TabsTrigger>
      </TabsList>

      <TabsContent value="general" className="mt-1.5 space-y-6">
        <section>
          <LocalizedTextEditor
            ontologyId={ontologyId}
            target={target}
            languages={languages}
            localizedTexts={targetLocalizedTexts}
            defaultLanguage={defaultLanguage}
            fields={[
              {
                name: "name",
                label: "Name",
                canonicalValue: module.name,
                onSaveCanonical: (name) => updateModule(module.id, { name }),
              },
              {
                name: "description",
                label: "Description",
                canonicalValue: module.description,
                multiline: true,
                placeholder: "No description",
                onSaveCanonical: (description) =>
                  updateModule(module.id, { description }),
              },
            ]}
          />
        </section>
      </TabsContent>

      <TabsContent value="competency-questions" className="mt-1.5 space-y-6">
        <ModuleCQSummary
          module={module}
          cqs={cqs}
          classes={classes}
          relations={relations}
          examples={examples}
          onAddCQ={() => onAddCQ(module.id)}
          onManageCQs={() => onManageCQs(module.id)}
        />
      </TabsContent>

      <TabsContent value="notes" className="mt-1.5 space-y-6">
        <NotesEditor
          ontologyId={ontologyId}
          target={target}
          notes={targetNotes}
        />
      </TabsContent>
    </Tabs>
  )
}
