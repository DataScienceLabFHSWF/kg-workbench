"use client"

import type {
  OntologyExample,
  OntologyLocalizedText,
  OntologyNote,
} from "@/domain/ontology"
import type {
  OntologyExampleTarget,
  OntologyMetadataTarget,
} from "@/features/ontology/server/queries"

const TARGET_KEY = {
  ontology: "target_ontology_id",
  module: "target_module_id",
  class: "target_class_id",
  relation: "target_relation_id",
  attribute: "target_attribute_id",
  relation_attribute: "target_relation_attribute_id",
  cq: "target_cq_id",
} as const

export function matchesMetadataTarget(
  row: OntologyLocalizedText | OntologyNote,
  target: OntologyMetadataTarget
) {
  return row[TARGET_KEY[target.type]] === target.id
}

export function matchesExampleTarget(
  row: OntologyExample,
  target: OntologyExampleTarget
) {
  return row[TARGET_KEY[target.type]] === target.id
}

export function filterLocalizedTexts(
  rows: OntologyLocalizedText[],
  target: OntologyMetadataTarget
) {
  return rows.filter((row) => matchesMetadataTarget(row, target))
}

export function filterNotes(
  rows: OntologyNote[],
  target: OntologyMetadataTarget
) {
  return rows.filter((row) => matchesMetadataTarget(row, target))
}

export function filterExamples(
  rows: OntologyExample[],
  target: OntologyExampleTarget
) {
  return rows.filter((row) => matchesExampleTarget(row, target))
}
