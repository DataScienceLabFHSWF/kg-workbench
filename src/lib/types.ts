export const FACT_REVIEW_STATUSES = ["pending", "accepted", "rejected"] as const

export type FactReviewStatus = (typeof FACT_REVIEW_STATUSES)[number]

export const EFFECTIVE_STATUSES = [
  "unmapped",
  "pending",
  "accepted",
  "rejected",
] as const

export type EffectiveStatus = (typeof EFFECTIVE_STATUSES)[number]

export const EFFECTIVE_STATUS_LABELS: Record<EffectiveStatus, string> = {
  unmapped: "Unmapped",
  pending: "Pending",
  accepted: "Accepted",
  rejected: "Rejected",
}

export const DOCUMENT_STATUSES = [
  "uploaded",
  "processing",
  "in_review",
  "imported",
] as const

export type DocumentStatus = (typeof DOCUMENT_STATUSES)[number]

export const DOCUMENT_STATUS_FILTERS = ["all", ...DOCUMENT_STATUSES] as const

export type DocumentStatusFilter = (typeof DOCUMENT_STATUS_FILTERS)[number]

export const DOCUMENT_STATUS_LABELS: Record<DocumentStatusFilter, string> = {
  all: "All",
  uploaded: "Uploaded",
  processing: "Processing",
  in_review: "In Review",
  imported: "Imported",
}
