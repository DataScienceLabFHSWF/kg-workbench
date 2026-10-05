export {
  getOntologyClass,
  getOntologyClasses,
  getOntologyClassesByModule,
} from "./classes"
export { getOntologyCQs, getOntologyCQsByModule } from "./competency-questions"
export {
  getOntologyDocument,
  getOntologyDocuments,
  getOntologyDocumentsForPicker,
} from "./documents"
export { getOntologyLanguages } from "./languages"
export { getClassPositions, getModuleLayouts } from "./layout"
export {
  getAffectedCompetencyQuestionsForExample,
  getOntologyExamples,
  getOntologyExamplesByOntology,
  getInstanceCandidateExamples,
  getOntologyLocalizedTexts,
  getOntologyLocalizedTextsByOntology,
  getOntologyNotes,
  getOntologyNotesByOntology,
} from "./metadata"
export { getOntologyModules } from "./modules"
export {
  getOntologyRelation,
  getOntologyRelations,
  getOntologyRelationsByModule,
} from "./relations"
export {
  getRelationAttributes,
  getRelationAttributesByOntology,
} from "./relation-attributes"
export type {
  ClassPositionsByModule,
  ModuleLayoutMap,
  OntologyClassWithAttributes,
  OntologyCQWithModules,
  OntologyDocumentWithModules,
  OntologyExampleCandidateTarget,
  OntologyExampleImpact,
  OntologyExampleTarget,
  OntologyMetadataTarget,
} from "./types"
