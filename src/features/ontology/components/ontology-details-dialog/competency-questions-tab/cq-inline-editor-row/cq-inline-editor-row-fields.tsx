import type { Dispatch, SetStateAction } from "react"

import { ClassPicker } from "@/components/shared/class-picker/class-picker"
import type { PickerConstraintCopy } from "@/components/shared/class-picker/types"
import { TableCell, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import type { OntologyModule, OntologyRelation } from "@/domain/ontology"
import { RelationPicker } from "@/features/documents/components/fact-card/relation-picker/relation-picker"
import type { OntologyClassWithAttributes } from "@/features/ontology/server/queries"

import { ExampleCandidateSelect } from "../example-candidate-select"
import { CQModuleLinkField } from "../cq-module-link-field"
import { CQInlineEditorRowActions } from "./cq-inline-editor-row-actions"

interface CQInlineEditorRowFieldsProps {
  question: string
  onQuestionChange: (question: string) => void
  modules: OntologyModule[]
  selectedModuleIds: Set<string>
  onSelectedModuleIdsChange: Dispatch<SetStateAction<Set<string>>>
  subjectClassId: string | null
  predicateRelationId: string | null
  objectClassId: string | null
  subjectExampleId: string | null
  predicateExampleId: string | null
  objectExampleId: string | null
  classMap: Map<string, OntologyClassWithAttributes>
  relationMap: Map<string, OntologyRelation>
  classes: OntologyClassWithAttributes[]
  filteredSubjectClasses: OntologyClassWithAttributes[]
  filteredRelations: OntologyRelation[]
  filteredObjectClasses: OntologyClassWithAttributes[]
  unavailableSubjectClasses: OntologyClassWithAttributes[]
  unavailableRelations: OntologyRelation[]
  unavailableObjectClasses: OntologyClassWithAttributes[]
  subjectConstraintCopy?: PickerConstraintCopy
  relationConstraintCopy?: PickerConstraintCopy
  objectConstraintCopy?: PickerConstraintCopy
  onSubjectClassChange: (id: string) => void
  onObjectClassChange: (id: string) => void
  onRelationSelect: (relationId: string | null) => void
  onClearSubjectClass: () => void
  onClearObjectClass: () => void
  onSubjectExampleChange: (exampleId: string | null) => void
  onPredicateExampleChange: (exampleId: string | null) => void
  onObjectExampleChange: (exampleId: string | null) => void
  isPending: boolean
  isEditing: boolean
  onSave: () => void
  onCancel: () => void
}

export function CQInlineEditorRowFields({
  question,
  onQuestionChange,
  modules,
  selectedModuleIds,
  onSelectedModuleIdsChange,
  subjectClassId,
  predicateRelationId,
  objectClassId,
  subjectExampleId,
  predicateExampleId,
  objectExampleId,
  classMap,
  relationMap,
  classes,
  filteredSubjectClasses,
  filteredRelations,
  filteredObjectClasses,
  unavailableSubjectClasses,
  unavailableRelations,
  unavailableObjectClasses,
  subjectConstraintCopy,
  relationConstraintCopy,
  objectConstraintCopy,
  onSubjectClassChange,
  onObjectClassChange,
  onRelationSelect,
  onClearSubjectClass,
  onClearObjectClass,
  onSubjectExampleChange,
  onPredicateExampleChange,
  onObjectExampleChange,
  isPending,
  isEditing,
  onSave,
  onCancel,
}: CQInlineEditorRowFieldsProps) {
  return (
    <TableRow className="bg-muted/20 align-top hover:bg-muted/20">
      <TableCell className="min-w-44 align-top whitespace-normal xl:min-w-50">
        <Textarea
          value={question}
          onChange={(event) => onQuestionChange(event.target.value)}
          placeholder="What does the ontology need to be able to answer?"
          rows={4}
          className="min-h-24 text-xs"
        />
      </TableCell>
      <TableCell className="min-w-20 align-top whitespace-normal">
        <CQModuleLinkField
          modules={modules}
          selectedModuleIds={selectedModuleIds}
          onSelectedModuleIdsChange={onSelectedModuleIdsChange}
          subjectClassId={subjectClassId}
          objectClassId={objectClassId}
          predicateRelationId={predicateRelationId}
          classMap={classMap}
          relationMap={relationMap}
          hideLabel
          className="w-full"
        />
      </TableCell>
      <TableCell className="min-w-32 align-top whitespace-normal">
        <div className="flex flex-col gap-2">
          <ClassPicker
            value={subjectClassId ?? ""}
            onValueChange={onSubjectClassChange}
            allClasses={filteredSubjectClasses}
            modules={modules}
            currentModuleId={null}
            placeholder="Select class"
            noneOption={{ label: "None", value: "" }}
            unavailableClasses={unavailableSubjectClasses}
            constraintCopy={subjectConstraintCopy}
            onClear={onClearSubjectClass}
            className="rounded-md"
          />
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-medium tracking-wider text-muted-foreground uppercase">
              Instance optional
            </span>
            {subjectClassId ? (
              <ExampleCandidateSelect
                target={{ type: "class", id: subjectClassId }}
                value={subjectExampleId}
                onValueChange={onSubjectExampleChange}
                placeholder="Any instance"
                emptyMessage="No allowed examples defined."
              />
            ) : (
              <span className="text-xs text-muted-foreground">
                Select subject first
              </span>
            )}
          </div>
        </div>
      </TableCell>
      <TableCell className="min-w-32 align-top whitespace-normal">
        <div className="flex flex-col gap-2">
          <RelationPicker
            value={predicateRelationId}
            options={filteredRelations}
            unavailableOptions={unavailableRelations}
            classes={classes}
            modules={modules}
            disabled={isPending}
            onSelect={onRelationSelect}
            constraintCopy={relationConstraintCopy}
            className="mt-0 h-8 rounded-md px-2.5 py-2 text-xs"
          />
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-medium tracking-wider text-muted-foreground uppercase">
              Example optional
            </span>
            {predicateRelationId ? (
              <ExampleCandidateSelect
                target={{ type: "relation", id: predicateRelationId }}
                value={predicateExampleId}
                onValueChange={onPredicateExampleChange}
                placeholder="Any example"
                emptyMessage="No allowed examples defined."
              />
            ) : (
              <span className="text-xs text-muted-foreground">
                Select predicate first
              </span>
            )}
          </div>
        </div>
      </TableCell>
      <TableCell className="min-w-32 align-top whitespace-normal">
        <div className="flex flex-col gap-2">
          <ClassPicker
            value={objectClassId ?? ""}
            onValueChange={onObjectClassChange}
            allClasses={filteredObjectClasses}
            modules={modules}
            currentModuleId={null}
            placeholder="Select class"
            noneOption={{ label: "None", value: "" }}
            unavailableClasses={unavailableObjectClasses}
            constraintCopy={objectConstraintCopy}
            onClear={onClearObjectClass}
            className="rounded-md"
          />
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-medium tracking-wider text-muted-foreground uppercase">
              Instance optional
            </span>
            {objectClassId ? (
              <ExampleCandidateSelect
                target={{ type: "class", id: objectClassId }}
                value={objectExampleId}
                onValueChange={onObjectExampleChange}
                placeholder="Any instance"
                emptyMessage="No allowed examples defined."
              />
            ) : (
              <span className="text-xs text-muted-foreground">
                Select object first
              </span>
            )}
          </div>
        </div>
      </TableCell>
      <CQInlineEditorRowActions
        isPending={isPending}
        isEditing={isEditing}
        onSave={onSave}
        onCancel={onCancel}
      />
    </TableRow>
  )
}
