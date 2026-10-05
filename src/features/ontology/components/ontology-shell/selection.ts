import type { OntologyRelation } from "@/domain/ontology"
import type { OntologyClassWithAttributes } from "@/features/ontology/server/queries"
import type { OntologyModule } from "@/domain/ontology"

type SelectedEntityKind = "class" | "relation" | null

export function getSelectedClass(
  selectedEntityKind: SelectedEntityKind,
  selectedEntityId: string | null,
  classMap: Map<string, OntologyClassWithAttributes>
) {
  if (selectedEntityKind !== "class" || !selectedEntityId) {
    return null
  }

  return classMap.get(selectedEntityId) ?? null
}

export function getSelectedRelation(
  selectedEntityKind: SelectedEntityKind,
  selectedEntityId: string | null,
  relations: OntologyRelation[]
) {
  if (selectedEntityKind !== "relation" || !selectedEntityId) {
    return null
  }

  return relations.find((relation) => relation.id === selectedEntityId) ?? null
}

export function getDetailEmptyStateDescription(isVisual: boolean) {
  return isVisual
    ? "Click a class or relation in the canvas to view its details."
    : "Select a class or relation from the list to view its details."
}

export function getDetailPanelTitle({
  selectedClass,
  selectedRelation,
  selectedModule,
}: {
  selectedClass: OntologyClassWithAttributes | null
  selectedRelation: OntologyRelation | null
  selectedModule: OntologyModule | null
}) {
  if (selectedClass) {
    return `Class Details: ${selectedClass.name}`
  }

  if (selectedRelation) {
    return `Relation Details: ${selectedRelation.name}`
  }

  if (selectedModule) {
    return `Module Details: ${selectedModule.name}`
  }

  return "Details"
}
