import type { OntologyNote } from "@/domain/ontology"
import type { OntologyMetadataTarget } from "@/features/ontology/server/queries"

export interface NotesEditorProps {
  ontologyId: string
  target: OntologyMetadataTarget
  notes: OntologyNote[]
}
