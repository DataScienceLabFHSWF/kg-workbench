import type { FactWithAnchors } from "../../server/queries"
import type { FactTableSortDir, FactTableSortField } from "./types"

export function sortFacts(
  facts: FactWithAnchors[],
  field: FactTableSortField,
  dir: FactTableSortDir
): FactWithAnchors[] {
  return [...facts].sort((a, b) => {
    let cmp = 0
    if (field === "confidence") cmp = (a.confidence ?? 0) - (b.confidence ?? 0)
    else if (field === "subject")
      cmp = a.subject_text.localeCompare(b.subject_text)
    else if (field === "relation")
      cmp = a.relation_text.localeCompare(b.relation_text)
    else if (field === "object")
      cmp = a.object_text.localeCompare(b.object_text)
    return dir === "desc" ? -cmp : cmp
  })
}
