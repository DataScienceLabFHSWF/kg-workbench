import type { FactHighlightSource } from "../types"
import type {
  DocumentWithSections,
  FactWithAnchors,
} from "../../../server/queries"

export interface FactsTabProps {
  facts: FactWithAnchors[]
  documentId: string
  doc: DocumentWithSections | undefined
  anchorFilter: string | null
  onJumpToParagraph: (id: string | null) => void
  activeSectionId: string | null
  isolatedSectionId: string | null
  syncEnabled: boolean
  highlightedFactId?: string | null
  highlightedFactSource?: FactHighlightSource | null
  highlightedFactRequestKey?: number
  isActive: boolean
  onEntityClick?: (entityId: string) => void
  onFactClick?: (factId: string) => void
}
