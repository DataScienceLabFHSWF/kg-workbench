"use client"

import { useMemo, useState } from "react"

import { useQuery, useQueryClient } from "@tanstack/react-query"

import type { FactReviewStatus } from "@/lib/types"

import type { DocumentOntology, FactWithAnchors } from "../server/queries"
import { fetchDocumentFacts } from "../server/queries"
import {
  clearRelationTypeOnFacts,
  remapFactField,
  renameFactPart,
  reviewFact,
} from "../server/actions/facts"
import { remapEntityClassFromFact } from "../server/actions/entities"
import { getPendingEntityClassDialogState } from "../components/fact-card/entity-class-remap"
import type {
  DialogType,
  FactEntityRole,
  PendingEntityClass,
} from "../components/fact-card/types"

export interface FactMutations {
  isAnyPending: boolean
  isReviewPending: boolean
  dialogType: DialogType | null
  pendingEntityClass: PendingEntityClass | null
  affectedFacts: FactWithAnchors[]
  handleReview: (status: FactReviewStatus) => Promise<void>
  handleRemapRelation: (id: string | null) => Promise<void>
  handleRemapEntityClass: (
    role: FactEntityRole,
    classId: string | null
  ) => Promise<void>
  handleConfirmEntityClass: () => Promise<void>
  handleCancelEntityClass: () => void
  handleRename: (
    field: "subject_text" | "relation_text" | "object_text",
    newText: string
  ) => Promise<void>
}

export function useFactMutations(
  fact: FactWithAnchors,
  documentId: string,
  relations: DocumentOntology["relations"]
): FactMutations {
  const queryClient = useQueryClient()
  const [isReviewPending, setIsReviewPending] = useState(false)
  const [isRemapPending, setIsRemapPending] = useState(false)
  const [isRenamePending, setIsRenamePending] = useState(false)
  const [dialogType, setDialogType] = useState<DialogType | null>(null)
  const [pendingEntityClass, setPendingEntityClass] =
    useState<PendingEntityClass | null>(null)
  const [affectedFacts, setAffectedFacts] = useState<FactWithAnchors[]>([])

  const { data: allFacts = [] } = useQuery<FactWithAnchors[]>({
    queryKey: ["document-facts", documentId],
    queryFn: () => fetchDocumentFacts(documentId),
  })

  const relationMap = useMemo(
    () => new Map(relations.map((r) => [r.id, r])),
    [relations]
  )

  const isAnyPending = isReviewPending || isRemapPending || isRenamePending

  async function invalidateFactQueries() {
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: ["document-facts", documentId],
      }),
      queryClient.invalidateQueries({
        queryKey: ["document-entities", documentId],
      }),
    ])
  }

  async function handleReview(newStatus: FactReviewStatus) {
    setIsReviewPending(true)
    try {
      await reviewFact(fact.id, newStatus)
      await queryClient.invalidateQueries({
        queryKey: ["document-facts", documentId],
      })
    } finally {
      setIsReviewPending(false)
    }
  }

  async function handleRemapRelation(newId: string | null) {
    setIsRemapPending(true)
    try {
      const selectedRelation =
        newId === null ? null : (relationMap.get(newId) ?? null)

      const updates: Promise<unknown>[] = [
        remapFactField(fact.id, "relation_type_id", newId),
      ]

      if (selectedRelation && !fact.subject_class_id) {
        updates.push(
          remapEntityClassFromFact(
            fact.id,
            "subject",
            selectedRelation.domain_class_id,
            documentId
          )
        )
      }

      if (selectedRelation && !fact.object_class_id) {
        updates.push(
          remapEntityClassFromFact(
            fact.id,
            "object",
            selectedRelation.range_class_id,
            documentId
          )
        )
      }

      await Promise.all(updates)
      await invalidateFactQueries()
    } finally {
      setIsRemapPending(false)
    }
  }

  async function applyEntityClass(
    role: FactEntityRole,
    classId: string | null
  ) {
    setIsRemapPending(true)
    try {
      await remapEntityClassFromFact(fact.id, role, classId, documentId)
      await invalidateFactQueries()
    } finally {
      setIsRemapPending(false)
    }
  }

  async function handleRemapEntityClass(
    role: FactEntityRole,
    classId: string | null
  ) {
    const pendingDialogState = getPendingEntityClassDialogState({
      fact,
      role,
      classId,
      allFacts,
      relationMap,
    })

    if (pendingDialogState) {
      setAffectedFacts(pendingDialogState.affectedFacts)
      setDialogType(pendingDialogState.dialogType)
      setPendingEntityClass(pendingDialogState.pendingEntityClass)
      return
    }

    await applyEntityClass(role, classId)
  }

  async function handleConfirmEntityClass() {
    if (!pendingEntityClass || !dialogType) return

    setIsRemapPending(true)
    try {
      if (dialogType === "relation-break") {
        await Promise.all([
          remapEntityClassFromFact(
            fact.id,
            pendingEntityClass.role,
            pendingEntityClass.classId,
            documentId
          ),
          clearRelationTypeOnFacts(
            affectedFacts.map((f) => f.id),
            documentId
          ),
        ])
      } else {
        await remapEntityClassFromFact(
          fact.id,
          pendingEntityClass.role,
          pendingEntityClass.classId,
          documentId
        )
      }

      await invalidateFactQueries()
    } finally {
      setIsRemapPending(false)
      setPendingEntityClass(null)
      setAffectedFacts([])
      setDialogType(null)
    }
  }

  function handleCancelEntityClass() {
    setPendingEntityClass(null)
    setAffectedFacts([])
    setDialogType(null)
  }

  async function handleRename(
    field: "subject_text" | "relation_text" | "object_text",
    newText: string
  ) {
    const trimmed = newText.trim()
    if (!trimmed) return

    setIsRenamePending(true)
    try {
      await renameFactPart(fact.id, field, trimmed)
      await queryClient.invalidateQueries({
        queryKey: ["document-facts", documentId],
      })
    } finally {
      setIsRenamePending(false)
    }
  }

  return {
    isAnyPending,
    isReviewPending,
    dialogType,
    pendingEntityClass,
    affectedFacts,
    handleReview,
    handleRemapRelation,
    handleRemapEntityClass,
    handleConfirmEntityClass,
    handleCancelEntityClass,
    handleRename,
  }
}
