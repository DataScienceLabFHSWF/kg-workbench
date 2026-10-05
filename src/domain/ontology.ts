import type { DatabaseInsert, DatabaseRow } from "./database"
import {
  ontologyAttributes,
  ontologyClasses,
  ontologyCompetencyQuestionModules,
  ontologyCompetencyQuestions,
  ontologyDocuments,
  ontologyExamples,
  ontologyLanguages,
  ontologyLocalizedTexts,
  ontologyModules,
  ontologyNotes,
  ontologyRelationAttributes,
  ontologyRelations,
} from "@/server/db/schema"

export type OntologyDocument = DatabaseRow<typeof ontologyDocuments>
export type OntologyDocumentInsert = DatabaseInsert<typeof ontologyDocuments>

export type OntologyModule = DatabaseRow<typeof ontologyModules>
export type OntologyModuleInsert = DatabaseInsert<typeof ontologyModules>

export type OntologyClass = DatabaseRow<typeof ontologyClasses>
export type OntologyClassInsert = DatabaseInsert<typeof ontologyClasses>

export type OntologyAttribute = DatabaseRow<typeof ontologyAttributes>
export type OntologyAttributeInsert = DatabaseInsert<typeof ontologyAttributes>

export type OntologyRelation = DatabaseRow<typeof ontologyRelations>
export type OntologyRelationInsert = DatabaseInsert<typeof ontologyRelations>

export type OntologyLanguage = DatabaseRow<typeof ontologyLanguages>
export type OntologyLanguageInsert = DatabaseInsert<typeof ontologyLanguages>

export type OntologyCompetencyQuestion = DatabaseRow<
  typeof ontologyCompetencyQuestions
>
export type OntologyCompetencyQuestionInsert = DatabaseInsert<
  typeof ontologyCompetencyQuestions
>

export type OntologyCompetencyQuestionModule = DatabaseRow<
  typeof ontologyCompetencyQuestionModules
>

export type OntologyRelationAttribute = DatabaseRow<
  typeof ontologyRelationAttributes
>
export type OntologyRelationAttributeInsert = DatabaseInsert<
  typeof ontologyRelationAttributes
>

export type OntologyNote = DatabaseRow<typeof ontologyNotes>
export type OntologyNoteInsert = DatabaseInsert<typeof ontologyNotes>

export type OntologyLocalizedText = DatabaseRow<typeof ontologyLocalizedTexts>
export type OntologyLocalizedTextInsert = DatabaseInsert<
  typeof ontologyLocalizedTexts
>

export type OntologyExample = DatabaseRow<typeof ontologyExamples>
export type OntologyExampleInsert = DatabaseInsert<typeof ontologyExamples>
