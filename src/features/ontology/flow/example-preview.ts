import type { OntologyExample } from "@/domain/ontology"

const NODE_EXAMPLE_PREVIEW_COUNT = 2

function compactWhitespace(value: string | null | undefined) {
  return value?.replace(/\s+/g, " ").trim() ?? ""
}

export function getClassExampleValues(examples: OntologyExample[]) {
  return examples
    .map((example) => compactWhitespace(example.value))
    .filter(Boolean)
}

export function getClassExamplePreview(examples: string[]) {
  return examples.slice(0, NODE_EXAMPLE_PREVIEW_COUNT).join(", ")
}

export function formatRelationExample(example: OntologyExample) {
  const labels = [
    compactWhitespace(example.subject_label),
    compactWhitespace(example.predicate_label),
    compactWhitespace(example.object_label),
  ].filter(Boolean)

  if (labels.length > 0) {
    return labels.join(" ")
  }

  return compactWhitespace(example.value)
}
