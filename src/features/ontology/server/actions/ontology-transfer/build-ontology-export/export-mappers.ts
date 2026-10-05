import type {
  ImportExample,
  ImportNote,
} from "@/features/ontology/schemas/import"

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
}): ImportExample {
  const targetType = example.target_class_id
    ? "class"
    : example.target_attribute_id
      ? "attribute"
      : example.target_relation_id
        ? "relation"
        : example.target_relation_attribute_id
          ? "relation_attribute"
          : "cq"
  const targetId =
    example.target_class_id ??
    example.target_attribute_id ??
    example.target_relation_id ??
    example.target_relation_attribute_id ??
    example.target_cq_id ??
    ""

  return {
    id: example.id,
    targetType,
    targetId,
    value: example.value,
    subjectLabel: example.subject_label,
    predicateLabel: example.predicate_label,
    objectLabel: example.object_label,
    isInstanceCandidate: example.is_instance_candidate,
    sortOrder: example.sort_order,
  }
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
  target_ontology_id: string | null
  target_relation_attribute_id: string | null
  target_relation_id: string | null
}): ImportNote {
  const targetType = note.target_ontology_id
    ? "ontology"
    : note.target_module_id
      ? "module"
      : note.target_class_id
        ? "class"
        : note.target_relation_id
          ? "relation"
          : note.target_attribute_id
            ? "attribute"
            : note.target_relation_attribute_id
              ? "relation_attribute"
              : "cq"
  const targetId =
    note.target_ontology_id ??
    note.target_module_id ??
    note.target_class_id ??
    note.target_relation_id ??
    note.target_attribute_id ??
    note.target_relation_attribute_id ??
    note.target_cq_id ??
    ""

  return {
    id: note.id,
    targetType,
    targetId,
    body: note.body,
    authorName: note.author_name,
    sortOrder: note.sort_order,
  }
}
