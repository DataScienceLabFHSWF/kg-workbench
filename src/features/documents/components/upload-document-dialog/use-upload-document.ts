"use client"

import { useEffect, useRef, useState, type FormEvent } from "react"

import { useQuery } from "@tanstack/react-query"
import { toast } from "sonner"

import type { Document } from "@/domain/documents"
import type {
  ExtractorBackend,
  InternalExtractorProvider,
} from "@/server/external/extraction-api"
import {
  getOntologyClasses,
  getOntologyDocumentsForPicker,
  getOntologyLanguages,
  getOntologyLocalizedTextsByOntology,
  getOntologyModules,
  getOntologyRelations,
} from "@/features/ontology/server/queries"
import { useOntologyModuleLanguageSelection } from "@/hooks/use-ontology-module-language-selection"

import {
  getExternalExtractorDefaultUrl,
  uploadDocumentAndExtract,
} from "../../server/actions/extraction"

export type UploadStep = "form" | "detail"

export type UploadDocumentResult = {
  document: Document
  runId: string
  externalApiKey?: string
}

export const INTERNAL_EXTRACTOR_PROVIDER_OPTIONS = [
  { value: "openai", label: "OpenAI" },
  { value: "anthropic", label: "Anthropic" },
  { value: "ollama", label: "Ollama" },
] as const satisfies {
  value: InternalExtractorProvider
  label: string
}[]

export const DEFAULT_MODEL_BY_INTERNAL_PROVIDER = {
  openai: "gpt-5",
  anthropic: "claude-3-5-sonnet-latest",
  ollama: "llama3.1",
} as const satisfies Record<InternalExtractorProvider, string>

interface UseUploadDocumentArgs {
  open: boolean
  onOpenChange: (open: boolean) => void
  onUploaded: (result: UploadDocumentResult) => void
}

