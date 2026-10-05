"use client"

import { ClassPicker } from "@/components/shared/class-picker"
import type { PickerConstraintCopy } from "@/components/shared/class-picker/types"
import { GoToIconButton } from "@/components/shared/go-to-icon-button"
import { MissingRequiredNote } from "../shared/missing-required-note"
import { APP_COLOR_CLASSES, getReviewStatusStyles } from "@/lib/colors"
import type { EffectiveStatus, FactReviewStatus } from "@/lib/types"
import { cn } from "@/lib/utils"
import type { DocumentOntology, FactWithAnchors } from "../../server/queries"
import type { FactCompletenessResult } from "../../utils/fact-completeness"
import type {
  DocumentConcreteFilterValue,
  DocumentEntityFilter,
  DocumentExtractedRelationFilter,
} from "../../utils/document-filters"
import { FactStatusBadge } from "../shared/fact-status-badge"
import { FactActions } from "./fact-actions"
import { FactEntityField } from "./fact-entity-field"
import { FactRelationField } from "./fact-relation-field"
import { MissingRequiredSummary } from "./missing-required-summary"
import { RelationDetails } from "./relation-details/relation-details"
import { RelationPicker } from "./relation-picker/relation-picker"

interface FactCardContentProps {
  fact: FactWithAnchors
  status: EffectiveStatus
  structurallyUnmapped: boolean
  isAnyPending: boolean
  isReviewPending: boolean
  classes: DocumentOntology["classes"]
  modules: DocumentOntology["modules"]
  filteredSubjectClasses: DocumentOntology["classes"]
  filteredRelations: DocumentOntology["relations"]
  filteredObjectClasses: DocumentOntology["classes"]
  unavailableSubjectClasses: DocumentOntology["classes"]
  unavailableRelations: DocumentOntology["relations"]
  unavailableObjectClasses: DocumentOntology["classes"]
  relationAttributes: DocumentOntology["relationAttributes"]
  completeness: FactCompletenessResult
  subjectConstraintCopy?: PickerConstraintCopy
  relationConstraintCopy?: PickerConstraintCopy
  objectConstraintCopy?: PickerConstraintCopy
  onRename: (
    field: "subject_text" | "relation_text" | "object_text",
    newText: string
  ) => Promise<void>
  onRemapEntityClass: (
    role: "subject" | "object",
    classId: string | null
  ) => Promise<void>
  onRemapRelation: (relationId: string | null) => Promise<void>
  onAnchorClick: (paragraphId: string | null) => void
  onEntityFilterChange?: (
    value: DocumentConcreteFilterValue<DocumentEntityFilter>
  ) => void
  onExtractedRelationFilterChange?: (
    value: DocumentConcreteFilterValue<DocumentExtractedRelationFilter>
  ) => void
  onEntityClick?: (entityId: string) => void
  onGoToGraph?: () => void
  relationDetailsAutoExpandKey?: number
  onReview: (status: FactReviewStatus) => Promise<void>
}

