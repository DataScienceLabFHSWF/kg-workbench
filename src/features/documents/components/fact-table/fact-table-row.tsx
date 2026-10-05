"use client"

import { useMemo } from "react"
import { CheckCheck, Loader2, RotateCcw, X } from "lucide-react"

import type { EntityWithAttributes } from "@/domain/documents"
import { ClassPicker } from "@/components/shared/class-picker"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { getReviewStatusStyles } from "@/lib/colors"
import { cn } from "@/lib/utils"
import { useDocumentsWorkspace } from "../../hooks/documents-workspace-state"
import { useFactMutations } from "../../hooks/use-fact-mutations"
import { useFactOntology } from "../../hooks/use-fact-ontology"
import type { DocumentOntology, FactWithAnchors } from "../../server/queries"
import { getFactCompleteness } from "../../utils/fact-completeness"
import {
  getEffectiveStatus,
  isStructurallyUnmapped,
} from "../../utils/fact-status"
import { DOCUMENT_FILTER_ALL } from "../../utils/document-filters"
import { FactRelationField } from "../fact-card/fact-relation-field"
import { MissingRequiredNote } from "../shared/missing-required-note"
import { FactTableAnchorRow } from "./fact-table-anchor-row"
import { FactTableEntityNameRow } from "./fact-table-entity-name-row"
import { PendingEntityClassDialog } from "../fact-card/pending-entity-class-dialog"
import { RelationPicker } from "../fact-card/relation-picker/relation-picker"

interface FactTableRowProps {
  fact: FactWithAnchors
  documentId: string
  completenessOntology: DocumentOntology | null | undefined
  entityById: Map<string, EntityWithAttributes>
  selectedIds: Set<string>
  onSelectChange: (id: string, checked: boolean) => void
  onRevealInspector?: () => void
}

