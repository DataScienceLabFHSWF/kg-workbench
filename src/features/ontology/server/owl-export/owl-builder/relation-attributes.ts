import type { ImportOntology } from "@/features/ontology/schemas/import"
import { getOntologyDataTypeIri } from "@/features/ontology/utils/data-types"

import { claimUniqueIriSegment, joinOwlIri } from "../iri"
import {
  appendLiteralElement,
  appendResourceElement,
  escapeXmlAttribute,
} from "../rdf"
import { appendAnnotationValues } from "./localized-texts"
import {
  appendExampleAnnotations,
  appendNoteAnnotations,
  getTargetItems,
} from "./metadata"
import type { RelationMap } from "./types"

export function appendRelationAttributes({
  baseIri,
  defaultLanguage,
  exampleMap,
  lines,
  localizedTextMap,
  noteMap,
  ontology,
  relationById,
}: {
  baseIri: string
  defaultLanguage: string
  exampleMap: Map<string, ImportOntology["examples"][number][]>
  lines: string[]
  localizedTextMap: Map<string, string>
  noteMap: Map<string, ImportOntology["notes"][number][]>
  ontology: ImportOntology
  relationById: RelationMap
}) {
  const usedSegmentsByRelation = new Map<string, Set<string>>()

  for (const attribute of ontology.relationAttributes) {
    const relationEntry = relationById.get(attribute.relationId)
    if (!relationEntry) continue

    const usedSegments =
      usedSegmentsByRelation.get(attribute.relationId) ?? new Set<string>()
    usedSegmentsByRelation.set(attribute.relationId, usedSegments)

    const segment = claimUniqueIriSegment({
      fallback: `relation-attribute-${usedSegments.size + 1}`,
      name: attribute.name,
      stableId:
        attribute.id ?? `${attribute.relationId}:${attribute.sortOrder}`,
      usedSegments,
    })
    const iri = joinOwlIri(baseIri, relationEntry.segment, segment)
    const datatypeIri = getOntologyDataTypeIri(attribute.dataType)

    if (!datatypeIri) {
      throw new Error(`Unsupported ontology datatype: ${attribute.dataType}`)
    }

    lines.push(
      `  <owl:DatatypeProperty rdf:about="${escapeXmlAttribute(iri)}">`
    )
    appendAnnotationValues({
      canonicalValue: attribute.name,
      defaultLanguage,
      fieldName: "name",
      lines,
      localizedTextMap,
      tagName: "rdfs:label",
      targetId:
        attribute.id ?? `${attribute.relationId}:${attribute.sortOrder}`,
      targetType: "relation_attribute",
    })
    appendAnnotationValues({
      canonicalValue: attribute.description,
      defaultLanguage,
      fieldName: "description",
      lines,
      localizedTextMap,
      tagName: "rdfs:comment",
      targetId:
        attribute.id ?? `${attribute.relationId}:${attribute.sortOrder}`,
      targetType: "relation_attribute",
    })
    appendResourceElement(lines, "    ", "rdfs:range", datatypeIri)
    appendResourceElement(lines, "    ", "kg:attributeOf", relationEntry.iri)
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
        "relation_attribute",
        attribute.id ?? `${attribute.relationId}:${attribute.sortOrder}`
      )
    )
    appendExampleAnnotations(
      lines,
      getTargetItems(
        exampleMap,
        "relation_attribute",
        attribute.id ?? `${attribute.relationId}:${attribute.sortOrder}`
      )
    )
    lines.push("  </owl:DatatypeProperty>")
  }
}
