"use client"

import type {
  OntologyExample,
  OntologyLanguage,
  OntologyModule,
  OntologyNote,
  OntologyRelation,
} from "@/domain/ontology"
import type {
  ClassPositionsByModule,
  ModuleLayoutMap,
  OntologyClassWithAttributes,
} from "@/features/ontology/server/queries"
import { OntologyCanvas } from "../../flow/ontology-canvas"

interface VisualRegionProps {
  ontologyId: string
  classes: OntologyClassWithAttributes[]
  relations: OntologyRelation[]
  examples: OntologyExample[]
  notes: OntologyNote[]
  modules: OntologyModule[]
  languages: OntologyLanguage[]
  defaultLanguage?: string | null
  activeModuleId: string | null
  selectedEntityId: string | null
  savedPositions: ClassPositionsByModule
  savedModuleLayouts: ModuleLayoutMap
  onSelectClass: (classId: string) => void
  onSelectRelation: (relationId: string) => void
  onSelectModule: (moduleId: string) => void
  onClassCreated: (classId: string) => void
  onRelationCreated: (relationId: string) => void
}

export function VisualRegion({
  ontologyId,
  classes,
  relations,
  examples,
  notes,
  modules,
  languages,
  defaultLanguage,
  activeModuleId,
  selectedEntityId,
  savedPositions,
  savedModuleLayouts,
  onSelectClass,
  onSelectRelation,
  onSelectModule,
  onClassCreated,
  onRelationCreated,
}: VisualRegionProps) {
  return (
    <div className="min-h-0 min-w-0 flex-1">
      <OntologyCanvas
        ontologyId={ontologyId}
        classes={classes}
        relations={relations}
        examples={examples}
        notes={notes}
        modules={modules}
        languages={languages}
        defaultLanguage={defaultLanguage}
        activeModuleId={activeModuleId}
        selectedEntityId={selectedEntityId}
        savedPositions={savedPositions}
        savedModuleLayouts={savedModuleLayouts}
        onSelectClass={onSelectClass}
        onSelectRelation={onSelectRelation}
        onSelectModule={onSelectModule}
        onClassCreated={onClassCreated}
        onRelationCreated={onRelationCreated}
      />
    </div>
  )
}
