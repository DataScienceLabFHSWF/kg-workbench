import type { OntologyLanguage, OntologyLocalizedText } from "@/domain/ontology"
import {
  deleteLocalizedText,
  upsertLocalizedText,
} from "@/features/ontology/server/actions/localized-texts"
import type { OntologyMetadataTarget } from "@/features/ontology/server/queries"
import type { LocalizedTextEditorDraftState, LocalizedTextField } from "./types"

export function getLanguageOptions(
  ontologyId: string,
  languages: OntologyLanguage[],
  defaultLanguage?: string | null
) {
  if (languages.length > 0) {
    if (!defaultLanguage) {
      return languages
    }

    const defaultOption = languages.find(
      (language) => language.language_code === defaultLanguage
    )

    if (!defaultOption) {
      return languages
    }

    return [
      defaultOption,
      ...languages.filter(
        (language) => language.language_code !== defaultLanguage
      ),
    ]
  }

  return [
    {
      id: "__default__",
      ontology_id: ontologyId,
      language_code: defaultLanguage ?? "__base__",
      label: defaultLanguage ?? "Base",
    },
  ]
}

export function getInitialLanguageCode(
  languageOptions: OntologyLanguage[],
  canonicalLanguageCode: string
) {
  return (
    languageOptions.find(
      (language) => language.language_code === canonicalLanguageCode
    )?.language_code ??
    languageOptions[0]?.language_code ??
    ""
  )
}

export function getLocalizedFieldValue({
  field,
  languageCode,
  canonicalLanguageCode,
  draftState,
  localizedTexts,
}: {
  field: LocalizedTextField
  languageCode: string
  canonicalLanguageCode: string
  draftState?: LocalizedTextEditorDraftState
  localizedTexts?: OntologyLocalizedText[]
}) {
  const isDefaultLanguage = languageCode === canonicalLanguageCode

  if (draftState) {
    return draftState.getValue(
      field.name,
      languageCode,
      isDefaultLanguage,
      field.canonicalValue
    )
  }

  if (isDefaultLanguage) {
    return field.canonicalValue
  }

  return (
    localizedTexts?.find(
      (text) =>
        text.field_name === field.name && text.language_code === languageCode
    )?.value ?? ""
  )
}

export function getLanguageStatus({
  fields,
  languageCode,
  canonicalLanguageCode,
  draftState,
  localizedTexts,
}: {
  fields: LocalizedTextField[]
  languageCode: string
  canonicalLanguageCode: string
  draftState?: LocalizedTextEditorDraftState
  localizedTexts?: OntologyLocalizedText[]
}) {
  const filledFieldCount = fields.reduce((count, field) => {
    const value = getLocalizedFieldValue({
      field,
      languageCode,
      canonicalLanguageCode,
      draftState,
      localizedTexts,
    })

    return value.trim() ? count + 1 : count
  }, 0)

  if (filledFieldCount === 0) {
    return "empty" as const
  }

  if (filledFieldCount < fields.length) {
    return "incomplete" as const
  }

  return "complete" as const
}

export async function saveLocalizedTextValue({
  ontologyId,
  target,
  fieldName,
  canonicalValueHandler,
  existingTextId,
  isDefaultLanguage,
  languageCode,
  nextValue,
}: {
  ontologyId: string
  target: OntologyMetadataTarget
  fieldName: string
  canonicalValueHandler: (newValue: string) => Promise<unknown>
  existingTextId?: string
  isDefaultLanguage: boolean
  languageCode: string
  nextValue: string
}) {
  if (isDefaultLanguage) {
    await canonicalValueHandler(nextValue)
    return
  }

  if (!nextValue && existingTextId) {
    await deleteLocalizedText(existingTextId)
    return
  }

  if (!nextValue) return

  await upsertLocalizedText(
    ontologyId,
    target,
    fieldName,
    languageCode,
    nextValue
  )
}
