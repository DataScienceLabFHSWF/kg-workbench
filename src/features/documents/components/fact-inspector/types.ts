export type FactHighlightSource =
  | "graph"
  | "inspector"
  | "table_relation_attributes"
export {
  NO_MODULE_FILTER_ID,
  type NamedFilter,
} from "../../utils/document-filters"

export interface EntitySelection {
  entityId: string | null
  entityText: string | null
}
