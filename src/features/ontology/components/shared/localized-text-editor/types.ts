import type { OntologyLanguage, OntologyLocalizedText } from "@/domain/ontology"
import type { OntologyMetadataTarget } from "@/features/ontology/server/queries"

export interface LocalizedTextField {
  name: string
  label: string
  canonicalValue: string
  multiline?: boolean
  placeholder?: string
  onSaveCanonical: (newValue: string) => Promise<unknown>
}

export interface LocalizedTextEditorDraftState {
  editorKey: string
  getValue: (
    fieldName: string,
    languageCode: string,
    isDefaultLanguage: boolean,
    canonicalValue: string
  ) => string
  onSaveValue: (input: {
    fieldName: string
    languageCode: string
    isDefaultLanguage: boolean
    nextValue: string
  }) => Promise<unknown>
}

interface PersistedLocalizedTextEditorProps {
  ontologyId: string
  target: OntologyMetadataTarget
  languages: OntologyLanguage[]
  localizedTexts: OntologyLocalizedText[]
  fields: LocalizedTextField[]
  defaultLanguage?: string | null
  draftState?: never
}

interface DraftLocalizedTextEditorProps {
  ontologyId: string
  languages: OntologyLanguage[]
  fields: LocalizedTextField[]
  defaultLanguage?: string | null
  draftState: LocalizedTextEditorDraftState
  target?: never
  localizedTexts?: never
}

export type LocalizedTextEditorProps =
  | PersistedLocalizedTextEditorProps
  | DraftLocalizedTextEditorProps
