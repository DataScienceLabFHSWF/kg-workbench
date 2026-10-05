import { isAllLanguagesExportLanguage } from "@/features/ontology/utils/export-language"

import { createLocalizedTextKey } from "./localized-texts"
import type { LocalizedTextTargetType } from "./types"

export function resolveExportValue({
  canonicalValue,
  defaultLanguage,
  exportLanguage,
  fieldName,
  localizedTextValueMap,
  missingTranslationBehavior,
  targetId,
  targetType,
}: {
  canonicalValue: string | null | undefined
  defaultLanguage: string
  exportLanguage: string
  fieldName: string
  localizedTextValueMap: Map<string, string>
  missingTranslationBehavior: "fallback" | "strict"
  targetId: string
  targetType: LocalizedTextTargetType
}) {
  const normalizedCanonicalValue = canonicalValue ?? ""
  if (
    exportLanguage === defaultLanguage ||
    isAllLanguagesExportLanguage(exportLanguage)
  ) {
    return normalizedCanonicalValue
  }

  const localizedValue = localizedTextValueMap
    .get(
      createLocalizedTextKey(targetType, targetId, fieldName, exportLanguage)
    )
    ?.trim()

  if (localizedValue) return localizedValue
  return missingTranslationBehavior === "fallback"
    ? normalizedCanonicalValue
    : ""
}
