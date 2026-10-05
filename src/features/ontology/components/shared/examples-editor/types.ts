import type { OntologyExample } from "@/domain/ontology"
import type { OntologyExampleTarget } from "@/features/ontology/server/queries"

export type ExamplesEditorMode = "value" | "triple"

export interface ExamplesEditorProps {
  ontologyId: string
  target: OntologyExampleTarget
  examples: OntologyExample[]
  mode: ExamplesEditorMode
  instanceCandidateLabel?: string
}
