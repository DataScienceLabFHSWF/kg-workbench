"use server"
import { eq, or } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import type { OntologyExample, OntologyExampleInsert } from "@/domain/ontology"
import type { OntologyExampleTarget } from "@/features/ontology/server/queries"
import { routes } from "@/lib/routes"
import {
  assertOntologyDocumentAccess,
  assertOntologyRecordAccess,
} from "@/server/group-access"
import { getDb } from "@/server/database"
import {
  ontologyCompetencyQuestions,
  ontologyExamples,
} from "@/server/db/schema"
type ExampleTargetFields = Pick<
  OntologyExampleInsert,
  | "target_class_id"
  | "target_attribute_id"
  | "target_relation_id"
  | "target_relation_attribute_id"
  | "target_cq_id"
>
function resolveExampleTarget(
  target: OntologyExampleTarget
): ExampleTargetFields {
  switch (target.type) {
    case "class":
      return { target_class_id: target.id }
    case "attribute":
      return { target_attribute_id: target.id }
    case "relation":
      return { target_relation_id: target.id }
    case "relation_attribute":
      return { target_relation_attribute_id: target.id }
    case "cq":
      return { target_cq_id: target.id }
  }
}
function resolveOntologyRecordType(type: OntologyExampleTarget["type"]) {
  switch (type) {
    case "class":
      return "ontology_classes" as const
    case "attribute":
      return "ontology_attributes" as const
    case "relation":
      return "ontology_relations" as const
    case "relation_attribute":
      return "ontology_relation_attributes" as const
    case "cq":
      return "ontology_competency_questions" as const
  }
}
export async function createExample(
  ontologyId: string,
  target: OntologyExampleTarget,
  data: {
    value: string
    subjectLabel?: string | null
    predicateLabel?: string | null
    objectLabel?: string | null
    isInstanceCandidate?: boolean
    sortOrder?: number
  }
): Promise<OntologyExample> {
  const db = getDb()
  await assertOntologyDocumentAccess(ontologyId, db)
  await assertOntologyRecordAccess(
    resolveOntologyRecordType(target.type),
    target.id,
    db
  )
  const [row] = await db
    .insert(ontologyExamples)
    .values({
      ontology_id: ontologyId,
      value: data.value,
      subject_label: data.subjectLabel ?? null,
      predicate_label: data.predicateLabel ?? null,
      object_label: data.objectLabel ?? null,
      is_instance_candidate: data.isInstanceCandidate ?? false,
      sort_order: data.sortOrder ?? 0,
      ...resolveExampleTarget(target),
    })
    .returning()
  if (!row) throw new Error("Could not create example.")
  revalidatePath(routes.ontology.root)
  return row
}
export async function updateExample(
  id: string,
  data: {
    value?: string
    subjectLabel?: string | null
    predicateLabel?: string | null
    objectLabel?: string | null
    isInstanceCandidate?: boolean
    sortOrder?: number
  }
): Promise<OntologyExample> {
  const db = getDb()
  await assertOntologyRecordAccess("ontology_examples", id, db)
  if (data.isInstanceCandidate === false)
    await db
      .update(ontologyCompetencyQuestions)
      .set({
        subject_example_id: null,
        object_example_id: null,
        predicate_example_id: null,
      })
      .where(
        or(
          eq(ontologyCompetencyQuestions.subject_example_id, id),
          eq(ontologyCompetencyQuestions.object_example_id, id),
          eq(ontologyCompetencyQuestions.predicate_example_id, id)
        )
      )
  const [row] = await db
    .update(ontologyExamples)
    .set({
      ...(data.value !== undefined && { value: data.value }),
      ...(data.subjectLabel !== undefined && {
        subject_label: data.subjectLabel,
      }),
      ...(data.predicateLabel !== undefined && {
        predicate_label: data.predicateLabel,
      }),
      ...(data.objectLabel !== undefined && { object_label: data.objectLabel }),
      ...(data.isInstanceCandidate !== undefined && {
        is_instance_candidate: data.isInstanceCandidate,
      }),
      ...(data.sortOrder !== undefined && { sort_order: data.sortOrder }),
    })
    .where(eq(ontologyExamples.id, id))
    .returning()
  if (!row) throw new Error("Example not found.")
  revalidatePath(routes.ontology.root)
  return row
}
export async function deleteExample(id: string): Promise<void> {
  const db = getDb()
  await assertOntologyRecordAccess("ontology_examples", id, db)
  await db.delete(ontologyExamples).where(eq(ontologyExamples.id, id))
  revalidatePath(routes.ontology.root)
}
