"use server"
import { asc, desc, eq, inArray } from "drizzle-orm"
import { normalizeOntologyDataTypeOrDefault } from "@/features/ontology/utils/data-types"
import {
  assertDocumentAccess,
  assertOntologyDocumentAccess,
} from "@/server/group-access"
import { getDb } from "@/server/database"
import {
  extractionRuns,
  ontologyAttributes,
  ontologyClasses,
  ontologyCompetencyQuestionModules,
  ontologyCompetencyQuestions,
  ontologyExamples,
  ontologyModules,
  ontologyRelationAttributes,
  ontologyRelations,
} from "@/server/db/schema"
import type { DocumentOntology } from "./types"
export async function getOntologyForDocument(
  documentId: string
): Promise<DocumentOntology> {
  const db = getDb()
  await assertDocumentAccess(documentId, db)
  const [run] = await db
    .select({ ontology_id: extractionRuns.ontology_id })
    .from(extractionRuns)
    .where(eq(extractionRuns.document_id, documentId))
    .orderBy(desc(extractionRuns.completed_at))
    .limit(1)
  if (!run?.ontology_id)
    return {
      classes: [],
      relations: [],
      modules: [],
      attributes: [],
      relationAttributes: [],
      cqs: [],
      examples: [],
    }
  await assertOntologyDocumentAccess(run.ontology_id, db)
  const [classes, relations, modules, cqs] = await Promise.all([
    db
      .select({
        id: ontologyClasses.id,
        name: ontologyClasses.name,
        module_id: ontologyClasses.module_id,
      })
      .from(ontologyClasses)
      .where(eq(ontologyClasses.ontology_id, run.ontology_id))
      .orderBy(asc(ontologyClasses.name)),
    db
      .select({
        id: ontologyRelations.id,
        name: ontologyRelations.name,
        domain_class_id: ontologyRelations.domain_class_id,
        range_class_id: ontologyRelations.range_class_id,
      })
      .from(ontologyRelations)
      .where(eq(ontologyRelations.ontology_id, run.ontology_id))
      .orderBy(asc(ontologyRelations.name)),
    db
      .select({ id: ontologyModules.id, name: ontologyModules.name })
      .from(ontologyModules)
      .where(eq(ontologyModules.ontology_id, run.ontology_id))
      .orderBy(asc(ontologyModules.name)),
    db
      .select()
      .from(ontologyCompetencyQuestions)
      .where(eq(ontologyCompetencyQuestions.ontology_id, run.ontology_id))
      .orderBy(asc(ontologyCompetencyQuestions.sort_order)),
  ])
  const classIds = classes.map((cls) => cls.id),
    relationIds = relations.map((relation) => relation.id),
    exampleIds = [
      ...new Set(
        cqs.flatMap((cq) =>
          [
            cq.subject_example_id,
            cq.predicate_example_id,
            cq.object_example_id,
          ].filter((id): id is string => Boolean(id))
        )
      ),
    ]
  const [attributes, relationAttributes, examples, links] = await Promise.all([
    classIds.length
      ? db
          .select({
            id: ontologyAttributes.id,
            name: ontologyAttributes.name,
            data_type: ontologyAttributes.data_type,
            class_id: ontologyAttributes.class_id,
            required: ontologyAttributes.required,
          })
          .from(ontologyAttributes)
          .where(inArray(ontologyAttributes.class_id, classIds))
          .orderBy(asc(ontologyAttributes.name))
      : [],
    relationIds.length
      ? db
          .select()
          .from(ontologyRelationAttributes)
          .where(inArray(ontologyRelationAttributes.relation_id, relationIds))
          .orderBy(asc(ontologyRelationAttributes.sort_order))
      : [],
    exampleIds.length
      ? db
          .select({ id: ontologyExamples.id, value: ontologyExamples.value })
          .from(ontologyExamples)
          .where(inArray(ontologyExamples.id, exampleIds))
          .orderBy(asc(ontologyExamples.sort_order))
      : [],
    cqs.length
      ? db
          .select({
            cq_id: ontologyCompetencyQuestionModules.cq_id,
            module: { id: ontologyModules.id, name: ontologyModules.name },
          })
          .from(ontologyCompetencyQuestionModules)
          .innerJoin(
            ontologyModules,
            eq(ontologyCompetencyQuestionModules.module_id, ontologyModules.id)
          )
          .where(
            inArray(
              ontologyCompetencyQuestionModules.cq_id,
              cqs.map((cq) => cq.id)
            )
          )
      : [],
  ])
  const modulesByCq = new Map<string, { id: string; name: string }[]>()
  for (const link of links) {
    const values = modulesByCq.get(link.cq_id) ?? []
    values.push(link.module)
    modulesByCq.set(link.cq_id, values)
  }
  return {
    classes,
    relations,
    modules,
    attributes: attributes.map((attribute) => ({
      id: attribute.id,
      name: attribute.name,
      dataType: normalizeOntologyDataTypeOrDefault(attribute.data_type),
      classId: attribute.class_id,
      required: attribute.required ?? false,
    })),
    relationAttributes: relationAttributes.map((attribute) => ({
      id: attribute.id,
      relationId: attribute.relation_id,
      name: attribute.name,
      dataType: normalizeOntologyDataTypeOrDefault(attribute.data_type),
      description: attribute.description,
      required: attribute.required,
      sortOrder: attribute.sort_order,
    })),
    cqs: cqs.map((cq) => ({
      id: cq.id,
      question: cq.question,
      sortOrder: cq.sort_order,
      subjectClassId: cq.subject_class_id,
      predicateRelationId: cq.predicate_relation_id,
      objectClassId: cq.object_class_id,
      subjectExampleId: cq.subject_example_id,
      predicateExampleId: cq.predicate_example_id,
      objectExampleId: cq.object_example_id,
      modules: modulesByCq.get(cq.id) ?? [],
    })),
    examples,
  }
}
export async function fetchOntologyForDocument(documentId: string) {
  return getOntologyForDocument(documentId)
}
