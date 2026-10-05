export function describeCQ(cq: { id?: string; question?: string | null }) {
  return cq.question?.trim() || cq.id || "Untitled competency question"
}

export function buildMissingParentWarning(
  className: string,
  parentClassId: string
) {
  return `Imported class "${className}" without parent because "${parentClassId}" is missing from the uploaded ontology JSON.`
}

export function buildMissingRelationWarning(relationName: string) {
  return `Skipped relation "${relationName}" because it references unknown classes in the uploaded ontology JSON.`
}
