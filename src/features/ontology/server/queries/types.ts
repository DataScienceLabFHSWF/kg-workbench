import type {
  OntologyAttribute,
  OntologyClass,
  OntologyCompetencyQuestion,
  OntologyDocument,
  OntologyModule,
} from "@/domain/ontology"

export type OntologyClassWithAttributes = OntologyClass & {
  attributes: OntologyAttribute[]
}

export type OntologyDocumentWithModules = OntologyDocument & {
  modules: OntologyModule[]
}

// Record<moduleId, Record<classId, {x, y}>>
export type ClassPositionsByModule = Record<
  string,
  Record<string, { x: number; y: number }>
>

// Record<moduleId, {x, y, width, height}>
export type ModuleLayoutMap = Record<
  string,
  { x: number; y: number; width: number; height: number }
>

export type OntologyCQWithModules = OntologyCompetencyQuestion & {
  modules: Pick<OntologyModule, "id" | "name">[]
}

export type OntologyMetadataTarget =
  | { type: "ontology"; id: string }
  | { type: "module"; id: string }
  | { type: "class"; id: string }
  | { type: "relation"; id: string }
  | { type: "attribute"; id: string }
  | { type: "relation_attribute"; id: string }
  | { type: "cq"; id: string }

export type OntologyExampleTarget = Exclude<
  OntologyMetadataTarget,
  { type: "ontology" } | { type: "module" }
>

export type OntologyExampleCandidateTarget = Extract<
  OntologyExampleTarget,
  { type: "class" } | { type: "relation" }
>

export type OntologyExampleImpactRole = "subject" | "predicate" | "object"

export interface OntologyExampleImpact {
  id: string
  question: string
  roles: OntologyExampleImpactRole[]
}
