import type { Dispatch, SetStateAction } from "react"

type LocalizedTextTranslations = Record<string, string>

export interface LocalizedTextInput<TFieldName extends string = string> {
  fieldName: TFieldName
  languageCode: string
  value: string
}

export function updateLocalizedTextTranslations(
  setTranslations: Dispatch<SetStateAction<LocalizedTextTranslations>>,
  languageCode: string,
  nextValue: string
) {
  setTranslations((current) => {
    if (!nextValue) {
      const next = { ...current }
      delete next[languageCode]
      return next
    }

    return {
      ...current,
      [languageCode]: nextValue,
    }
  })
}

export function buildLocalizedTextInputs<TFieldName extends string>(
  translationsByField: Record<TFieldName, LocalizedTextTranslations>
): LocalizedTextInput<TFieldName>[] {
  const localizedTexts: LocalizedTextInput<TFieldName>[] = []

  for (const fieldName of Object.keys(translationsByField) as TFieldName[]) {
    const translations = translationsByField[fieldName]

    localizedTexts.push(
      ...Object.entries(translations).map(([languageCode, value]) => ({
        fieldName,
        languageCode,
        value,
      }))
    )
  }

  return localizedTexts
}
