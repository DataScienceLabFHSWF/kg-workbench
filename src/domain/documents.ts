import type { DatabaseInsert, DatabaseRow } from "./database"
import type { DocumentStatus, FactReviewStatus } from "@/lib/types"
import {
  documentEntities,
  documentParagraphs,
  documentSections,
  documents,
  entityAttributeValues,
  evidenceAnchors,
  extractionRuns,
  factAnchors,
  factRelationAttributeValues,
  facts,
} from "@/server/db/schema"

type DbDocument = DatabaseRow<typeof documents>
type DbDocumentInsert = DatabaseInsert<typeof documents>

export type Document = Omit<DbDocument, "status"> & {
  status: DocumentStatus
}
export type DocumentInsert = Omit<DbDocumentInsert, "status"> & {
  status?: DocumentStatus
}

export type DocumentSection = DatabaseRow<typeof documentSections>
export type DocumentSectionInsert = DatabaseInsert<typeof documentSections>

export type DocumentParagraph = DatabaseRow<typeof documentParagraphs>
export type DocumentParagraphInsert = DatabaseInsert<typeof documentParagraphs>

export type ExtractionRun = DatabaseRow<typeof extractionRuns>
export type ExtractionRunInsert = DatabaseInsert<typeof extractionRuns>

export type EvidenceAnchor = DatabaseRow<typeof evidenceAnchors>
export type EvidenceAnchorInsert = DatabaseInsert<typeof evidenceAnchors>

type DbFact = DatabaseRow<typeof facts>
type DbFactInsert = DatabaseInsert<typeof facts>

export type Fact = Omit<DbFact, "review_status"> & {
  review_status: FactReviewStatus
}
export type FactInsert = Omit<DbFactInsert, "review_status"> & {
  review_status?: FactReviewStatus
}

export type FactAnchor = DatabaseRow<typeof factAnchors>

export type DocumentEntity = DatabaseRow<typeof documentEntities>
export type DocumentEntityInsert = DatabaseInsert<typeof documentEntities>

export type EntityAttributeValue = DatabaseRow<typeof entityAttributeValues>
export type EntityAttributeValueInsert = DatabaseInsert<
  typeof entityAttributeValues
>

export type EntityWithAttributes = DocumentEntity & {
  attributes: Array<{
    id: string
    attribute_id: string
    attribute_name: string
    data_type: string
    value: string
  }>
}

export type FactRelationAttributeValue = DatabaseRow<
  typeof factRelationAttributeValues
>
export type FactRelationAttributeValueInsert = DatabaseInsert<
  typeof factRelationAttributeValues
>
