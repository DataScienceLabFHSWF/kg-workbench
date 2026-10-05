import {
  buildGraphClassColor,
  getGraphUnmappedColorValue,
  resolveModuleColor,
} from "./colors-utils"
import type { DocumentStatus, EffectiveStatus } from "./types"

type ReviewStatusStyles = {
  badgeClass: string
  surfaceClass: string
  borderClass: string
  pillClass: string
  textClass: string
  borderTextClass: string
  strokeColor: string
}

// Shared review-status palette for badges, pills, borders, and graph strokes.
const REVIEW_STATUS_STYLES = {
  accepted: {
    badgeClass:
      "bg-app-status-accepted-bg text-app-status-accepted-fg hover:bg-app-status-accepted-bg",
    surfaceClass: "border-app-status-accepted-border bg-app-status-accepted-bg",
    borderClass: "border-app-status-accepted-border",
    pillClass: "bg-app-status-accepted-bg text-app-status-accepted-fg",
    textClass: "text-app-status-accepted-fg",
    borderTextClass:
      "border-app-status-accepted-border text-app-status-accepted-fg",
    strokeColor: "var(--app-status-accepted-border)",
  },
  pending: {
    badgeClass:
      "bg-app-status-pending-bg text-app-status-pending-fg hover:bg-app-status-pending-bg",
    surfaceClass: "border-app-status-pending-border bg-app-status-pending-bg",
    borderClass: "border-app-status-pending-border",
    pillClass: "bg-app-status-pending-bg text-app-status-pending-fg",
    textClass: "text-app-status-pending-fg",
    borderTextClass:
      "border-app-status-pending-border text-app-status-pending-fg",
    strokeColor: "var(--app-status-pending-border)",
  },
  rejected: {
    badgeClass:
      "bg-app-status-rejected-bg text-app-status-rejected-fg hover:bg-app-status-rejected-bg",
    surfaceClass: "border-app-status-rejected-border bg-app-status-rejected-bg",
    borderClass: "border-app-status-rejected-border",
    pillClass: "bg-app-status-rejected-bg text-app-status-rejected-fg",
    textClass: "text-app-status-rejected-fg",
    borderTextClass:
      "border-app-status-rejected-border text-app-status-rejected-fg",
    strokeColor: "var(--app-status-rejected-border)",
  },
  unmapped: {
    badgeClass:
      "bg-app-status-unmapped-bg text-app-status-unmapped-fg hover:bg-app-status-unmapped-bg",
    surfaceClass: "border-app-status-unmapped-border bg-app-status-unmapped-bg",
    borderClass: "border-app-status-unmapped-border",
    pillClass: "bg-app-status-unmapped-bg text-app-status-unmapped-fg",
    textClass: "text-app-status-unmapped-fg",
    borderTextClass:
      "border-app-status-unmapped-border text-app-status-unmapped-fg",
    strokeColor: "var(--app-status-unmapped-border)",
  },
} satisfies Record<EffectiveStatus, ReviewStatusStyles>

// Only document states with dedicated colors get custom badge classes.
const DOC_STATUS_BADGE_CLASSES: Partial<Record<DocumentStatus, string>> = {
  in_review:
    "bg-app-doc-status-in-review-bg text-app-doc-status-in-review-fg hover:bg-app-doc-status-in-review-bg",
  imported:
    "bg-app-doc-status-imported-bg text-app-doc-status-imported-fg hover:bg-app-doc-status-imported-bg",
}

// Shared non-status utility classes live here so features don't repeat them.
export const APP_COLOR_CLASSES = {
  handleNeutral: "!bg-app-handle-neutral",
  selectionRing: "ring-app-selection-ring",
  selectionSurface: "border-app-selection-border bg-app-selection-surface",
  selectionSolid: "bg-app-selection-solid text-app-selection-solid-fg",
  selectionSoft:
    "bg-app-selection-soft text-app-selection-soft-fg hover:bg-app-selection-soft-hover",
  warningText: "text-app-warning-fg",
  warningBorderText: "border-app-warning-border text-app-warning-fg",
  warningSurface: "border-app-warning-border bg-app-warning-bg",
  selectionHoverBorderText:
    "hover:border-app-selection-border hover:text-foreground",
} as const

export function getModuleColor(index: number): string {
  return resolveModuleColor(index)
}

export function getGraphUnmappedColor(): string {
  return getGraphUnmappedColorValue()
}

export function getReviewStatusStyles(status: EffectiveStatus) {
  return REVIEW_STATUS_STYLES[status]
}

export function getReviewStatusStrokeColor(status: EffectiveStatus): string {
  return REVIEW_STATUS_STYLES[status].strokeColor
}

export function getDocumentStatusBadgeClass(
  status: DocumentStatus
): string | null {
  return DOC_STATUS_BADGE_CLASSES[status] ?? null
}

export function buildClassColorMap(
  classIds: Iterable<string>
): Map<string, string> {
  const ids = Array.from(new Set(classIds)).sort()
  const classColors = new Map<string, string>()
  const usedHues = new Set<number>()

  for (const classId of ids) {
    classColors.set(classId, buildGraphClassColor(classId, usedHues))
  }

  return classColors
}

export function getClassColor(
  classId: string | null | undefined,
  classColors: Map<string, string>
): string {
  if (!classId) return getGraphUnmappedColor()
  return classColors.get(classId) ?? getGraphUnmappedColor()
}
