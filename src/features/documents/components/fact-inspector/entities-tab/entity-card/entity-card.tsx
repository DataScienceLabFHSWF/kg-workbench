"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Plus } from "lucide-react"

import { useQuery, useQueryClient } from "@tanstack/react-query"

import { APP_COLOR_CLASSES } from "@/lib/colors"
import { cn } from "@/lib/utils"
import type { EntityWithAttributes } from "@/domain/documents"
import { AffectedFactsDialog } from "@/features/documents/components/shared/affected-facts-dialog"
import { getEntityMissingRequiredAttributes } from "@/features/documents/utils/fact-completeness"
import type {
  DocumentOntology,
  FactWithAnchors,
} from "../../../../server/queries"
import { fetchDocumentFacts } from "../../../../server/queries"
import { clearRelationTypeOnFacts } from "../../../../server/actions/facts"
import {
  updateEntityClass,
  upsertAttributeValue,
} from "../../../../server/actions/entities"
import { AttributeValueRow } from "../attribute-value-row"
import { AddAttributeRow } from "./add-attribute-row"
import { getEntityCardDialogCopy } from "./dialog-copy"
import { EntityCardHeader } from "./entity-card-header"

type DialogType = "class-clear" | "class-assign" | "relation-break"

interface EntityCardProps {
  entity: EntityWithAttributes
  classes: DocumentOntology["classes"]
  modules: DocumentOntology["modules"]
  ontologyAttributes: DocumentOntology["attributes"]
  relations: DocumentOntology["relations"]
  documentId: string
  highlighted?: boolean
  onFilter?: (entityId: string, entityName: string) => void
}

