import type {
  ImportCompetencyQuestion,
  ImportExample,
  ImportNote,
  ImportOntology,
} from "@/features/ontology/schemas/import"
import { getOntologyDataTypeIri } from "@/features/ontology/utils/data-types"

import { claimUniqueIriSegment, joinOwlIri } from "../iri"
import {
  appendLiteralElement,
  appendResourceElement,
  escapeXmlAttribute,
  KG_NS,
} from "../rdf"
import { appendAnnotationValues } from "./localized-texts"
import {
  appendExampleAnnotations,
  buildCQPattern,
  appendNoteAnnotations,
  getTargetItems,
} from "./metadata"
import type { ClassEntry, ClassMap, ImportAttribute } from "./types"

export function createClassEntries(ontology: ImportOntology, baseIri: string) {
  const usedSegments = new Set<string>()
  return ontology.classes.map<ClassEntry>((cls, index) => {
    const segment = claimUniqueIriSegment({
      fallback: `Class-${index + 1}`,
      name: cls.name,
      stableId: cls.id,
      usedSegments,
    })

    return { cls, segment, iri: joinOwlIri(baseIri, segment) }
  })
}

export function appendAnnotationProperties(lines: string[]) {
  lines.push(`  <owl:AnnotationProperty rdf:about="${KG_NS}module"/>`)
  lines.push(`  <owl:AnnotationProperty rdf:about="${KG_NS}domainModule"/>`)
  lines.push(`  <owl:AnnotationProperty rdf:about="${KG_NS}rangeModule"/>`)
  lines.push(`  <owl:AnnotationProperty rdf:about="${KG_NS}note"/>`)
  lines.push(`  <owl:AnnotationProperty rdf:about="${KG_NS}example"/>`)
  lines.push(`  <owl:AnnotationProperty rdf:about="${KG_NS}required"/>`)
  lines.push(`  <owl:AnnotationProperty rdf:about="${KG_NS}attributeOf"/>`)
  lines.push(
    `  <owl:AnnotationProperty rdf:about="${KG_NS}competencyQuestion"/>`
  )
  lines.push(
    `  <owl:AnnotationProperty rdf:about="${KG_NS}competencyQuestionPattern"/>`
  )
}

export function appendClass(
  lines: string[],
  entry: ClassEntry,
  classById: ClassMap,
  localizedTextMap: Map<string, string>,
  defaultLanguage: string,
  noteMap: Map<string, ImportNote[]>,
  exampleMap: Map<string, ImportExample[]>,
  competencyQuestions: ImportCompetencyQuestion[]
) {
  lines.push(`  <owl:Class rdf:about="${escapeXmlAttribute(entry.iri)}">`)
  appendAnnotationValues({
    canonicalValue: entry.cls.name,
    defaultLanguage,
    fieldName: "name",
    lines,
    localizedTextMap,
    tagName: "rdfs:label",
    targetId: entry.cls.id,
    targetType: "class",
  })
  appendAnnotationValues({
    canonicalValue: entry.cls.description,
    defaultLanguage,
    fieldName: "description",
    lines,
    localizedTextMap,
    tagName: "rdfs:comment",
    targetId: entry.cls.id,
    targetType: "class",
  })
  appendLiteralElement(lines, "    ", "kg:module", entry.cls.module)
  appendNoteAnnotations(lines, getTargetItems(noteMap, "class", entry.cls.id))
  appendExampleAnnotations(
    lines,
    getTargetItems(exampleMap, "class", entry.cls.id)
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

  const parent = entry.cls.parentClassId
    ? classById.get(entry.cls.parentClassId)
    : null
  if (parent) {
    appendResourceElement(lines, "    ", "rdfs:subClassOf", parent.iri)
  }

  lines.push("  </owl:Class>")
}

function appendAttribute(
  lines: string[],
  classEntry: ClassEntry,
  attribute: ImportAttribute,
  index: number,
  usedSegments: Set<string>,
  baseIri: string,
  localizedTextMap: Map<string, string>,
  defaultLanguage: string,
  noteMap: Map<string, ImportNote[]>,
  exampleMap: Map<string, ImportExample[]>
) {
  const segment = claimUniqueIriSegment({
    fallback: `attribute-${index + 1}`,
    name: attribute.name,
    stableId: attribute.id,
    usedSegments,
  })
  const iri = joinOwlIri(baseIri, classEntry.segment, segment)
  const datatypeIri = getOntologyDataTypeIri(attribute.dataType)

  if (!datatypeIri) {
    throw new Error(`Unsupported ontology datatype: ${attribute.dataType}`)
  }

  lines.push(`  <owl:DatatypeProperty rdf:about="${escapeXmlAttribute(iri)}">`)
  appendAnnotationValues({
    canonicalValue: attribute.name,
    defaultLanguage,
    fieldName: "name",
    lines,
    localizedTextMap,
    tagName: "rdfs:label",
    targetId: attribute.id ?? `${classEntry.cls.id}:${index}`,
    targetType: "attribute",
  })
  appendAnnotationValues({
    canonicalValue: attribute.description,
    defaultLanguage,
    fieldName: "description",
    lines,
    localizedTextMap,
    tagName: "rdfs:comment",
    targetId: attribute.id ?? `${classEntry.cls.id}:${index}`,
    targetType: "attribute",
  })
  appendResourceElement(lines, "    ", "rdfs:domain", classEntry.iri)
  appendResourceElement(lines, "    ", "rdfs:range", datatypeIri)
  appendLiteralElement(lines, "    ", "kg:module", classEntry.cls.module)
  appendLiteralElement(
    lines,
    "    ",
    "kg:required",
    attribute.required ? "true" : "false"
  )
  appendNoteAnnotations(
    lines,
    getTargetItems(
      noteMap,
      "attribute",
      attribute.id ?? `${classEntry.cls.id}:${index}`
    )
  )
  appendExampleAnnotations(
    lines,
    getTargetItems(
      exampleMap,
      "attribute",
      attribute.id ?? `${classEntry.cls.id}:${index}`
    )
  )
  lines.push("  </owl:DatatypeProperty>")
}

export function appendAttributes(
  lines: string[],
  classEntries: ClassEntry[],
  baseIri: string,
  localizedTextMap: Map<string, string>,
  defaultLanguage: string,
  noteMap: Map<string, ImportNote[]>,
  exampleMap: Map<string, ImportExample[]>
) {
  for (const classEntry of classEntries) {
    const usedSegments = new Set<string>()
    classEntry.cls.attributes.forEach((attribute, index) => {
      appendAttribute(
        lines,
        classEntry,
        attribute,
        index,
        usedSegments,
        baseIri,
        localizedTextMap,
        defaultLanguage,
        noteMap,
        exampleMap
      )
    })
  }
}
