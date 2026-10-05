"use client"

import type { OntologyLanguage, OntologyLocalizedText } from "@/domain/ontology"
import type { OntologyDocumentWithModules } from "@/features/ontology/server/queries"
import { updateOntologyDocument } from "@/features/ontology/server/actions/ontology-documents"
import { LocalizedTextEditor } from "../shared/localized-text-editor/localized-text-editor"

interface OverviewTabProps {
  ontology: OntologyDocumentWithModules
  languages: OntologyLanguage[]
  ontologyLocalizedTexts: OntologyLocalizedText[]
}

export function OverviewTab({
  ontology,
  languages,
  ontologyLocalizedTexts,
}: OverviewTabProps) {
  return (
    <div className="max-w-lg space-y-6 p-6">
      <LocalizedTextEditor
        ontologyId={ontology.id}
        target={{ type: "ontology", id: ontology.id }}
        languages={languages}
        localizedTexts={ontologyLocalizedTexts}
        defaultLanguage={ontology.default_language}
        fields={[
          {
            name: "name",
            label: "Name",
            canonicalValue: ontology.name,
            onSaveCanonical: (name) =>
              updateOntologyDocument(ontology.id, { name }),
          },
          {
            name: "usecase",
            label: "Use case",
            canonicalValue: ontology.usecase,
            multiline: true,
            placeholder: "Describe the intended use case for this ontology",
            onSaveCanonical: (usecase) =>
              updateOntologyDocument(ontology.id, { usecase }),
          },
        ]}
      />
    </div>
  )
}
