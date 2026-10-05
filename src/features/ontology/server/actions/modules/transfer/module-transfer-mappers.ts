import type { ModuleTransfer } from "@/features/ontology/schemas/module-transfer"

export function describeCQ(cq: { id?: string; question?: string | null }) {
  return cq.question?.trim() || cq.id || "Untitled competency question"
}

export function buildExportExample(example: {
  id: string
  is_instance_candidate: boolean
  object_label: string | null
  predicate_label: string | null
  sort_order: number
  subject_label: string | null
  target_attribute_id: string | null
  target_class_id: string | null
  target_cq_id: string | null
  target_relation_attribute_id: string | null
  target_relation_id: string | null
  value: string
}) {
  return {
    id: example.id,
    targetType: example.target_class_id
      ? "class"
      : example.target_attribute_id
        ? "attribute"
        : example.target_relation_id
          ? "relation"
          : example.target_relation_attribute_id
            ? "relation_attribute"
            : "cq",
    targetId:
      example.target_class_id ??
      example.target_attribute_id ??
      example.target_relation_id ??
      example.target_relation_attribute_id ??
      example.target_cq_id ??
      "",
    value: example.value,
    subjectLabel: example.subject_label,
    predicateLabel: example.predicate_label,
    objectLabel: example.object_label,
    isInstanceCandidate: example.is_instance_candidate,
    sortOrder: example.sort_order,
  } as const
}

export function buildExportNote(note: {
  author_name: string
  body: string
  id: string
  sort_order: number
  target_attribute_id: string | null
  target_class_id: string | null
  target_cq_id: string | null
  target_module_id: string | null
  target_relation_attribute_id: string | null
  target_relation_id: string | null
}) {
  return {
    id: note.id,
    targetType: note.target_module_id
      ? "module"
      : note.target_class_id
        ? "class"
        : note.target_relation_id
          ? "relation"
          : note.target_attribute_id
            ? "attribute"
            : note.target_relation_attribute_id
              ? "relation_attribute"
              : "cq",
    targetId:
      note.target_module_id ??
      note.target_class_id ??
      note.target_relation_id ??
      note.target_attribute_id ??
      note.target_relation_attribute_id ??
      note.target_cq_id ??
      "",
    body: note.body,
    authorName: note.author_name,
    sortOrder: note.sort_order,
  } as const
}

export function buildExportLocalizedText(text: {
  field_name: string
  language_code: string
  target_attribute_id: string | null
  target_class_id: string | null
  target_cq_id: string | null
  target_module_id: string | null
  target_relation_attribute_id: string | null
  target_relation_id: string | null
  value: string
}): ModuleTransfer["localizedTexts"][number] {
  return {
    targetType: text.target_module_id
      ? "module"
      : text.target_class_id
        ? "class"
        : text.target_relation_id
          ? "relation"
          : text.target_attribute_id
            ? "attribute"
            : text.target_relation_attribute_id
              ? "relation_attribute"
              : "cq",
    targetId:
      text.target_module_id ??
      text.target_class_id ??
      text.target_relation_id ??
      text.target_attribute_id ??
      text.target_relation_attribute_id ??
      text.target_cq_id ??
      "",
    fieldName: text.field_name,
    languageCode: text.language_code,
    value: text.value,
  }
}
