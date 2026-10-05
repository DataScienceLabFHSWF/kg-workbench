import type {
  Document,
  DocumentParagraph,
  DocumentSection,
  EvidenceAnchor,
  Fact,
  FactRelationAttributeValue,
} from "@/domain/documents"
import type { OntologyDataTypeId } from "@/features/ontology/utils/data-types"
import type { EffectiveStatus } from "@/lib/types"

export type DocumentWithSections = Document & {
  sections: (DocumentSection & { paragraphs: DocumentParagraph[] })[]
}

export type SectionWithParagraphs = DocumentSection & {
  paragraphs: DocumentParagraph[]
}

export type FactWithAnchors = Fact & {
  anchors: EvidenceAnchor[]
  relation_attribute_values: FactRelationAttributeValue[]
  // Derived from linked entities; single source of truth for class assignment.
  subject_class_id: string | null
  object_class_id: string | null
}

export type FactStatusSummary = Record<EffectiveStatus, number>

export type DocumentOntologyBaseSummary = {
  ontologyId: string
  ontologyName: string
  ontologyVersion: string | null
}

export type DocumentListItem = Document & {
  ontologyBase: DocumentOntologyBaseSummary | null
}

export type DocumentOntologyRelationAttribute = {
  id: string
  relationId: string
  name: string
  dataType: OntologyDataTypeId
  description: string
  required: boolean
  sortOrder: number
}

export type DocumentOntologyAttribute = {
  id: string
  name: string
  dataType: OntologyDataTypeId
  classId: string
  required: boolean
}

export type DocumentOntologyExample = {
  id: string
  value: string
}

export type DocumentOntologyCQ = {
  id: string
  question: string
  sortOrder: number
  subjectClassId: string | null
  predicateRelationId: string | null
  objectClassId: string | null
  subjectExampleId: string | null
  predicateExampleId: string | null
  objectExampleId: string | null
  modules: { id: string; name: string }[]
}

export type DocumentOntology = {
  classes: { id: string; name: string; module_id: string | null }[]
  relations: {
    id: string
    name: string
    domain_class_id: string
    range_class_id: string
  }[]
  modules: { id: string; name: string }[]
  attributes: DocumentOntologyAttribute[]
  relationAttributes: DocumentOntologyRelationAttribute[]
  cqs: DocumentOntologyCQ[]
  examples: DocumentOntologyExample[]
}
