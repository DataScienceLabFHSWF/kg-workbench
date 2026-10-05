"use server"
import { and, asc, eq, or } from "drizzle-orm"
import type {
  OntologyCompetencyQuestion,
  OntologyExample,
  OntologyLocalizedText,
  OntologyNote,
} from "@/domain/ontology"
import {
  assertOntologyDocumentAccess,
  assertOntologyRecordAccess,
} from "@/server/group-access"
import { getDb } from "@/server/database"
import {
  ontologyCompetencyQuestions,
  ontologyExamples,
  ontologyLocalizedTexts,
  ontologyNotes,
} from "@/server/db/schema"
import type {
  OntologyExampleCandidateTarget,
  OntologyExampleImpact,
  OntologyExampleImpactRole,
  OntologyExampleTarget,
  OntologyMetadataTarget,
} from "./types"
const TARGET_COLUMN = {
  ontology: "target_ontology_id",
  module: "target_module_id",
  class: "target_class_id",
  relation: "target_relation_id",
  attribute: "target_attribute_id",
  relation_attribute: "target_relation_attribute_id",
  cq: "target_cq_id",
} as const
function recordType(
  type: OntologyMetadataTarget["type"] | OntologyExampleTarget["type"]
) {
  switch (type) {
    case "ontology":
      return "ontology_documents" as const
    case "module":
      return "ontology_modules" as const
    case "class":
      return "ontology_classes" as const
    case "relation":
      return "ontology_relations" as const
    case "attribute":
      return "ontology_attributes" as const
    case "relation_attribute":
      return "ontology_relation_attributes" as const
    case "cq":
      return "ontology_competency_questions" as const
  }
}
export async function getOntologyNotes(
  target: OntologyMetadataTarget
): Promise<OntologyNote[]> {
  const db = getDb()
  await assertOntologyRecordAccess(recordType(target.type), target.id, db)
  return db
    .select()
    .from(ontologyNotes)
    .where(eq(ontologyNotes[TARGET_COLUMN[target.type]], target.id))
    .orderBy(asc(ontologyNotes.sort_order))
}
export async function getOntologyLocalizedTexts(
  target: OntologyMetadataTarget
): Promise<OntologyLocalizedText[]> {
  const db = getDb()
  await assertOntologyRecordAccess(recordType(target.type), target.id, db)
  return db
    .select()
    .from(ontologyLocalizedTexts)
    .where(eq(ontologyLocalizedTexts[TARGET_COLUMN[target.type]], target.id))
    .orderBy(asc(ontologyLocalizedTexts.field_name))
}
export async function getOntologyExamples(
  target: OntologyExampleTarget
): Promise<OntologyExample[]> {
  const db = getDb()
  await assertOntologyRecordAccess(recordType(target.type), target.id, db)
  return db
    .select()
    .from(ontologyExamples)
    .where(eq(ontologyExamples[TARGET_COLUMN[target.type]], target.id))
    .orderBy(asc(ontologyExamples.sort_order))
}
export async function getOntologyNotesByOntology(
  ontologyId: string
): Promise<OntologyNote[]> {
  const db = getDb()
  await assertOntologyDocumentAccess(ontologyId, db)
  return db
    .select()
    .from(ontologyNotes)
    .where(eq(ontologyNotes.ontology_id, ontologyId))
    .orderBy(asc(ontologyNotes.sort_order))
}
export async function getOntologyLocalizedTextsByOntology(
  ontologyId: string
): Promise<OntologyLocalizedText[]> {
  const db = getDb()
  await assertOntologyDocumentAccess(ontologyId, db)
  return db
    .select()
    .from(ontologyLocalizedTexts)
    .where(eq(ontologyLocalizedTexts.ontology_id, ontologyId))
    .orderBy(asc(ontologyLocalizedTexts.field_name))
}
export async function getOntologyExamplesByOntology(
  ontologyId: string
): Promise<OntologyExample[]> {
  const db = getDb()
  await assertOntologyDocumentAccess(ontologyId, db)
  return db
    .select()
    .from(ontologyExamples)
    .where(eq(ontologyExamples.ontology_id, ontologyId))
    .orderBy(asc(ontologyExamples.sort_order))
}
export async function getInstanceCandidateExamples(
  target: OntologyExampleCandidateTarget
): Promise<OntologyExample[]> {
  const db = getDb()
  await assertOntologyRecordAccess(recordType(target.type), target.id, db)
  return db
    .select()
    .from(ontologyExamples)
    .where(
      and(
        eq(ontologyExamples[TARGET_COLUMN[target.type]], target.id),
        eq(ontologyExamples.is_instance_candidate, true)
      )
    )
    .orderBy(asc(ontologyExamples.sort_order))
}
function resolveImpactRoles(
  cq: Pick<
    OntologyCompetencyQuestion,
    "subject_example_id" | "predicate_example_id" | "object_example_id"
  >,
  exampleId: string
): OntologyExampleImpactRole[] {
  return [
    cq.subject_example_id === exampleId ? "subject" : null,
    cq.predicate_example_id === exampleId ? "predicate" : null,
    cq.object_example_id === exampleId ? "object" : null,
  ].filter((role): role is OntologyExampleImpactRole => role !== null)
}
export async function getAffectedCompetencyQuestionsForExample(
  exampleId: string
): Promise<OntologyExampleImpact[]> {
  const db = getDb()
  await assertOntologyRecordAccess("ontology_examples", exampleId, db)
  const rows = await db
    .select({
      id: ontologyCompetencyQuestions.id,
      question: ontologyCompetencyQuestions.question,
      subject_example_id: ontologyCompetencyQuestions.subject_example_id,
      predicate_example_id: ontologyCompetencyQuestions.predicate_example_id,
      object_example_id: ontologyCompetencyQuestions.object_example_id,
    })
    .from(ontologyCompetencyQuestions)
    .where(
      or(
        eq(ontologyCompetencyQuestions.subject_example_id, exampleId),
        eq(ontologyCompetencyQuestions.predicate_example_id, exampleId),
        eq(ontologyCompetencyQuestions.object_example_id, exampleId)
      )
    )
    .orderBy(asc(ontologyCompetencyQuestions.sort_order))
  return rows.map((cq) => ({
    id: cq.id,
    question: cq.question,
    roles: resolveImpactRoles(cq, exampleId),
  }))
}
