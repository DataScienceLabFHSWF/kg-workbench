import type { ImportLocalizedText } from "@/features/ontology/schemas/import"

import { appendLiteralElement } from "../rdf"

export type AnnotationTargetType = ImportLocalizedText["targetType"]

function createLocalizedTextKey(
  targetType: AnnotationTargetType,
  targetId: string,
  fieldName: string,
  languageCode: string
) {
  return `${targetType}:${targetId}:${fieldName}:${languageCode}`
}

export function buildLocalizedTextMap(localizedTexts: ImportLocalizedText[]) {
  return new Map(
    localizedTexts.map((text) => [
      createLocalizedTextKey(
        text.targetType,
        text.targetId,
        text.fieldName,
        text.languageCode
      ),
      text.value,
    ])
  )
}

export function appendAnnotationValues({
  canonicalValue,
  defaultLanguage,
  fieldName,
  lines,
  localizedTextMap,
  tagName,
  targetId,
  targetType,
}: {
  canonicalValue: string | null | undefined
  defaultLanguage: string
  fieldName: string
  lines: string[]
  localizedTextMap: Map<string, string>
  tagName: string
  targetId: string
  targetType: AnnotationTargetType
}) {
  appendLiteralElement(lines, "    ", tagName, canonicalValue, defaultLanguage)

  for (const [key, value] of localizedTextMap.entries()) {
    const prefix = `${targetType}:${targetId}:${fieldName}:`
    if (!key.startsWith(prefix)) continue

    const languageCode = key.slice(prefix.length)
    appendLiteralElement(lines, "    ", tagName, value, languageCode)
  }
}

export function appendOntologyAnnotationValues({
  canonicalValue,
  defaultLanguage,
  fieldName,
  lines,
  localizedTextMap,
  tagName,
}: {
  canonicalValue: string | null | undefined
  defaultLanguage: string
  fieldName: string
  lines: string[]
  localizedTextMap: Map<string, string>
  tagName: string
}) {
  appendLiteralElement(lines, "    ", tagName, canonicalValue, defaultLanguage)

  for (const [key, value] of localizedTextMap.entries()) {
    const [targetType, , localizedFieldName, languageCode] = key.split(":")
    if (targetType !== "ontology" || localizedFieldName !== fieldName) continue
    appendLiteralElement(lines, "    ", tagName, value, languageCode)
  }
}
