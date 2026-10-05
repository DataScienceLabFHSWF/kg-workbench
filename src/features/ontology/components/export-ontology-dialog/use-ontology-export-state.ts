"use client"

import { useState, useTransition } from "react"
import { toast } from "sonner"

import { buildOntologyOwlExport } from "@/features/ontology/server/actions/ontology-owl-export"
import { buildOntologyExport } from "@/features/ontology/server/actions/ontology-transfer"
import { normalizeOwlBaseIri } from "@/features/ontology/utils/owl-base-iri"
import { useOntologyModuleLanguageSelection } from "@/hooks/use-ontology-module-language-selection"

import { downloadJsonFile, downloadTextFile } from "./export-utils"
import type { ExportOntologyDialogProps } from "./types"

type UseOntologyExportStateArgs = Omit<
  ExportOntologyDialogProps,
  "mode" | "open" | "ontologyName"
>

const DEFAULT_OWL_BASE_IRI = "https://example.com/ontology/"

export function useOntologyExportState({
  defaultLanguage,
  ontologyId,
  ontologyUsecase,
  languages,
  localizedTexts,
  modules,
  classes,
  relations,
  onOpenChange,
}: UseOntologyExportStateArgs) {
  const selection = useOntologyModuleLanguageSelection({
    defaultLanguage,
    ontologyId,
    ontologyUsecase,
    languages,
    localizedTexts,
    modules,
    classes,
    relations,
  })

  const [includeVisual, setIncludeVisual] = useState(true)
  const [baseIri, setBaseIri] = useState(DEFAULT_OWL_BASE_IRI)
  const [baseIriError, setBaseIriError] = useState<string | null>(null)
  const [isExporting, startExportTransition] = useTransition()

  function resetState() {
    selection.resetSelectionState()
    setIncludeVisual(false)
    setBaseIri(DEFAULT_OWL_BASE_IRI)
    setBaseIriError(null)
  }

  function closeAndResetDialog() {
    resetState()
    onOpenChange(false)
  }

  function handleBaseIriChange(value: string) {
    setBaseIri(value)
    setBaseIriError(null)
  }

  function handleExport() {
    startExportTransition(async () => {
      try {
        const result = await buildOntologyExport({
          exportLanguage: selection.exportLanguage,
          missingTranslationBehavior: selection.missingTranslationBehavior,
          ontologyId,
          moduleIds: Array.from(selection.selectedModuleIds).sort(),
          classIds: Array.from(selection.selectedClassIds).sort(),
          relationIds: selection.exportRelationIds.slice().sort(),
          includeVisual,
        })

        downloadJsonFile(result.fileName, result.payload)
        closeAndResetDialog()
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Export failed.")
      }
    })
  }

  function handleOwlExport() {
    let normalizedBaseIri: string
    try {
      normalizedBaseIri = normalizeOwlBaseIri(baseIri)
    } catch (error) {
      setBaseIriError(
        error instanceof Error ? error.message : "Enter a valid Base IRI."
      )
      return
    }

    setBaseIri(normalizedBaseIri)
    setBaseIriError(null)

    startExportTransition(async () => {
      try {
        const result = await buildOntologyOwlExport({
          ontologyId,
          baseIri: normalizedBaseIri,
          exportLanguage: selection.exportLanguage,
          missingTranslationBehavior: selection.missingTranslationBehavior,
          moduleIds: Array.from(selection.selectedModuleIds).sort(),
          classIds: Array.from(selection.selectedClassIds).sort(),
          relationIds: selection.exportRelationIds.slice().sort(),
        })

        downloadTextFile(result.fileName, result.content, "application/rdf+xml")
        closeAndResetDialog()
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Export failed.")
      }
    })
  }

  return {
    ...selection,
    baseIri,
    baseIriError,
    includeVisual,
    isExporting,
    closeAndResetDialog,
    handleBaseIriChange,
    handleExport,
    handleOwlExport,
    resetState,
    setIncludeVisual,
  }
}
