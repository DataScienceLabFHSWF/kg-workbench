"use client"

import { useState } from "react"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

import { ExternalExtractionApiContractDialog } from "./external-extraction-api-contract-dialog"
import { ModuleDetailStep } from "./module-detail-step"
import { UploadForm } from "./upload-form"
import {
  useUploadDocument,
  type UploadDocumentResult,
} from "./use-upload-document"

interface UploadDocumentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onUploaded: (result: UploadDocumentResult) => void
}

export function UploadDocumentDialog({
  open,
  onOpenChange,
  onUploaded,
}: UploadDocumentDialogProps) {
  const [apiContractOpen, setApiContractOpen] = useState(false)
  const {
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
  } = useUploadDocument({ open, onOpenChange, onUploaded })

  const selectedOntology = ontologies.find((o) => o.id === ontologyId) ?? null
  const isDetailStep = step === "detail"

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent
          className={
            isDetailStep
              ? "flex h-[calc(100vh-2rem)] max-h-[960px] w-[calc(100vw-2rem)] max-w-none flex-col overflow-hidden sm:max-w-none 2xl:max-w-[1680px]"
              : "flex max-h-[calc(100vh-2rem)] flex-col overflow-hidden sm:max-w-2xl"
          }
        >
          {isDetailStep ? (
            <ModuleDetailStep
              modules={modules}
              selection={selection}
              onBack={handleBackToForm}
            />
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>Upload document for extraction</DialogTitle>
              </DialogHeader>
              <UploadForm
                title={title}
                ontologyId={ontologyId}
                extractorBackend={extractorBackend}
                internalProvider={internalProvider}
                modelName={modelName}
                internalApiKey={internalApiKey}
                externalUrl={externalUrl}
                externalApiKey={externalApiKey}
                ontologies={ontologies}
                isLoadingOntologies={isLoadingOntologies}
                isLoadingOntologyData={isLoadingOntologyData}
                modules={modules}
                isPending={isPending}
                canSubmit={canSubmit}
                fileRef={fileRef}
                selection={selection}
                defaultLanguage={selectedOntology?.default_language ?? "en"}
                onTitleChange={setTitle}
                onOntologyChange={handleOntologyChange}
                onExtractorBackendChange={handleExtractorBackendChange}
                onInternalProviderChange={handleInternalProviderChange}
                onModelNameChange={setModelName}
                onInternalApiKeyChange={setInternalApiKey}
                onExternalUrlChange={setExternalUrl}
                onExternalApiKeyChange={setExternalApiKey}
                onShowExternalApiContract={() => setApiContractOpen(true)}
                onGoToDetail={handleGoToDetail}
                onSubmit={handleSubmit}
              />
            </>
          )}
        </DialogContent>
      </Dialog>

      <ExternalExtractionApiContractDialog
        open={apiContractOpen}
        onOpenChange={setApiContractOpen}
      />
    </>
  )
}
