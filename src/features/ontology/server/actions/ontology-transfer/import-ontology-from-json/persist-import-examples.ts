import { eq } from "drizzle-orm"
import type { ImportOntology } from "@/features/ontology/schemas/import"
import {
  ontologyCompetencyQuestions,
  ontologyExamples,
} from "@/server/db/schema"
import type {
  ImportIdMaps,
  PendingCQExampleRef,
  ServerClient,
} from "./shared-types"
import { resolveExampleInsert } from "./resolve-import-inserts"
export async function persistImportExamples({
  db,
  ontologyId,
  parsed,
  idMaps,
  pendingCQExampleRefs,
  warnings,
}: {
  db: ServerClient
  ontologyId: string
  parsed: ImportOntology
  idMaps: ImportIdMaps
  pendingCQExampleRefs: PendingCQExampleRef[]
  warnings: string[]
}) {
  const exampleMap = new Map<string, string>()
  for (const example of parsed.examples) {
    const insert = resolveExampleInsert({
      example,
      ontologyId,
      warnings,
      ...idMaps,
    })
    if (!insert) continue
    const [row] = await db.insert(ontologyExamples).values(insert).returning()
    if (!row) throw new Error("Could not save example.")
    if (example.id) exampleMap.set(example.id, row.id)
  }
  for (const pending of pendingCQExampleRefs) {
    const subject = pending.subjectExampleId
        ? (exampleMap.get(pending.subjectExampleId) ?? null)
        : null,
      predicate = pending.predicateExampleId
        ? (exampleMap.get(pending.predicateExampleId) ?? null)
        : null,
      object = pending.objectExampleId
        ? (exampleMap.get(pending.objectExampleId) ?? null)
        : null
    if (pending.subjectExampleId && !subject)
      warnings.push(
        `Cleared subject example on competency question "${pending.label}" because "${pending.subjectExampleId}" was not imported.`
      )
    if (pending.predicateExampleId && !predicate)
      warnings.push(
        `Cleared predicate example on competency question "${pending.label}" because "${pending.predicateExampleId}" was not imported.`
      )
    if (pending.objectExampleId && !object)
      warnings.push(
        `Cleared object example on competency question "${pending.label}" because "${pending.objectExampleId}" was not imported.`
      )
    await db
      .update(ontologyCompetencyQuestions)
      .set({
        subject_example_id: subject,
        predicate_example_id: predicate,
        object_example_id: object,
      })
      .where(eq(ontologyCompetencyQuestions.id, pending.cqId))
  }
}
