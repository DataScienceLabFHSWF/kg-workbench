import type {
  ImportClass,
  ImportLocalizedText,
  ImportRelation,
} from "@/features/ontology/schemas/import"

export type ImportAttribute = ImportClass["attributes"][number]

export interface ClassEntry {
  cls: ImportClass
  iri: string
  segment: string
}

export type ClassMap = Map<string, ClassEntry>

export interface RelationEntry {
  inverseIri: string | null
  iri: string
  relation: ImportRelation
  segment: string
}

export type RelationMap = Map<string, RelationEntry>

export type AnnotationTargetType = ImportLocalizedText["targetType"]
