import type {
  OntologyExample,
  OntologyLanguage,
  OntologyLocalizedText,
  OntologyNote,
  OntologyRelation,
} from "@/domain/ontology"
import type {
  OntologyClassWithAttributes,
  OntologyCQWithModules,
  OntologyDocumentWithModules,
} from "@/features/ontology/server/queries"

export interface OntologyDetailsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  activeTab: OntologyDetailsTab
  onActiveTabChange: (tab: OntologyDetailsTab) => void
  ontology: OntologyDocumentWithModules
  classes: OntologyClassWithAttributes[]
  relations: OntologyRelation[]
  languages: OntologyLanguage[]
  cqs: OntologyCQWithModules[]
  examples: OntologyExample[]
  ontologyLocalizedTexts: OntologyLocalizedText[]
  ontologyNotes: OntologyNote[]
  cqCreateModuleId?: string | null
  cqCreateRequestId?: number
  cqFilterModuleId?: string | null
  cqFilterRequestId?: number
}

export type OntologyDetailsTab =
  | "overview"
  | "languages"
  | "competency-questions"
  | "notes"
