import type {
  OntologyAttribute,
  OntologyExample,
  OntologyLanguage,
  OntologyLocalizedText,
  OntologyNote,
  OntologyRelationAttribute,
} from "@/domain/ontology"

export type MetadataAttributeTarget =
  | { type: "attribute"; attribute: OntologyAttribute }
  | { type: "relation_attribute"; attribute: OntologyRelationAttribute }

export interface AttributeMetadataSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  ontologyId: string
  target: MetadataAttributeTarget | null
  languages: OntologyLanguage[]
  defaultLanguage?: string | null
  localizedTexts: OntologyLocalizedText[]
  notes: OntologyNote[]
  examples: OntologyExample[]
}
