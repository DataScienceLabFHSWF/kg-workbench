import type {
  ImportCompetencyQuestion,
  ImportExample,
  ImportNote,
} from "@/features/ontology/schemas/import"

import { appendLiteralElement } from "../rdf"

function createTargetKey(targetType: string, targetId: string) {
  return `${targetType}:${targetId}`
}

export function buildNoteMap(notes: ImportNote[]) {
  const noteMap = new Map<string, ImportNote[]>()

  for (const note of notes) {
    const key = createTargetKey(note.targetType, note.targetId)
    const current = noteMap.get(key)
    if (current) {
      current.push(note)
    } else {
      noteMap.set(key, [note])
    }
  }

  return noteMap
}

export function buildExampleMap(examples: ImportExample[]) {
  const exampleMap = new Map<string, ImportExample[]>()

  for (const example of examples) {
    const key = createTargetKey(example.targetType, example.targetId)
    const current = exampleMap.get(key)
    if (current) {
      current.push(example)
    } else {
      exampleMap.set(key, [example])
    }
  }

  return exampleMap
}

export function getTargetItems<T>(
  targetMap: Map<string, T[]>,
  targetType: string,
  targetId: string
) {
  return targetMap.get(createTargetKey(targetType, targetId)) ?? []
}

export function appendNoteAnnotations(
  lines: string[],
  notes: ImportNote[],
  indent = "    "
) {
  for (const note of notes) {
    const value = note.authorName?.trim()
      ? `${note.authorName.trim()}: ${note.body}`
      : note.body
    appendLiteralElement(lines, indent, "kg:note", value)
  }
}

export function appendExampleAnnotations(
  lines: string[],
  examples: ImportExample[],
  indent = "    "
) {
  for (const example of examples) {
    appendLiteralElement(lines, indent, "kg:example", example.value)
  }
}

export function buildCQPattern(cq: ImportCompetencyQuestion) {
  const parts = [
    cq.subjectClassId ? `subject=${cq.subjectClassId}` : null,
    cq.predicateRelationId ? `predicate=${cq.predicateRelationId}` : null,
    cq.objectClassId ? `object=${cq.objectClassId}` : null,
    cq.subjectExampleId ? `subjectExample=${cq.subjectExampleId}` : null,
    cq.predicateExampleId ? `predicateExample=${cq.predicateExampleId}` : null,
    cq.objectExampleId ? `objectExample=${cq.objectExampleId}` : null,
  ].filter(Boolean)

  return parts.join("; ")
}