export function EntityCard({
  entity,
  classes,
  modules,
  ontologyAttributes,
  relations,
  documentId,
  highlighted = false,
  onFilter,
}: EntityCardProps) {
  const queryClient = useQueryClient()
  const cardRef = useRef<HTMLDivElement>(null)
  const [isRemapping, setIsRemapping] = useState(false)
  const [dialogType, setDialogType] = useState<DialogType | null>(null)
  const [pendingClassId, setPendingClassId] = useState<
    string | null | undefined
  >(undefined)
  const [affectedFacts, setAffectedFacts] = useState<FactWithAnchors[]>([])
  const [isAddingAttribute, setIsAddingAttribute] = useState(false)
  const [newAttributeId, setNewAttributeId] = useState("")
  const [newValue, setNewValue] = useState("")
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (highlighted) {
      cardRef.current?.scrollIntoView({ behavior: "smooth", block: "center" })
    }
  }, [highlighted])

  const { data: facts = [] } = useQuery<FactWithAnchors[]>({
    queryKey: ["document-facts", documentId],
    queryFn: () => fetchDocumentFacts(documentId),
  })

  const classAttributes = useMemo(
    () =>
      ontologyAttributes.filter(
        (attribute) => attribute.classId === entity.class_id
      ),
    [ontologyAttributes, entity.class_id]
  )

  const addedAttributeIds = useMemo(
    () => new Set(entity.attributes.map((attribute) => attribute.attribute_id)),
    [entity.attributes]
  )

  const availableToAdd = useMemo(
    () =>
      classAttributes.filter(
        (attribute) =>
          !attribute.required && !addedAttributeIds.has(attribute.id)
      ),
    [classAttributes, addedAttributeIds]
  )
  const missingRequiredAttributes = useMemo(
    () => getEntityMissingRequiredAttributes(entity, ontologyAttributes),
    [entity, ontologyAttributes]
  )

  const classAttributeIds = useMemo(
    () => new Set(classAttributes.map((attribute) => attribute.id)),
    [classAttributes]
  )

  const currentModuleId = useMemo(
    () =>
      entity.class_id
        ? (classes.find((cls) => cls.id === entity.class_id)?.module_id ?? null)
        : null,
    [classes, entity.class_id]
  )

  const currentClassName = useMemo(
    () => classes.find((cls) => cls.id === entity.class_id)?.name ?? null,
    [classes, entity.class_id]
  )

  const pendingClassName = useMemo(
    () =>
      pendingClassId
        ? (classes.find((cls) => cls.id === pendingClassId)?.name ?? null)
        : null,
    [classes, pendingClassId]
  )

  const relationMap = useMemo(
    () => new Map(relations.map((relation) => [relation.id, relation])),
    [relations]
  )

  async function invalidateEntityQueries() {
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: ["document-entities", documentId],
      }),
      queryClient.invalidateQueries({
        queryKey: ["document-facts", documentId],
      }),
    ])
  }

  function factsReferencingEntity(): FactWithAnchors[] {
    return facts.filter(
      (fact) =>
        fact.subject_entity_id === entity.id ||
        fact.object_entity_id === entity.id
    )
  }

  function findRelationConflicts(newClassId: string): FactWithAnchors[] {
    return facts.filter((fact) => {
      if (!fact.relation_type_id) return false

      const relation = relationMap.get(fact.relation_type_id)
      if (!relation) return false

      const isSubject = fact.subject_entity_id === entity.id
      const isObject = fact.object_entity_id === entity.id

      if (!isSubject && !isObject) return false
      if (isSubject && relation.domain_class_id !== newClassId) return true
      if (isObject && relation.range_class_id !== newClassId) return true

      return false
    })
  }

  async function applyClassChange(classId: string | null) {
    setIsRemapping(true)
    try {
      await updateEntityClass(entity.id, classId, documentId)
      await invalidateEntityQueries()
    } finally {
      setIsRemapping(false)
    }
  }

  async function handleClassChange(classId: string) {
    const conflicts = findRelationConflicts(classId)
    if (conflicts.length > 0) {
      setAffectedFacts(conflicts)
      setDialogType("relation-break")
      setPendingClassId(classId)
      return
    }

    if (entity.class_id === null) {
      const referencedFacts = factsReferencingEntity()
      if (referencedFacts.length > 0) {
        setAffectedFacts(referencedFacts)
        setDialogType("class-assign")
        setPendingClassId(classId)
        return
      }
    }

    await applyClassChange(classId)
  }

  async function handleClassClear() {
    const referencedFacts = factsReferencingEntity()
    if (referencedFacts.length > 0) {
      setAffectedFacts(referencedFacts)
      setDialogType("class-clear")
      setPendingClassId(null)
      return
    }

    await applyClassChange(null)
  }

  async function handleConfirmChange() {
    if (pendingClassId === undefined || dialogType === null) return

    setIsRemapping(true)
    try {
      if (dialogType === "relation-break") {
        await Promise.all([
          updateEntityClass(entity.id, pendingClassId, documentId),
          clearRelationTypeOnFacts(
            affectedFacts.map((fact) => fact.id),
            documentId
          ),
        ])
      } else {
        await updateEntityClass(entity.id, pendingClassId, documentId)
      }

      await invalidateEntityQueries()
    } finally {
      setIsRemapping(false)
      setPendingClassId(undefined)
      setAffectedFacts([])
      setDialogType(null)
    }
  }

  function handleCancelChange() {
    setPendingClassId(undefined)
    setAffectedFacts([])
    setDialogType(null)
  }

  async function handleAddAttribute() {
    if (!newAttributeId || !newValue.trim()) return

    setIsSaving(true)
    try {
      await upsertAttributeValue(
        entity.id,
        newAttributeId,
        newValue.trim(),
        documentId
      )
      await queryClient.invalidateQueries({
        queryKey: ["document-entities", documentId],
      })
      setIsAddingAttribute(false)
      setNewAttributeId("")
      setNewValue("")
    } finally {
      setIsSaving(false)
    }
  }

  function handleCancelAdd() {
    setIsAddingAttribute(false)
    setNewAttributeId("")
    setNewValue("")
  }

  const dialogCopy = getEntityCardDialogCopy({
    dialogType,
    affectedFactsCount: affectedFacts.length,
    currentClassName,
    pendingClassName,
  })

  return (
    <>
      {dialogCopy && (
        <AffectedFactsDialog
          open={dialogType !== null}
          title={dialogCopy.title}
          description={dialogCopy.description}
          confirmLabel={dialogCopy.confirmLabel}
          affectedFacts={affectedFacts}
          onConfirm={handleConfirmChange}
          onCancel={handleCancelChange}
        />
      )}

      <div
        ref={cardRef}
        onClick={(event) => event.stopPropagation()}
        className={cn(
          "rounded-md border border-border/60 bg-card text-xs",
          highlighted && `ring-2 ${APP_COLOR_CLASSES.selectionRing}`
        )}
      >
        <EntityCardHeader
          entity={entity}
          classes={classes}
          modules={modules}
          currentModuleId={currentModuleId}
          isRemapping={isRemapping}
          missingRequiredCount={missingRequiredAttributes.length}
          onFilter={
            onFilter ? () => onFilter(entity.id, entity.entity_text) : undefined
          }
          onClassChange={handleClassChange}
          onClassClear={entity.class_id ? handleClassClear : undefined}
        />

        {(missingRequiredAttributes.length > 0 ||
          entity.attributes.length > 0) && (
          <div className="border-t border-border/40 py-0.5">
            {missingRequiredAttributes.map((attribute) => (
              <AttributeValueRow
                key={`missing-${attribute.id}`}
                entityId={entity.id}
                attributeId={attribute.id}
                attributeName={attribute.name}
                value=""
                isMismatched={false}
                isMissingRequired
                documentId={documentId}
              />
            ))}
            {entity.attributes.map((attribute) => (
              <AttributeValueRow
                key={attribute.id}
                id={attribute.id}
                entityId={entity.id}
                attributeId={attribute.attribute_id}
                attributeName={attribute.attribute_name}
                value={attribute.value}
                isMismatched={!classAttributeIds.has(attribute.attribute_id)}
                documentId={documentId}
              />
            ))}
          </div>
        )}

        {isAddingAttribute && (
          <AddAttributeRow
            availableAttributes={availableToAdd}
            value={newValue}
            attributeId={newAttributeId}
            isSaving={isSaving}
            onValueChange={setNewValue}
            onAttributeChange={setNewAttributeId}
            onSave={handleAddAttribute}
            onCancel={handleCancelAdd}
          />
        )}

        {!isAddingAttribute && availableToAdd.length > 0 && (
          <div
            className={cn(
              "border-t border-border/40",
              missingRequiredAttributes.length === 0 &&
                entity.attributes.length === 0 &&
                "border-t-0"
            )}
          >
            <button
              onClick={() => setIsAddingAttribute(true)}
              className="flex w-full items-center gap-1 px-3 py-1 text-[11px] text-muted-foreground hover:bg-muted/50 hover:text-foreground"
            >
              <Plus className="size-3" />
              Add attribute
            </button>
          </div>
        )}
      </div>
    </>
  )
}