export function FactCardContent({
  fact,
  status,
  structurallyUnmapped,
  isAnyPending,
  isReviewPending,
  classes,
  modules,
  filteredSubjectClasses,
  filteredRelations,
  filteredObjectClasses,
  unavailableSubjectClasses,
  unavailableRelations,
  unavailableObjectClasses,
  relationAttributes,
  completeness,
  subjectConstraintCopy,
  relationConstraintCopy,
  objectConstraintCopy,
  onRename,
  onRemapEntityClass,
  onRemapRelation,
  onAnchorClick,
  onEntityFilterChange,
  onExtractedRelationFilterChange,
  onEntityClick,
  onGoToGraph,
  relationDetailsAutoExpandKey,
  onReview,
}: FactCardContentProps) {
  const primaryAnchor = fact.anchors[0] ?? null
  const statusStyles = getReviewStatusStyles(status)
  const unmappedStyles = getReviewStatusStyles("unmapped")
  const missingRequiredCount =
    completeness.missingRelationAttributes.length +
    completeness.missingSubjectAttributes.length +
    completeness.missingObjectAttributes.length
  const missingSubjectFieldNames = completeness.missingSubjectAttributes.map(
    (attribute) => attribute.attribute.name
  )
  const missingRelationFieldNames = completeness.missingRelationAttributes.map(
    (attribute) => attribute.name
  )
  const missingObjectFieldNames = completeness.missingObjectAttributes.map(
    (attribute) => attribute.attribute.name
  )

  return (
    <div
      className={cn(
        "flex flex-col gap-2 rounded-md border p-3 text-xs",
        status !== "pending" && statusStyles.surfaceClass,
        status === "pending" && "border-border bg-background"
      )}
    >
      <div className="flex items-center gap-2">
        <FactStatusBadge status={status} />
        <MissingRequiredSummary missingRequiredCount={missingRequiredCount} />
        <div className="ml-auto flex items-center gap-1.5">
          {fact.confidence !== null && (
            <span className="text-muted-foreground">
              {Math.round(fact.confidence * 100)}%
            </span>
          )}
          {onGoToGraph && (
            <GoToIconButton
              onClick={onGoToGraph}
              label="Highlight fact in graph"
              className="rounded p-0.5"
            />
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-x-2">
        <div className="flex items-center gap-1">
          <span className="text-[9px] font-medium tracking-wider text-muted-foreground uppercase">
            Subject
          </span>
          <MissingRequiredNote fieldNames={missingSubjectFieldNames} />
        </div>
        <div className="flex items-center gap-1">
          <span className="text-[9px] font-medium tracking-wider text-muted-foreground uppercase">
            Relation
          </span>
          <MissingRequiredNote fieldNames={missingRelationFieldNames} />
        </div>
        <div className="flex items-center gap-1">
          <span className="text-[9px] font-medium tracking-wider text-muted-foreground uppercase">
            Object
          </span>
          <MissingRequiredNote fieldNames={missingObjectFieldNames} />
        </div>

        <FactEntityField
          value={fact.subject_text}
          disabled={isAnyPending}
          className="font-semibold"
          entityId={fact.subject_entity_id}
          onFilter={
            onEntityFilterChange
              ? () =>
                  onEntityFilterChange({
                    label: fact.subject_text,
                    text: fact.subject_text,
                    entityId: fact.subject_entity_id,
                  })
              : undefined
          }
          onEntityClick={onEntityClick}
          onSave={(value) => onRename("subject_text", value)}
        />
        <FactRelationField
          value={fact.relation_text}
          disabled={isAnyPending}
          onFilter={
            onExtractedRelationFilterChange
              ? () =>
                  onExtractedRelationFilterChange({
                    label: fact.relation_text,
                    text: fact.relation_text,
                  })
              : undefined
          }
          onSave={(value) => onRename("relation_text", value)}
        />
        <FactEntityField
          value={fact.object_text}
          disabled={isAnyPending}
          className="font-semibold"
          entityId={fact.object_entity_id}
          onFilter={
            onEntityFilterChange
              ? () =>
                  onEntityFilterChange({
                    label: fact.object_text,
                    text: fact.object_text,
                    entityId: fact.object_entity_id,
                  })
              : undefined
          }
          onEntityClick={onEntityClick}
          onSave={(value) => onRename("object_text", value)}
        />

        <ClassPicker
          value={fact.subject_class_id ?? ""}
          onValueChange={(id) => onRemapEntityClass("subject", id)}
          allClasses={filteredSubjectClasses}
          modules={modules}
          currentModuleId={null}
          placeholder="Unmapped"
          disabled={isAnyPending}
          unavailableClasses={unavailableSubjectClasses}
          constraintCopy={subjectConstraintCopy}
          onClear={() => onRemapEntityClass("subject", null)}
          className={cn(
            "mt-1 h-5 rounded px-1.5 text-[10px]",
            !fact.subject_class_id &&
              `border-dashed ${unmappedStyles.borderTextClass}`
          )}
        />
        <RelationPicker
          value={fact.relation_type_id}
          options={filteredRelations}
          unavailableOptions={unavailableRelations}
          classes={classes}
          modules={modules}
          disabled={isAnyPending}
          onSelect={onRemapRelation}
          constraintCopy={relationConstraintCopy}
          className={cn(
            !fact.relation_type_id &&
              `border-dashed ${unmappedStyles.borderTextClass}`
          )}
        />
        <ClassPicker
          value={fact.object_class_id ?? ""}
          onValueChange={(id) => onRemapEntityClass("object", id)}
          allClasses={filteredObjectClasses}
          modules={modules}
          currentModuleId={null}
          placeholder="Unmapped"
          disabled={isAnyPending}
          unavailableClasses={unavailableObjectClasses}
          constraintCopy={objectConstraintCopy}
          onClear={() => onRemapEntityClass("object", null)}
          className={cn(
            "mt-1 h-5 rounded px-1.5 text-[10px]",
            !fact.object_class_id &&
              `border-dashed ${unmappedStyles.borderTextClass}`
          )}
        />
      </div>

      <RelationDetails
        key={
          relationDetailsAutoExpandKey === undefined
            ? `relation-details-${fact.id}`
            : `relation-details-${fact.id}-${relationDetailsAutoExpandKey}`
        }
        fact={fact}
        documentId={fact.document_id}
        relationAttributes={relationAttributes}
        disabled={isAnyPending}
        initiallyOpen={relationDetailsAutoExpandKey !== undefined}
      />

      {primaryAnchor && (
        <button
          onClick={() => onAnchorClick(primaryAnchor.paragraph_id)}
          className={cn(
            "rounded border-l-2 border-muted-foreground/30 pl-2 text-left text-muted-foreground italic",
            primaryAnchor.paragraph_id &&
              `cursor-pointer ${APP_COLOR_CLASSES.selectionHoverBorderText}`
          )}
        >
          <span className="line-clamp-2">
            &ldquo;{primaryAnchor.quote_text}&rdquo;
          </span>
        </button>
      )}

      <FactActions
        status={status}
        structurallyUnmapped={structurallyUnmapped}
        canAccept={completeness.isComplete}
        isPending={isReviewPending}
        onReview={onReview}
      />
    </div>
  )
}
