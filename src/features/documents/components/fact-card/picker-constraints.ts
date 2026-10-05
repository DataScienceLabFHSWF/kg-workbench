import type { PickerConstraintCopy } from "@/components/shared/class-picker/types"
import type { DocumentOntology, FactWithAnchors } from "../../server/queries"

interface FactPickerConstraintInput {
  fact: FactWithAnchors
  classes: DocumentOntology["classes"]
  relations: DocumentOntology["relations"]
}

interface FactPickerConstraintState {
  subjectConstraintCopy?: PickerConstraintCopy
  relationConstraintCopy?: PickerConstraintCopy
  objectConstraintCopy?: PickerConstraintCopy
}

export function getFactPickerConstraintState({
  fact,
  classes,
  relations,
}: FactPickerConstraintInput): FactPickerConstraintState {
  const classNameById = new Map(classes.map((cls) => [cls.id, cls.name]))
  const relationNameById = new Map(
    relations.map((relation) => [relation.id, relation.name])
  )

  const subjectSelection = fact.subject_class_id
    ? describeStructuredSelection(
        "subject",
        fact.subject_text,
        classNameById.get(fact.subject_class_id) ?? null
      )
    : null

  const relationSelection = fact.relation_type_id
    ? describeStructuredSelection(
        "relation",
        fact.relation_text,
        relationNameById.get(fact.relation_type_id) ?? null
      )
    : null

  const objectSelection = fact.object_class_id
    ? describeStructuredSelection(
        "object",
        fact.object_text,
        classNameById.get(fact.object_class_id) ?? null
      )
    : null

  return {
    subjectConstraintCopy: relationSelection
      ? buildConstraintCopy([relationSelection])
      : objectSelection
        ? buildConstraintCopy([objectSelection])
        : undefined,
    relationConstraintCopy: buildConstraintCopy(
      [subjectSelection, objectSelection].filter(
        (
          value
        ): value is NonNullable<
          ReturnType<typeof describeStructuredSelection>
        > => value !== null
      )
    ),
    objectConstraintCopy: relationSelection
      ? buildConstraintCopy([relationSelection])
      : subjectSelection
        ? buildConstraintCopy([subjectSelection])
        : undefined,
  }
}

function describeStructuredSelection(
  kind: "subject" | "relation" | "object",
  text: string,
  mappedName: string | null
) {
  return {
    kind,
    text: text.trim() || "this value",
    mappedName,
  }
}

function buildConstraintCopy(
  selections: NonNullable<ReturnType<typeof describeStructuredSelection>>[]
): PickerConstraintCopy | undefined {
  if (selections.length === 0) return undefined

  return {
    selections,
  }
}
