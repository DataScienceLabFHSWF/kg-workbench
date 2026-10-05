"use client"

import type { OntologyLanguage } from "@/domain/ontology"
import { LocalizedTextEditor } from "@/features/ontology/components/shared/localized-text-editor/localized-text-editor"

interface ModuleMetadataEditorProps {
  defaultLanguage?: string | null
  description: string
  descriptionPlaceholder: string
  descriptionTranslations: Record<string, string>
  editorKey: string
  languages: OntologyLanguage[]
  name: string
  namePlaceholder: string
  nameTranslations: Record<string, string>
  ontologyId: string
  onDescriptionChange: (nextValue: string) => void
  onNameChange: (nextValue: string) => void
  onTranslationChange: (
    fieldName: "description" | "name",
    languageCode: string,
    nextValue: string
  ) => void
}

export function ModuleMetadataEditor({
  defaultLanguage,
  description,
  descriptionPlaceholder,
  descriptionTranslations,
  editorKey,
  languages,
  name,
  namePlaceholder,
  nameTranslations,
  ontologyId,
  onDescriptionChange,
  onNameChange,
  onTranslationChange,
}: ModuleMetadataEditorProps) {
  return (
    <LocalizedTextEditor
      ontologyId={ontologyId}
      languages={languages}
      defaultLanguage={defaultLanguage}
      draftState={{
        editorKey,
        getValue: (fieldName, languageCode, isDefaultLanguage) => {
          if (fieldName === "name") {
            return isDefaultLanguage
              ? name
              : (nameTranslations[languageCode] ?? "")
          }

          return isDefaultLanguage
            ? description
            : (descriptionTranslations[languageCode] ?? "")
        },
        onSaveValue: async ({
          fieldName,
          languageCode,
          isDefaultLanguage,
          nextValue,
        }) => {
          if (isDefaultLanguage) {
            if (fieldName === "name") {
              onNameChange(nextValue)
              return
            }

            onDescriptionChange(nextValue)
            return
          }

          onTranslationChange(
            fieldName as "description" | "name",
            languageCode,
            nextValue
          )
        },
      }}
      fields={[
        {
          name: "name",
          label: "Name",
          canonicalValue: name,
          placeholder: namePlaceholder,
          onSaveCanonical: async (nextValue) => {
            onNameChange(nextValue)
          },
        },
        {
          name: "description",
          label: "Description",
          canonicalValue: description,
          multiline: true,
          placeholder: descriptionPlaceholder,
          onSaveCanonical: async (nextValue) => {
            onDescriptionChange(nextValue)
          },
        },
      ]}
    />
  )
}