export function useUploadDocument({
  open,
  onOpenChange,
  onUploaded,
}: UseUploadDocumentArgs) {
  const [title, setTitle] = useState("")
  const [ontologyId, setOntologyId] = useState("")
  const [extractorBackend, setExtractorBackend] =
    useState<ExtractorBackend>("internal")
  const [internalProvider, setInternalProvider] =
    useState<InternalExtractorProvider>("openai")
  const [modelName, setModelName] = useState<string>(
    DEFAULT_MODEL_BY_INTERNAL_PROVIDER.openai
  )
  const [internalApiKey, setInternalApiKey] = useState("")
  const [externalUrl, setExternalUrl] = useState("")
  const [externalApiKey, setExternalApiKey] = useState("")
  const [step, setStep] = useState<UploadStep>("form")
  const [isPending, setIsPending] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const { data: externalDefaultUrl = "" } = useQuery({
    queryKey: ["external-extractor-default-url"],
    queryFn: getExternalExtractorDefaultUrl,
    enabled: open,
  })

  const { data: ontologies = [], isLoading: isLoadingOntologies } = useQuery({
    queryKey: ["ontology-documents-picker"],
    queryFn: getOntologyDocumentsForPicker,
    enabled: open,
  })

  const selectedOntology = ontologies.find((o) => o.id === ontologyId) ?? null

  const { data: modules = [], isLoading: isLoadingModules } = useQuery({
    queryKey: ["ontology-modules", ontologyId],
    queryFn: () => getOntologyModules(ontologyId),
    enabled: Boolean(ontologyId),
  })

  const { data: classes = [], isLoading: isLoadingClasses } = useQuery({
    queryKey: ["ontology-classes", ontologyId],
    queryFn: () => getOntologyClasses(ontologyId),
    enabled: Boolean(ontologyId),
  })

  const { data: relations = [] } = useQuery({
    queryKey: ["ontology-relations", ontologyId],
    queryFn: () => getOntologyRelations(ontologyId),
    enabled: Boolean(ontologyId),
  })

  const { data: languages = [] } = useQuery({
    queryKey: ["ontology-languages", ontologyId],
    queryFn: () => getOntologyLanguages(ontologyId),
    enabled: Boolean(ontologyId),
  })

  const { data: localizedTexts = [] } = useQuery({
    queryKey: ["ontology-localized-texts", ontologyId],
    queryFn: () => getOntologyLocalizedTextsByOntology(ontologyId),
    enabled: Boolean(ontologyId),
  })

  const isLoadingOntologyData = isLoadingModules || isLoadingClasses

  useEffect(() => {
    if (!open || !externalDefaultUrl || externalUrl.trim()) return
    setExternalUrl(externalDefaultUrl)
  }, [externalDefaultUrl, externalUrl, open])

  const selection = useOntologyModuleLanguageSelection({
    defaultLanguage: selectedOntology?.default_language ?? "en",
    ontologyId: ontologyId || "",
    ontologyUsecase: selectedOntology?.usecase ?? "",
    languages,
    localizedTexts,
    modules,
    classes,
    relations,
  })

  function handleOntologyChange(nextOntologyId: string) {
    setOntologyId(nextOntologyId)
    selection.resetSelectionState()
  }

  function handleInternalProviderChange(provider: InternalExtractorProvider) {
    setInternalProvider(provider)
    setModelName(DEFAULT_MODEL_BY_INTERNAL_PROVIDER[provider])
  }

  function handleExtractorBackendChange(backend: ExtractorBackend) {
    setExtractorBackend(backend)
    if (backend === "external" && !externalUrl.trim() && externalDefaultUrl) {
      setExternalUrl(externalDefaultUrl)
    }
  }

  function handleGoToDetail() {
    setStep("detail")
  }

  function handleBackToForm() {
    setStep("form")
  }

  function resetAll() {
    setTitle("")
    setOntologyId("")
    setExtractorBackend("internal")
    setInternalProvider("openai")
    setModelName(DEFAULT_MODEL_BY_INTERNAL_PROVIDER.openai)
    setInternalApiKey("")
    setExternalUrl(externalDefaultUrl)
    setExternalApiKey("")
    setStep("form")
    selection.resetSelectionState()
    if (fileRef.current) fileRef.current.value = ""
  }

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) resetAll()
    onOpenChange(nextOpen)
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const file = fileRef.current?.files?.[0]
    if (!title.trim() || !ontologyId || !file) return

    setIsPending(true)
    try {
      const formData = new FormData()
      formData.set("title", title.trim())
      formData.set("ontologyId", ontologyId)
      formData.set("language", selection.exportLanguage)
      formData.set(
        "missingTranslationBehavior",
        selection.missingTranslationBehavior
      )
      formData.set(
        "classIds",
        JSON.stringify(Array.from(selection.selectedClassIds).sort())
      )
      formData.set(
        "relationIds",
        JSON.stringify(selection.exportRelationIds.slice().sort())
      )
      formData.set("extractorBackend", extractorBackend)
      if (extractorBackend === "internal") {
        formData.set("internalProvider", internalProvider)
        formData.set("modelName", modelName.trim())
        if (internalProvider !== "ollama") {
          formData.set("internalApiKey", internalApiKey.trim())
        }
      } else {
        formData.set("externalUrl", externalUrl.trim())
        const externalApiKeyValue = externalApiKey.trim()
        if (externalApiKeyValue) {
          formData.set("externalApiKey", externalApiKeyValue)
        }
      }
      formData.set("file", file)
      const result = await uploadDocumentAndExtract(formData)
      onUploaded({
        ...result,
        ...(extractorBackend === "external" && externalApiKey.trim()
          ? { externalApiKey: externalApiKey.trim() }
          : {}),
      })
      resetAll()
      onOpenChange(false)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed.")
    } finally {
      setIsPending(false)
    }
  }

  const hasValidExtractorSettings =
    extractorBackend === "internal"
      ? Boolean(modelName.trim()) &&
        (internalProvider === "ollama" || Boolean(internalApiKey.trim()))
      : Boolean(externalUrl.trim())

  const canSubmit =
    Boolean(title.trim()) &&
    Boolean(ontologyId) &&
    hasValidExtractorSettings &&
    !isPending &&
    !isLoadingOntologies &&
    !isLoadingOntologyData &&
    selection.unresolvedCount === 0

  return {
    title,
    setTitle,
    ontologyId,
    extractorBackend,
    handleExtractorBackendChange,
    internalProvider,
    handleInternalProviderChange,
    modelName,
    setModelName,
    internalApiKey,
    setInternalApiKey,
    externalUrl,
    setExternalUrl,
    externalApiKey,
    setExternalApiKey,
    ontologies,
    isLoadingOntologies,
    isLoadingOntologyData,
    modules,
    step,
    isPending,
    fileRef,
    selection,
    canSubmit,
    handleOntologyChange,
    handleGoToDetail,
    handleBackToForm,
    handleOpenChange,
    handleSubmit,
  }
}
