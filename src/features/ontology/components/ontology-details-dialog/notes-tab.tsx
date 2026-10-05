"use client"

import type { OntologyNote } from "@/domain/ontology"
import type { OntologyDocumentWithModules } from "@/features/ontology/server/queries"
import { NotesEditor } from "@/features/ontology/components/shared/notes-editor/notes-editor"

interface NotesTabProps {
  ontology: OntologyDocumentWithModules
  notes: OntologyNote[]
}

export function NotesTab({ ontology, notes }: NotesTabProps) {
  return (
    <div className="p-4">
      <NotesEditor
        ontologyId={ontology.id}
        target={{ type: "ontology", id: ontology.id }}
        notes={notes}
      />
    </div>
  )
}
