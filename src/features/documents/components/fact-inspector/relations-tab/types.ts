import type { FactWithAnchors } from "../../../server/queries"

export interface RelationsTabProps {
  facts: FactWithAnchors[]
  documentId: string
  anchorFilter: string | null
  onModuleClick: (moduleId: string, moduleName: string) => void
  onRelationTypeClick: (relationTypeId: string, relationName: string) => void
  highlightedFactId?: string | null
  onFactClick?: (factId: string) => void
}

export interface RelationGroup {
  relationTypeId: string
  relationName: string
  facts: FactWithAnchors[]
}

export interface ModuleGroup {
  moduleId: string
  moduleName: string
  relations: RelationGroup[]
  totalCount: number
}
