import type {
  ImportCompetencyQuestion,
  ImportExample,
  ImportNote,
  ImportRelation,
} from "@/features/ontology/schemas/import"

import { claimUniqueIriSegment, joinOwlIri } from "../iri"
import {
  appendLiteralElement,
  appendResourceElement,
  escapeXmlAttribute,
} from "../rdf"
import { appendAnnotationValues } from "./localized-texts"
import {
  appendExampleAnnotations,
  buildCQPattern,
  appendNoteAnnotations,
  getTargetItems,
} from "./metadata"
import type { ClassMap, RelationEntry, RelationMap } from "./types"

export function createRelationEntries(
  relations: ImportRelation[],
  baseIri: string
) {
  const usedSegments = new Set<string>()

  return relations.map<RelationEntry>((relation, index) => {
    const stableId = relation.id ?? `relation-${index + 1}`
    const segment = claimUniqueIriSegment({
      fallback: `relation-${index + 1}`,
      name: relation.name,
      stableId,
      usedSegments,
    })
    const iri = joinOwlIri(baseIri, segment)
    const inverseSegment = relation.inverseName?.trim()
      ? claimUniqueIriSegment({
          fallback: `${segment}-inverse`,
          name: relation.inverseName,
          stableId: `${stableId}-inverse`,
          usedSegments,
        })
      : null

    return {
      relation,
      segment,
      iri,
      inverseIri: inverseSegment ? joinOwlIri(baseIri, inverseSegment) : null,
    }
  })
}

function appendObjectProperty({
  classById,
  comment,
  defaultLanguage,
  domainId,
  inverseIri,
  iri,
  label,
  labelFieldName = "name",
  lines,
  localizedTextMap,
  noteMap,
  rangeId,
  relationId,
  exampleMap,
  competencyQuestions,
}: {
  classById: ClassMap
  comment?: string
  defaultLanguage: string
  domainId: string
  inverseIri?: string
  iri: string
  label: string
  labelFieldName?: "inverseName" | "name"
  lines: string[]
  localizedTextMap: Map<string, string>
  noteMap: Map<string, ImportNote[]>
  rangeId: string
  relationId: string
  exampleMap: Map<string, ImportExample[]>
  competencyQuestions: ImportCompetencyQuestion[]
}) {
  const domain = classById.get(domainId)
  const range = classById.get(rangeId)
  if (!domain || !range) return

  lines.push(`  <owl:ObjectProperty rdf:about="${escapeXmlAttribute(iri)}">`)
  appendAnnotationValues({
    canonicalValue: label,
    defaultLanguage,
    fieldName: labelFieldName,
    lines,
    localizedTextMap,
    tagName: "rdfs:label",
    targetId: relationId,
    targetType: "relation",
  })
  appendAnnotationValues({
    canonicalValue: comment,
    defaultLanguage,
    fieldName: "description",
    lines,
    localizedTextMap,
    tagName: "rdfs:comment",
    targetId: relationId,
    targetType: "relation",
  })
  appendResourceElement(lines, "    ", "rdfs:domain", domain.iri)
  appendResourceElement(lines, "    ", "rdfs:range", range.iri)
  appendLiteralElement(lines, "    ", "kg:domainModule", domain.cls.module)
  appendLiteralElement(lines, "    ", "kg:rangeModule", range.cls.module)
  appendNoteAnnotations(lines, getTargetItems(noteMap, "relation", relationId))
  appendExampleAnnotations(
    lines,
    getTargetItems(exampleMap, "relation", relationId)
  )
  for (const cq of competencyQuestions) {
    appendAnnotationValues({
      canonicalValue: cq.question,
      defaultLanguage,
      fieldName: "question",
      lines,
      localizedTextMap,
      tagName: "kg:competencyQuestion",
      targetId: cq.id ?? cq.question,
      targetType: "cq",
    })
    appendLiteralElement(
      lines,
      "    ",
      "kg:competencyQuestionPattern",
      buildCQPattern(cq)
    )
  }
  if (inverseIri) {
    appendResourceElement(lines, "    ", "owl:inverseOf", inverseIri)
  }
  lines.push("  </owl:ObjectProperty>")
}

export function appendRelations({
  classById,
  defaultLanguage,
  lines,
  localizedTextMap,
  noteMap,
  relationEntries,
  exampleMap,
  filterCompetencyQuestions,
}: {
  classById: ClassMap
  defaultLanguage: string
  lines: string[]
  localizedTextMap: Map<string, string>
  noteMap: Map<string, ImportNote[]>
  relationEntries: RelationEntry[]
  exampleMap: Map<string, ImportExample[]>
  filterCompetencyQuestions: (relationId: string) => ImportCompetencyQuestion[]
}) {
  for (const entry of relationEntries) {
    appendObjectProperty({
      classById,
      comment: entry.relation.description,
      defaultLanguage,
      domainId: entry.relation.domainClassId,
      inverseIri: entry.inverseIri ?? undefined,
      iri: entry.iri,
      label: entry.relation.name,
      lines,
      localizedTextMap,
      noteMap,
      rangeId: entry.relation.rangeClassId,
      relationId: entry.relation.id ?? entry.relation.name,
      exampleMap,
      competencyQuestions: filterCompetencyQuestions(
        entry.relation.id ?? entry.relation.name
      ),
    })

    if (!entry.inverseIri || !entry.relation.inverseName?.trim()) continue

    appendObjectProperty({
      classById,
      defaultLanguage,
      domainId: entry.relation.rangeClassId,
      inverseIri: entry.iri,
      iri: entry.inverseIri,
      label: entry.relation.inverseName,
      labelFieldName: "inverseName",
      lines,
      localizedTextMap,
      noteMap,
      rangeId: entry.relation.domainClassId,
      relationId: entry.relation.id ?? entry.relation.name,
      exampleMap,
      competencyQuestions: filterCompetencyQuestions(
        entry.relation.id ?? entry.relation.name
      ),
    })
  }
}

export function buildRelationMap(
  relationEntries: RelationEntry[]
): RelationMap {
  return new Map(
    relationEntries.map((entry) => [entry.relation.id ?? entry.iri, entry])
  )
}
