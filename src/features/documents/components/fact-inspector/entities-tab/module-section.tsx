"use client"

import type { DocumentOntology } from "../../../server/queries"
import { ModuleSectionHeader } from "../shared/module-section-header"
import { ClassSection } from "./class-section"
import type { ModuleGroup } from "./types"

interface ModuleSectionProps {
  moduleGroup: ModuleGroup
  isCollapsed: boolean
  highlightedEntityId?: string | null
  highlightedEntityText?: string | null
  documentId: string
  ontology: DocumentOntology
  onToggle: (moduleId: string) => void
  onModuleClick?: (moduleId: string, moduleName: string) => void
  collapsedClassIds: Set<string>
  toggleClass: (classId: string) => void
  onClassClick?: (classId: string, className: string) => void
  onEntityFilter?: (entityId: string, entityName: string) => void
}

export function ModuleSection({
  moduleGroup,
  isCollapsed,
  highlightedEntityId,
  highlightedEntityText,
  documentId,
  ontology,
  onToggle,
  onModuleClick,
  collapsedClassIds,
  toggleClass,
  onClassClick,
  onEntityFilter,
}: ModuleSectionProps) {
  return (
    <div>
      <ModuleSectionHeader
        moduleId={moduleGroup.moduleId}
        moduleName={moduleGroup.moduleName}
        totalCount={moduleGroup.totalCount}
        isCollapsed={isCollapsed}
        onToggle={onToggle}
        onModuleClick={onModuleClick}
      />

      {!isCollapsed && (
        <div className="mb-1">
          {moduleGroup.classes.map((group) => (
            <ClassSection
              key={group.classId ?? "__unmapped__"}
              group={group}
              isCollapsed={collapsedClassIds.has(
                group.classId ?? "__unmapped__"
              )}
              classes={ontology.classes}
              modules={ontology.modules}
              ontologyAttributes={ontology.attributes}
              relations={ontology.relations}
              documentId={documentId}
              highlightedEntityId={highlightedEntityId}
              highlightedEntityText={highlightedEntityText}
              onToggle={toggleClass}
              onClassClick={onClassClick}
              onEntityFilter={onEntityFilter}
            />
          ))}
        </div>
      )}
    </div>
  )
}
