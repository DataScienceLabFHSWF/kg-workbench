import { AlertTriangle, Loader2 } from "lucide-react"
import type { ChangeEvent, FormEvent, RefObject } from "react"

import { LanguageControls } from "@/components/shared/language-controls/language-controls"
import { ModuleSelectionPanel } from "@/components/shared/module-selection-panel/module-selection-panel"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { OntologyModule } from "@/domain/ontology"
import type { useOntologyModuleLanguageSelection } from "@/hooks/use-ontology-module-language-selection"
import type {
  ExtractorBackend,
  InternalExtractorProvider,
} from "@/server/external/extraction-api"

import { ExtractorSettingsFieldset } from "./extractor-settings-fieldset"

interface UploadFormProps {
  title: string
  ontologyId: string
  extractorBackend: ExtractorBackend
  internalProvider: InternalExtractorProvider
  modelName: string
  internalApiKey: string
  externalUrl: string
  externalApiKey: string
  ontologies: { id: string; name: string }[]
  isLoadingOntologies: boolean
  isLoadingOntologyData: boolean
  modules: OntologyModule[]
  isPending: boolean
  canSubmit: boolean
  fileRef: RefObject<HTMLInputElement | null>
  selection: ReturnType<typeof useOntologyModuleLanguageSelection>
  defaultLanguage: string
  onTitleChange: (title: string) => void
  onOntologyChange: (id: string) => void
  onExtractorBackendChange: (backend: ExtractorBackend) => void
  onInternalProviderChange: (provider: InternalExtractorProvider) => void
  onModelNameChange: (modelName: string) => void
  onInternalApiKeyChange: (apiKey: string) => void
  onExternalUrlChange: (url: string) => void
  onExternalApiKeyChange: (apiKey: string) => void
  onShowExternalApiContract: () => void
  onGoToDetail: () => void
  onSubmit: (e: FormEvent<HTMLFormElement>) => void
}

export function UploadForm({
  title,
  ontologyId,
  extractorBackend,
  internalProvider,
  modelName,
  internalApiKey,
  externalUrl,
  externalApiKey,
  ontologies,
  isLoadingOntologies,
  isLoadingOntologyData,
  modules,
  isPending,
  canSubmit,
  fileRef,
  selection,
  defaultLanguage,
  onTitleChange,
  onOntologyChange,
  onExtractorBackendChange,
  onInternalProviderChange,
  onModelNameChange,
  onInternalApiKeyChange,
  onExternalUrlChange,
  onExternalApiKeyChange,
  onShowExternalApiContract,
  onGoToDetail,
  onSubmit,
}: UploadFormProps) {
  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const fileName = e.target.files?.[0]?.name
    if (!fileName || title.trim()) return

    const titleFromFileName = fileName.replace(/\.[^/.]+$/, "").trim()
    onTitleChange(titleFromFileName || fileName)
  }

  return (
    <form onSubmit={onSubmit} className="flex min-h-0 flex-1 flex-col pt-2">
      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto pr-1 pb-4">
        <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="doc-file">File</Label>
            <Input
              id="doc-file"
              ref={fileRef}
              type="file"
              accept="application/pdf,text/plain"
              required
              className="cursor-pointer"
              onChange={handleFileChange}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="doc-title">Title</Label>
            <Input
              id="doc-title"
              value={title}
              onChange={(e) => onTitleChange(e.target.value)}
              placeholder="Document title"
              required
            />
          </div>
        </div>

        <ExtractorSettingsFieldset
          extractorBackend={extractorBackend}
          internalProvider={internalProvider}
          modelName={modelName}
          internalApiKey={internalApiKey}
          externalUrl={externalUrl}
          externalApiKey={externalApiKey}
          onExtractorBackendChange={onExtractorBackendChange}
          onInternalProviderChange={onInternalProviderChange}
          onModelNameChange={onModelNameChange}
          onInternalApiKeyChange={onInternalApiKeyChange}
          onExternalUrlChange={onExternalUrlChange}
          onExternalApiKeyChange={onExternalApiKeyChange}
          onShowExternalApiContract={onShowExternalApiContract}
        />

        <fieldset className="rounded-md border p-3">
          <legend className="px-1 text-xs font-medium text-muted-foreground">
            Ontology
          </legend>
          <div className="grid gap-4 sm:grid-cols-2 sm:items-end">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="doc-ontology">Ontology</Label>
              {isLoadingOntologies ? (
                <div className="flex h-9 items-center gap-2 text-xs text-muted-foreground">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Loading ontologies...
                </div>
              ) : ontologies.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  No ontologies available. Create one first.
                </p>
              ) : (
                <Select
                  value={ontologyId}
                  onValueChange={onOntologyChange}
                  required
                >
                  <SelectTrigger id="doc-ontology">
                    <SelectValue placeholder="Select ontology..." />
                  </SelectTrigger>
                  <SelectContent>
                    {ontologies.map((ontology) => (
                      <SelectItem key={ontology.id} value={ontology.id}>
                        {ontology.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {ontologyId ? (
              isLoadingOntologyData ? (
                <div className="flex h-9 items-center gap-2 text-xs text-muted-foreground">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Loading ontology data...
                </div>
              ) : (
                <LanguageControls
                  defaultLanguage={defaultLanguage}
                  exportLanguage={selection.exportLanguage}
                  exportLanguageOptions={selection.exportLanguageOptions}
                  languageHelpText="Controls which ontology labels and descriptions are sent to the extractor for this upload."
                  languageLabel="Schema language"
                  missingTranslationBehavior={
                    selection.missingTranslationBehavior
                  }
                  missingTranslationSummary={
                    selection.missingTranslationSummary
                  }
                  missingTranslationSummaryText={
                    selection.missingTranslationSummaryText
                  }
                  onExportLanguageChange={selection.setExportLanguage}
                  onMissingTranslationBehaviorChange={
                    selection.setMissingTranslationBehavior
                  }
                />
              )
            ) : null}
          </div>

          {ontologyId && !isLoadingOntologyData && modules.length > 0 ? (
            <div className="mt-4">
              <ModuleSelectionPanel
                modules={modules}
                selectedModuleIds={selection.selectedModuleIds}
                moduleCounts={selection.moduleCounts}
                scrollAreaClassName="h-[21.5rem]"
                onToggleModule={selection.handleToggleModule}
                onSelectAllModules={selection.handleSelectAllModules}
                onDeselectAllModules={selection.handleDeselectAllModules}
              />

              {selection.unresolvedCount > 0 && (
                <div className="mt-4 rounded-md border border-amber-200 bg-amber-50 p-3 dark:border-amber-800 dark:bg-amber-950/40">
                  <div className="mb-2 flex items-center gap-2 text-sm font-medium text-amber-800 dark:text-amber-300">
                    <AlertTriangle className="h-4 w-4 shrink-0" />
                    {selection.unresolvedCount} cross-module{" "}
                    {selection.unresolvedCount === 1
                      ? "dependency"
                      : "dependencies"}{" "}
                    detected
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={selection.handleExcludeAllDependencies}
                    >
                      Exclude all
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={selection.handleIncludeAllDependencies}
                    >
                      Include all
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={onGoToDetail}
                    >
                      Choose manually
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </fieldset>
      </div>

      <div className="-mx-4 flex shrink-0 justify-end border-t bg-popover px-4 pt-3">
        <Button type="submit" disabled={!canSubmit}>
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Upload & extract
        </Button>
      </div>
    </form>
  )
}
