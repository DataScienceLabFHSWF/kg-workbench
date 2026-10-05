"use server"

import { revalidatePath } from "next/cache"
import { eq } from "drizzle-orm"

import type { OntologyCompetencyQuestion } from "@/domain/ontology"
import { routes } from "@/lib/routes"
import {
  assertOntologyDocumentAccess,
  assertOntologyRecordAccess,
} from "@/server/group-access"
import { getDb } from "@/server/database"
import {
  ontologyCompetencyQuestionModules,
  ontologyCompetencyQuestions,
} from "@/server/db/schema"

export async function createCQ(
  ontologyId: string,
  data: {
    question?: string
    subjectClassId?: string | null
    predicateRelationId?: string | null
    objectClassId?: string | null
    subjectExampleId?: string | null
    predicateExampleId?: string | null
    objectExampleId?: string | null
    sortOrder?: number
  }
): Promise<OntologyCompetencyQuestion> {
  const db = getDb()
  await assertOntologyDocumentAccess(ontologyId, db)
  const [row] = await db
    .insert(ontologyCompetencyQuestions)
    .values({
      ontology_id: ontologyId,
      question: data.question ?? "",
      subject_class_id: data.subjectClassId ?? null,
      predicate_relation_id: data.predicateRelationId ?? null,
      object_class_id: data.objectClassId ?? null,
      subject_example_id: data.subjectExampleId ?? null,
      predicate_example_id: data.predicateExampleId ?? null,
      object_example_id: data.objectExampleId ?? null,
      sort_order: data.sortOrder ?? 0,
    })
    .returning()
  if (!row) throw new Error("Failed to create competency question.")
  revalidatePath(routes.ontology.root)
  return row
}

export async function updateCQ(
  id: string,
  data: {
    question?: string
    subjectClassId?: string | null
    predicateRelationId?: string | null
    objectClassId?: string | null
    subjectExampleId?: string | null
    predicateExampleId?: string | null
    objectExampleId?: string | null
    sortOrder?: number
  }
): Promise<OntologyCompetencyQuestion> {
  const db = getDb()
  await assertOntologyRecordAccess("ontology_competency_questions", id, db)
  const [row] = await db
    .update(ontologyCompetencyQuestions)
    .set({
      ...(data.question !== undefined && { question: data.question }),
      ...(data.subjectClassId !== undefined && {
        subject_class_id: data.subjectClassId,
      }),
      ...(data.predicateRelationId !== undefined && {
        predicate_relation_id: data.predicateRelationId,
      }),
      ...(data.objectClassId !== undefined && {
        object_class_id: data.objectClassId,
      }),
      ...(data.subjectExampleId !== undefined && {
        subject_example_id: data.subjectExampleId,
      }),
      ...(data.predicateExampleId !== undefined && {
        predicate_example_id: data.predicateExampleId,
      }),
      ...(data.objectExampleId !== undefined && {
        object_example_id: data.objectExampleId,
      }),
      ...(data.sortOrder !== undefined && { sort_order: data.sortOrder }),
    })
    .where(eq(ontologyCompetencyQuestions.id, id))
    .returning()
  if (!row) throw new Error("Competency question was not found.")
  revalidatePath(routes.ontology.root)
  return row
}

export async function deleteCQ(id: string): Promise<void> {
  const db = getDb()
  await assertOntologyRecordAccess("ontology_competency_questions", id, db)
  await db
    .delete(ontologyCompetencyQuestions)
    .where(eq(ontologyCompetencyQuestions.id, id))
  revalidatePath(routes.ontology.root)
}

export async function setCQModules(
  cqId: string,
  moduleIds: string[]
): Promise<void> {
  const db = getDb()
  await assertOntologyRecordAccess("ontology_competency_questions", cqId, db)
  await Promise.all(
    moduleIds.map((moduleId) =>
      assertOntologyRecordAccess("ontology_modules", moduleId, db)
    )
  )
  await db
    .delete(ontologyCompetencyQuestionModules)
    .where(eq(ontologyCompetencyQuestionModules.cq_id, cqId))

  if (moduleIds.length > 0) {
    await db
      .insert(ontologyCompetencyQuestionModules)
      .values(
        moduleIds.map((moduleId) => ({ cq_id: cqId, module_id: moduleId }))
      )
  }
  revalidatePath(routes.ontology.root)
}
