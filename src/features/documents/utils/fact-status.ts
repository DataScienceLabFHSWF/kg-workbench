import type { FactWithAnchors } from "../server/queries"
import { EFFECTIVE_STATUSES, type EffectiveStatus } from "@/lib/types"

export function createAllEffectiveStatuses(): Set<EffectiveStatus> {
  return new Set(EFFECTIVE_STATUSES)
}

export function hasAllEffectiveStatuses(
  activeStatuses: Set<EffectiveStatus>
): boolean {
  return (
    activeStatuses.size === EFFECTIVE_STATUSES.length &&
    EFFECTIVE_STATUSES.every((status) => activeStatuses.has(status))
  )
}

export function isStructurallyUnmapped(fact: FactWithAnchors): boolean {
  return (
    fact.subject_class_id === null ||
    fact.relation_type_id === null ||
    fact.object_class_id === null
  )
}

export function getEffectiveStatus(fact: FactWithAnchors): EffectiveStatus {
  if (isStructurallyUnmapped(fact) && fact.review_status !== "rejected") {
    return "unmapped"
  }
  return fact.review_status
}

export function matchesActiveStatuses(
  fact: FactWithAnchors,
  activeStatuses: Set<EffectiveStatus>
): boolean {
  return activeStatuses.has(getEffectiveStatus(fact))
}

export type BulkAction = "accept" | "reject" | "reset"

/**
 * Returns the bulk actions allowed for a given fact.
 * - unmapped (not rejected): only reject
 * - unmapped + rejected: none (locked until mappings are filled)
 * - pending: accept, reject
 * - accepted: reject, reset
 * - rejected (fully mapped): accept, reset
 */
export function getAllowedBulkActions(
  fact: FactWithAnchors,
  canAccept = true
): Set<BulkAction> {
  const status = getEffectiveStatus(fact)
  const unmapped = isStructurallyUnmapped(fact)

  if (status === "unmapped") return new Set(["reject"])
  if (status === "rejected" && unmapped) return new Set()
  if (status === "rejected") {
    return canAccept ? new Set(["accept", "reset"]) : new Set(["reset"])
  }
  if (status === "accepted") return new Set(["reject", "reset"])
  // pending
  return canAccept ? new Set(["accept", "reject"]) : new Set(["reject"])
}