export function FactTableRow({
  fact,
  documentId,
  completenessOntology,
  entityById,
  selectedIds,
  onSelectChange,
  onRevealInspector,
}: FactTableRowProps) {
  const {
    setEntity,
    setSubjectEntity,
    setObjectEntity,
    setExtractedRelation,
    setInspectorEntitySelection,
    highlightFact,
  } = useDocumentsWorkspace()
  const ontology = useFactOntology(fact, documentId)
  const mutations = useFactMutations(fact, documentId, ontology.relations)
  const status = getEffectiveStatus(fact)
  const structurallyUnmapped = isStructurallyUnmapped(fact)
  const statusStyles = getReviewStatusStyles(status)
  const unmappedStyles = getReviewStatusStyles("unmapped")
  const completeness = useMemo(
    () => getFactCompleteness(fact, completenessOntology, entityById),
    [fact, completenessOntology, entityById]
  )

  const primaryAnchor = fact.anchors[0] ?? null

  const currentClassName = (() => {
    if (!mutations.pendingEntityClass?.role) return null
    const classId =
      mutations.pendingEntityClass.role === "subject"
        ? fact.subject_class_id
        : fact.object_class_id
    return ontology.classes.find((cls) => cls.id === classId)?.name ?? null
  })()

  const pendingClassName = mutations.pendingEntityClass?.classId
    ? (ontology.classes.find(
        (cls) => cls.id === mutations.pendingEntityClass!.classId
      )?.name ?? null)
    : null

  const rowClassName = cn(
    "text-xs",
    status !== "pending" ? statusStyles.surfaceClass : "border-border"
  )
  const hasRelationAttributes = ontology.relationAttributes.some(
    (attribute) => attribute.relationId === fact.relation_type_id
  )
  const isAcceptBlockedByCompleteness =
    !mutations.isReviewPending && !completeness.isComplete
  const missingAcceptRequirements = [
    completeness.missingRelationAttributes.length > 0
      ? "Required relation fields"
      : null,
    completeness.missingSubjectAttributes.length > 0
      ? "Required subject fields"
      : null,
    completeness.missingObjectAttributes.length > 0
      ? "Required object fields"
      : null,
  ].filter(Boolean)

  function handleInspectorEntityClick(entityId: string, entityText: string) {
    const applySelection = () =>
      setInspectorEntitySelection({
        entityId,
        entityText,
      })

    if (!onRevealInspector) {
      applySelection()
      return
    }

    onRevealInspector()
    window.requestAnimationFrame(applySelection)
  }

  function handleOpenRelationAttributes() {
    const highlightSelectedFact = () =>
      highlightFact(fact.id, "table_relation_attributes")

    if (!onRevealInspector) {
      highlightSelectedFact()
      return
    }

    onRevealInspector()
    window.requestAnimationFrame(highlightSelectedFact)
  }

  return (
    <>
      <PendingEntityClassDialog
        dialogType={mutations.dialogType}
        affectedFacts={mutations.affectedFacts}
        currentClassName={currentClassName}
        pendingClassName={pendingClassName}
        onConfirm={mutations.handleConfirmEntityClass}
        onCancel={mutations.handleCancelEntityClass}
      />

      <TooltipProvider>
        <tr
          className={cn(
            rowClassName,
            primaryAnchor ? "border-b-0" : "border-b"
          )}
        >
          <td className="w-8 px-2 py-1.5 align-middle">
            <input
              type="checkbox"
              checked={selectedIds.has(fact.id)}
              onChange={(e) => onSelectChange(fact.id, e.target.checked)}
              className="h-3 w-3"
            />
          </td>

          <td className="w-[26%] px-2 py-1.5 align-top">
            <div className="flex flex-col gap-1">
              <FactTableEntityNameRow
                value={fact.subject_text}
                disabled={mutations.isAnyPending}
                entityId={fact.subject_entity_id}
                missingFieldNames={completeness.missingSubjectAttributes.map(
                  (attribute) => attribute.attribute.name
                )}
                onFilter={() => {
                  setSubjectEntity(DOCUMENT_FILTER_ALL)
                  setObjectEntity(DOCUMENT_FILTER_ALL)
                  setEntity({
                    label: fact.subject_text,
                    text: fact.subject_text,
                    entityId: fact.subject_entity_id,
                  })
                }}
                onEntityClick={(entityId) =>
                  handleInspectorEntityClick(entityId, fact.subject_text)
                }
                onSave={(v) => mutations.handleRename("subject_text", v)}
              />
              <ClassPicker
                value={fact.subject_class_id ?? ""}
                onValueChange={(id) =>
                  void mutations.handleRemapEntityClass("subject", id)
                }
                allClasses={ontology.filteredSubjectClasses}
                modules={ontology.modules}
                currentModuleId={null}
                placeholder="Unmapped"
                disabled={mutations.isAnyPending}
                unavailableClasses={ontology.unavailableSubjectClasses}
                constraintCopy={ontology.subjectConstraintCopy}
                onClear={() =>
                  void mutations.handleRemapEntityClass("subject", null)
                }
                className={cn(
                  "h-5 rounded px-1.5 text-[10px]",
                  !fact.subject_class_id &&
                    `border-dashed ${unmappedStyles.borderTextClass}`
                )}
              />
            </div>
          </td>

          <td className="w-[24%] px-2 py-1.5 align-top">
            <div className="flex flex-col gap-1">
              <FactRelationField
                value={fact.relation_text}
                disabled={mutations.isAnyPending}
                afterValue={
                  <MissingRequiredNote
                    fieldNames={completeness.missingRelationAttributes.map(
                      (attribute) => attribute.name
                    )}
                  />
                }
                onFilter={() =>
                  setExtractedRelation({
                    label: fact.relation_text,
                    text: fact.relation_text,
                  })
                }
                onGoTo={
                  hasRelationAttributes
                    ? handleOpenRelationAttributes
                    : undefined
                }
                goToLabel="Open relation attributes in inspector"
                onSave={(v) => mutations.handleRename("relation_text", v)}
              />
              <RelationPicker
                value={fact.relation_type_id}
                options={ontology.filteredRelations}
                unavailableOptions={ontology.unavailableRelations}
                classes={ontology.classes}
                modules={ontology.modules}
                disabled={mutations.isAnyPending}
                onSelect={(id) => void mutations.handleRemapRelation(id)}
                constraintCopy={ontology.relationConstraintCopy}
                className={cn(
                  !fact.relation_type_id &&
                    `border-dashed ${unmappedStyles.borderTextClass}`
                )}
              />
            </div>
          </td>

          <td className="w-[26%] px-2 py-1.5 align-top">
            <div className="flex flex-col gap-1">
              <FactTableEntityNameRow
                value={fact.object_text}
                disabled={mutations.isAnyPending}
                entityId={fact.object_entity_id}
                missingFieldNames={completeness.missingObjectAttributes.map(
                  (attribute) => attribute.attribute.name
                )}
                onFilter={() => {
                  setSubjectEntity(DOCUMENT_FILTER_ALL)
                  setObjectEntity(DOCUMENT_FILTER_ALL)
                  setEntity({
                    label: fact.object_text,
                    text: fact.object_text,
                    entityId: fact.object_entity_id,
                  })
                }}
                onEntityClick={(entityId) =>
                  handleInspectorEntityClick(entityId, fact.object_text)
                }
                onSave={(v) => mutations.handleRename("object_text", v)}
              />
              <ClassPicker
                value={fact.object_class_id ?? ""}
                onValueChange={(id) =>
                  void mutations.handleRemapEntityClass("object", id)
                }
                allClasses={ontology.filteredObjectClasses}
                modules={ontology.modules}
                currentModuleId={null}
                placeholder="Unmapped"
                disabled={mutations.isAnyPending}
                unavailableClasses={ontology.unavailableObjectClasses}
                constraintCopy={ontology.objectConstraintCopy}
                onClear={() =>
                  void mutations.handleRemapEntityClass("object", null)
                }
                className={cn(
                  "h-5 rounded px-1.5 text-[10px]",
                  !fact.object_class_id &&
                    `border-dashed ${unmappedStyles.borderTextClass}`
                )}
              />
            </div>
          </td>

          <td className="w-16 px-2 py-1.5 text-right align-middle text-muted-foreground">
            {fact.confidence !== null
              ? `${Math.round(fact.confidence * 100)}%`
              : "-"}
          </td>

          <td className="w-20 px-2 py-1.5 text-right align-middle">
            {!(status === "rejected" && structurallyUnmapped) && (
              <div className="flex items-center justify-end gap-0.5">
                {(status === "accepted" || status === "rejected") && (
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6"
                    title="Reset to pending"
                    disabled={mutations.isReviewPending}
                    onClick={() => void mutations.handleReview("pending")}
                  >
                    {mutations.isReviewPending ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <RotateCcw className="h-3.5 w-3.5" />
                    )}
                  </Button>
                )}
                {(status === "pending" || status === "rejected") && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="inline-flex">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-6 w-6 text-green-600 disabled:text-muted-foreground disabled:opacity-35"
                          title={
                            completeness.isComplete
                              ? "Accept"
                              : "Complete required fields to accept"
                          }
                          disabled={
                            mutations.isReviewPending ||
                            !completeness.isComplete
                          }
                          onClick={() =>
                            void mutations.handleReview("accepted")
                          }
                        >
                          {mutations.isReviewPending ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <CheckCheck className="h-3.5 w-3.5" />
                          )}
                        </Button>
                      </span>
                    </TooltipTrigger>
                    {isAcceptBlockedByCompleteness ? (
                      <TooltipContent side="top" align="end">
                        <div className="space-y-1">
                          <div>Complete these to accept:</div>
                          <ul className="list-disc space-y-0.5 pl-4">
                            {missingAcceptRequirements.map((requirement) => (
                              <li key={requirement}>{requirement}</li>
                            ))}
                          </ul>
                        </div>
                      </TooltipContent>
                    ) : null}
                  </Tooltip>
                )}
                {(status === "pending" ||
                  status === "accepted" ||
                  status === "unmapped") && (
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6 text-red-500"
                    title="Reject"
                    disabled={mutations.isReviewPending}
                    onClick={() => void mutations.handleReview("rejected")}
                  >
                    {mutations.isReviewPending ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <X className="h-3.5 w-3.5" />
                    )}
                  </Button>
                )}
              </div>
            )}
          </td>
        </tr>
        {primaryAnchor ? (
          <FactTableAnchorRow
            quoteText={primaryAnchor.quote_text}
            rowClassName={rowClassName}
          />
        ) : null}
      </TooltipProvider>
    </>
  )
}
