import type {
  OntologyLanguage,
  OntologyLocalizedText,
  OntologyModule,
  OntologyRelation,
} from "@/domain/ontology"
import type { OntologyClassWithAttributes } from "@/features/ontology/server/queries"

export type ExportOntologyMode = "json" | "owl"
export type MissingTranslationBehavior = "fallback" | "strict"

export interface ExportOntologyDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: ExportOntologyMode
  defaultLanguage: string
  ontologyId: string
  ontologyName: string
  ontologyUsecase: string
  languages: OntologyLanguage[]
  localizedTexts: OntologyLocalizedText[]
  modules: OntologyModule[]
  classes: OntologyClassWithAttributes[]
  relations: OntologyRelation[]
}

export interface RelationDependencyIssue {
  relation: OntologyRelation
  keptClass: OntologyClassWithAttributes
  missingClass: OntologyClassWithAttributes
}

export interface ParentDependencyIssue {
  child: OntologyClassWithAttributes
  parent: OntologyClassWithAttributes
}

export interface DependencyGroup {
  moduleId: string | null
  moduleLabel: string
  relationIssues: RelationDependencyIssue[]
  parentIssues: ParentDependencyIssue[]
}

export interface DependencyResolutionHandlers {
  onIncludeClass: (classId: string) => void
  onExcludeRelation: (relationId: string) => void
  onDropParent: (childId: string) => void
}

export interface ExportLanguageOption {
  code: string
  label: string
}

export interface MissingTranslationEntry {
  id: string
  label: string
  missingFields: string[]
}

export interface MissingTranslationGroup {
  moduleLabel: string
  entries: MissingTranslationEntry[]
}

export interface MissingTranslationSummary {
  totalMissingValues: number
  classCount: number
  relationCount: number
  otherCount: number
  classGroups: MissingTranslationGroup[]
  relationGroups: MissingTranslationGroup[]
}
