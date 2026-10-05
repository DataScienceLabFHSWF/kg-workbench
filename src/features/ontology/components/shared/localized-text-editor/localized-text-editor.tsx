"use client"

import { useState } from "react"
import { toast } from "sonner"

import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { EditableField } from "../editable-field"

import {
  getInitialLanguageCode,
  getLanguageStatus,
  getLanguageOptions,
  getLocalizedFieldValue,
  saveLocalizedTextValue,
} from "./helpers"
import type { LocalizedTextEditorProps } from "./types"

export function LocalizedTextEditor({
  ontologyId,
  languages,
  fields,
  defaultLanguage,
  ...props
}: LocalizedTextEditorProps) {
  const languageOptions = getLanguageOptions(
    ontologyId,
    languages,
    defaultLanguage
  )

  const canonicalLanguageCode =
    defaultLanguage ?? languageOptions[0]?.language_code ?? ""

  const initialLanguageCode = getInitialLanguageCode(
    languageOptions,
    canonicalLanguageCode
  )

  const draftState = props.draftState
  const editorKey = draftState
    ? draftState.editorKey
    : `${props.target.type}-${props.target.id}-${defaultLanguage ?? ""}`
  const [languageSelection, setLanguageSelection] = useState(() => ({
    editorKey,
    languageCode: initialLanguageCode,
  }))
  const selectedLanguageCode =
    languageSelection.editorKey === editorKey
      ? languageSelection.languageCode
      : initialLanguageCode

  const selectedLanguage =
    languageOptions.find(
      (language) => language.language_code === selectedLanguageCode
    ) ?? languageOptions[0]

  const languageStatuses = languageOptions.map((language) => ({
    languageCode: language.language_code,
    status: getLanguageStatus({
      fields,
      languageCode: language.language_code,
      canonicalLanguageCode,
      draftState,
      localizedTexts: draftState ? undefined : props.localizedTexts,
    }),
  }))

  const isDefaultLanguage =
    selectedLanguage.language_code === canonicalLanguageCode

  async function handleSaveField(
    field: LocalizedTextEditorProps["fields"][number],
    existingTextId: string | undefined,
    nextValue: string
  ) {
    try {
      if (draftState) {
        await draftState.onSaveValue({
          fieldName: field.name,
          languageCode: selectedLanguage.language_code,
          isDefaultLanguage,
          nextValue,
        })
        return
      }

      await saveLocalizedTextValue({
        ontologyId,
        target: props.target,
        fieldName: field.name,
        canonicalValueHandler: field.onSaveCanonical,
        existingTextId,
        isDefaultLanguage,
        languageCode: selectedLanguage.language_code,
        nextValue,
      })
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Save failed.")
    }
  }

  return (
    <div className="w-full rounded-lg border bg-card">
      <div className="border-b px-2 py-2 sm:px-3">
        <div className="flex flex-wrap gap-2">
          {languageOptions.map((language) => {
            const isSelected =
              language.language_code === selectedLanguage.language_code
            const isDefault = language.language_code === canonicalLanguageCode
            const status = languageStatuses.find(
              (entry) => entry.languageCode === language.language_code
            )?.status

            return (
              <button
                key={language.id}
                type="button"
                onClick={() =>
                  setLanguageSelection({
                    editorKey,
                    languageCode: language.language_code,
                  })
                }
                className={cn(
                  "inline-flex min-h-9 items-center gap-2 rounded-md border px-3 py-2 text-xs font-medium transition-colors",
                  isSelected
                    ? "border-primary/40 bg-primary/5 text-primary"
                    : "border-border bg-background text-foreground hover:border-primary/30 hover:bg-accent/40"
                )}
                aria-pressed={isSelected}
              >
                <span className="flex items-center gap-1">
                  {language.label || language.language_code}
                  {isDefault ? (
                    <span className="text-[10px] font-normal text-muted-foreground">
                      (default)
                    </span>
                  ) : null}
                </span>
                {status !== "complete" ? (
                  <span
                    className={cn(
                      "text-[10px] font-normal",
                      status === "incomplete"
                        ? "text-amber-600"
                        : "text-muted-foreground"
                    )}
                  >
                    {status}
                  </span>
                ) : null}
              </button>
            )
          })}
        </div>
      </div>

      <div className="space-y-1 p-3 sm:p-4">
        {fields.map((field, index) => {
          const existingText = draftState
            ? undefined
            : props.localizedTexts.find(
                (text) =>
                  text.field_name === field.name &&
                  text.language_code === selectedLanguage.language_code
              )
          const value = getLocalizedFieldValue({
            field,
            languageCode: selectedLanguage.language_code,
            canonicalLanguageCode,
            draftState,
            localizedTexts: draftState ? undefined : props.localizedTexts,
          })
          const valueKey = draftState
            ? `${editorKey}-${field.name}-${selectedLanguage.language_code}`
            : `${props.target.type}-${props.target.id}-${field.name}-${selectedLanguage.language_code}`

          return (
            <div key={valueKey} className="space-y-2.5">
              {index > 0 ? <Separator /> : null}
              <EditableField
                label={field.label}
                value={value}
                onSave={(nextValue) =>
                  handleSaveField(field, existingText?.id, nextValue)
                }
                as={field.multiline ? "textarea" : "input"}
                placeholder={field.placeholder}
                className={
                  field.multiline
                    ? "[&_button]:min-h-0 [&_button]:px-1.5 [&_button]:py-1 [&_button]:text-sm [&_textarea]:min-h-[4.5rem] [&_textarea]:px-2.5 [&_textarea]:py-1.5 [&_textarea]:text-sm [&_textarea]:leading-5 [&>p]:mb-0.5 [&>p]:text-xs"
                    : "[&_button]:min-h-0 [&_button]:px-1.5 [&_button]:py-1 [&_button]:text-sm [&_input]:h-8 [&_input]:px-2.5 [&_input]:text-sm [&>p]:mb-0.5 [&>p]:text-xs"
                }
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}
