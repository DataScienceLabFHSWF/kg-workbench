"use client"

import { useMemo, useState, useTransition } from "react"
import { toast } from "sonner"

import type { OntologyModule, OntologyRelation } from "@/domain/ontology"
import {
  createCQ,
  setCQModules,
  updateCQ,
} from "@/features/ontology/server/actions/competency-questions"
import type {
  OntologyClassWithAttributes,
  OntologyCQWithModules,
  OntologyDocumentWithModules,
} from "@/features/ontology/server/queries"
import { getTriplePickerOptions } from "@/lib/triple-picker-options"

import { CQInlineEditorRowConflict } from "./cq-inline-editor-row-conflict"
import { CQInlineEditorRowFields } from "./cq-inline-editor-row-fields"
import { buildConstraintCopy } from "./utils"

interface CQInlineEditorRowProps {
  ontology: OntologyDocumentWithModules
  modules: OntologyModule[]
  classes: OntologyClassWithAttributes[]
  relations: OntologyRelation[]
  editingCQ?: OntologyCQWithModules
  initialModuleId?: string | null
  onCancel: () => void
  onSaved: () => void
}

export function CQInlineEditorRow({
  ontology,
  modules,
  classes,
  relations,
  editingCQ,
  initialModuleId,
  onCancel,
  onSaved,
}: CQInlineEditorRowProps) {
  const [question, setQuestion] = useState(editingCQ?.question ?? "")
  const [subjectClassId, setSubjectClassId] = useState<string | null>(
    editingCQ?.subject_class_id ?? null
  )
  const [predicateRelationId, setPredicateRelationId] = useState<string | null>(
    editingCQ?.predicate_relation_id ?? null
  )
  const [objectClassId, setObjectClassId] = useState<string | null>(
    editingCQ?.object_class_id ?? null
  )
  const [subjectExampleId, setSubjectExampleId] = useState<string | null>(
    editingCQ?.subject_example_id ?? null
  )
  const [predicateExampleId, setPredicateExampleId] = useState<string | null>(
    editingCQ?.predicate_example_id ?? null
  )
  const [objectExampleId, setObjectExampleId] = useState<string | null>(
    editingCQ?.object_example_id ?? null
  )
  const [selectedModuleIds, setSelectedModuleIds] = useState<Set<string>>(
    new Set(
      editingCQ
        ? editingCQ.modules.map((module) => module.id)
        : initialModuleId
          ? [initialModuleId]
          : []
    )
  )
  const [isPending, startTransition] = useTransition()

  const classMap = useMemo(
    () =>
      new Map(
        classes.map((ontologyClass) => [ontologyClass.id, ontologyClass])
      ),
    [classes]
  )
  const relationMap = useMemo(
    () => new Map(relations.map((relation) => [relation.id, relation])),
    [relations]
  )

  const {
    filteredSubjectClasses,
    filteredRelations,
    filteredObjectClasses,
    selectedRelation,
  } = useMemo(
    () =>
      getTriplePickerOptions({
        classes,
        relations,
        subjectId: subjectClassId,
        relationId: predicateRelationId,
        objectId: objectClassId,
      }),
    [classes, relations, subjectClassId, predicateRelationId, objectClassId]
  )

  const unavailableSubjectClasses = useMemo(() => {
    const allowedIds = new Set(filteredSubjectClasses.map((cls) => cls.id))
    return classes.filter((cls) => !allowedIds.has(cls.id))
  }, [classes, filteredSubjectClasses])

  const unavailableRelations = useMemo(() => {
    const allowedIds = new Set(filteredRelations.map((relation) => relation.id))
    return relations.filter((relation) => !allowedIds.has(relation.id))
  }, [filteredRelations, relations])

  const unavailableObjectClasses = useMemo(() => {
    const allowedIds = new Set(filteredObjectClasses.map((cls) => cls.id))
    return classes.filter((cls) => !allowedIds.has(cls.id))
  }, [classes, filteredObjectClasses])

  const subjectConstraintCopy = useMemo(
    () =>
      buildConstraintCopy(
        selectedRelation
          ? [{ kind: "relation", text: selectedRelation.name }]
          : objectClassId
            ? [
                {
                  kind: "object",
                  text: classMap.get(objectClassId)?.name ?? "selected object",
                },
              ]
            : []
      ),
    [classMap, objectClassId, selectedRelation]
  )

  const relationConstraintCopy = useMemo(
    () =>
      buildConstraintCopy([
        subjectClassId
          ? {
              kind: "subject",
              text: classMap.get(subjectClassId)?.name ?? "selected subject",
            }
          : null,
        objectClassId
          ? {
              kind: "object",
              text: classMap.get(objectClassId)?.name ?? "selected object",
            }
          : null,
      ]),
    [classMap, objectClassId, subjectClassId]
  )

  const objectConstraintCopy = useMemo(
    () =>
      buildConstraintCopy(
        selectedRelation
          ? [{ kind: "relation", text: selectedRelation.name }]
          : subjectClassId
            ? [
                {
                  kind: "subject",
                  text:
                    classMap.get(subjectClassId)?.name ?? "selected subject",
                },
              ]
            : []
      ),
    [classMap, selectedRelation, subjectClassId]
  )

  const subjectConflict =
    selectedRelation &&
    subjectClassId &&
    subjectClassId !== selectedRelation.domain_class_id
  const objectConflict =
    selectedRelation &&
    objectClassId &&
    objectClassId !== selectedRelation.range_class_id
  const hasConflict = Boolean(subjectConflict || objectConflict)

  function handleRelationSelect(relationId: string | null) {
    setPredicateRelationId(relationId)
    setPredicateExampleId(null)

    if (!relationId) return

    const relation = relationMap.get(relationId)
    if (!relation) return

    if (!subjectClassId) setSubjectClassId(relation.domain_class_id)
    if (!objectClassId) setObjectClassId(relation.range_class_id)
  }

  function handleUseRelationClasses() {
    if (!selectedRelation) return

    setSubjectClassId(selectedRelation.domain_class_id)
    setObjectClassId(selectedRelation.range_class_id)
    setSubjectExampleId(null)
    setObjectExampleId(null)
  }

  function handleSubjectClassChange(id: string) {
    setSubjectClassId(id || null)
    setSubjectExampleId(null)
  }

  function handleObjectClassChange(id: string) {
    setObjectClassId(id || null)
    setObjectExampleId(null)
  }

  function handleSave() {
    startTransition(async () => {
      try {
        const data = {
          question,
          subjectClassId,
          predicateRelationId,
          objectClassId,
          subjectExampleId,
          predicateExampleId,
          objectExampleId,
        }

        let cqId: string
        if (editingCQ) {
          await updateCQ(editingCQ.id, data)
          cqId = editingCQ.id
        } else {
          const created = await createCQ(ontology.id, data)
          cqId = created.id
        }

        await setCQModules(cqId, [...selectedModuleIds])
        toast.success(editingCQ ? "CQ updated." : "CQ created.")
        onSaved()
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Save failed.")
      }
    })
  }

  return (
    <>
      <CQInlineEditorRowFields
        question={question}
        onQuestionChange={setQuestion}
        modules={modules}
        selectedModuleIds={selectedModuleIds}
        onSelectedModuleIdsChange={setSelectedModuleIds}
        subjectClassId={subjectClassId}
        predicateRelationId={predicateRelationId}
        objectClassId={objectClassId}
        subjectExampleId={subjectExampleId}
        predicateExampleId={predicateExampleId}
        objectExampleId={objectExampleId}
        classMap={classMap}
        relationMap={relationMap}
        classes={classes}
        filteredSubjectClasses={filteredSubjectClasses}
        filteredRelations={filteredRelations}
        filteredObjectClasses={filteredObjectClasses}
        unavailableSubjectClasses={unavailableSubjectClasses}
        unavailableRelations={unavailableRelations}
        unavailableObjectClasses={unavailableObjectClasses}
        subjectConstraintCopy={subjectConstraintCopy}
        relationConstraintCopy={relationConstraintCopy}
        objectConstraintCopy={objectConstraintCopy}
        onSubjectClassChange={handleSubjectClassChange}
        onObjectClassChange={handleObjectClassChange}
        onRelationSelect={handleRelationSelect}
        onClearSubjectClass={() => {
          setSubjectClassId(null)
          setSubjectExampleId(null)
        }}
        onClearObjectClass={() => {
          setObjectClassId(null)
          setObjectExampleId(null)
        }}
        onSubjectExampleChange={setSubjectExampleId}
        onPredicateExampleChange={setPredicateExampleId}
        onObjectExampleChange={setObjectExampleId}
        isPending={isPending}
        isEditing={Boolean(editingCQ)}
        onSave={handleSave}
        onCancel={onCancel}
      />

      {hasConflict && (
        <CQInlineEditorRowConflict
          subjectConflict={Boolean(subjectConflict)}
          objectConflict={Boolean(objectConflict)}
          onUseRelationClasses={handleUseRelationClasses}
        />
      )}
    </>
  )
}
