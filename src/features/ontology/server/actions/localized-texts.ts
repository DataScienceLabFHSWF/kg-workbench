"use server"
import { and, eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import type {
  OntologyLocalizedText,
  OntologyLocalizedTextInsert,
} from "@/domain/ontology"
import type { OntologyMetadataTarget } from "@/features/ontology/server/queries"
import { routes } from "@/lib/routes"
import {
  assertOntologyDocumentAccess,
  assertOntologyRecordAccess,
} from "@/server/group-access"
import { getDb } from "@/server/database"
import { ontologyLocalizedTexts } from "@/server/db/schema"
type LocalizedTextTargetFields = Pick<
  OntologyLocalizedTextInsert,
  | "target_ontology_id"
  | "target_module_id"
  | "target_class_id"
  | "target_relation_id"
  | "target_attribute_id"
  | "target_relation_attribute_id"
  | "target_cq_id"
>
const TARGET_COLUMN = {
  ontology: "target_ontology_id",
  module: "target_module_id",
  class: "target_class_id",
  relation: "target_relation_id",
  attribute: "target_attribute_id",
  relation_attribute: "target_relation_attribute_id",
  cq: "target_cq_id",
} as const
function targetFields(
  target: OntologyMetadataTarget
): LocalizedTextTargetFields {
  switch (target.type) {
    case "ontology":
      return { target_ontology_id: target.id }
    case "module":
      return { target_module_id: target.id }
    case "class":
      return { target_class_id: target.id }
    case "relation":
      return { target_relation_id: target.id }
    case "attribute":
      return { target_attribute_id: target.id }
    case "relation_attribute":
      return { target_relation_attribute_id: target.id }
    case "cq":
      return { target_cq_id: target.id }
  }
}
function recordType(type: OntologyMetadataTarget["type"]) {
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
export async function upsertLocalizedText(
  ontologyId: string,
  target: OntologyMetadataTarget,
  fieldName: string,
  languageCode: string,
  value: string
): Promise<OntologyLocalizedText> {
  const db = getDb()
  await assertOntologyDocumentAccess(ontologyId, db)
  await assertOntologyRecordAccess(recordType(target.type), target.id, db)
  const targetColumn = ontologyLocalizedTexts[TARGET_COLUMN[target.type]]
  const [existing] = await db
    .select({ id: ontologyLocalizedTexts.id })
    .from(ontologyLocalizedTexts)
    .where(
      and(
        eq(targetColumn, target.id),
        eq(ontologyLocalizedTexts.field_name, fieldName),
        eq(ontologyLocalizedTexts.language_code, languageCode)
      )
    )
    .limit(1)
  const [row] = existing
    ? await db
        .update(ontologyLocalizedTexts)
        .set({ value })
        .where(eq(ontologyLocalizedTexts.id, existing.id))
        .returning()
    : await db
        .insert(ontologyLocalizedTexts)
        .values({
          ontology_id: ontologyId,
          field_name: fieldName,
          language_code: languageCode,
          value,
          ...targetFields(target),
        })
        .returning()
  if (!row) throw new Error("Could not save localized text.")
  revalidatePath(routes.ontology.root)
  return row
}
export async function deleteLocalizedText(id: string): Promise<void> {
  const db = getDb()
  await assertOntologyRecordAccess("ontology_localized_texts", id, db)
  await db
    .delete(ontologyLocalizedTexts)
    .where(eq(ontologyLocalizedTexts.id, id))
  revalidatePath(routes.ontology.root)
}
