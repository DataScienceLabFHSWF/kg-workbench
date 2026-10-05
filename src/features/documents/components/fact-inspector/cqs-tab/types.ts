import type { FactWithAnchors } from "../../../server/queries"

export interface CQsTabProps {
  facts: FactWithAnchors[]
  documentId: string
  anchorFilter: string | null
  highlightedFactId?: string | null
  onJumpToParagraph: (id: string | null) => void
  onEntityClick?: (entityId: string) => void
  onFactClick?: (factId: string) => void
}
