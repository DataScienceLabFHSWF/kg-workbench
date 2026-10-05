import { AlertTriangle, FileJson, Info } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import type {
  ExtractorBackend,
  InternalExtractorProvider,
} from "@/server/external/extraction-api"

import { INTERNAL_EXTRACTOR_PROVIDER_OPTIONS } from "./use-upload-document"

interface ExtractorSettingsFieldsetProps {
  extractorBackend: ExtractorBackend
  internalProvider: InternalExtractorProvider
  modelName: string
  internalApiKey: string
  externalUrl: string
  externalApiKey: string
  onExtractorBackendChange: (backend: ExtractorBackend) => void
  onInternalProviderChange: (provider: InternalExtractorProvider) => void
  onModelNameChange: (modelName: string) => void
  onInternalApiKeyChange: (apiKey: string) => void
  onExternalUrlChange: (url: string) => void
  onExternalApiKeyChange: (apiKey: string) => void
  onShowExternalApiContract: () => void
}

const EXTRACTOR_BACKEND_OPTIONS = [
  {
    value: "internal",
    label: "Internal",
    help: "Use a simple extractor which is based on the Neo4j KG Builder.",
  },
  {
    value: "external",
    label: "External",
    help: "Use your own extractor which provides the required response schema.",
  },
] as const satisfies {
  value: ExtractorBackend
  label: string
  help: string
}[]

export function ExtractorSettingsFieldset({
  extractorBackend,
  internalProvider,
  modelName,
  internalApiKey,
  externalUrl,
  externalApiKey,
  onExtractorBackendChange,
  onInternalProviderChange,
  onModelNameChange,
  onInternalApiKeyChange,
  onExternalUrlChange,
  onExternalApiKeyChange,
  onShowExternalApiContract,
}: ExtractorSettingsFieldsetProps) {
  return (
    <fieldset className="rounded-md border p-3">
      <legend className="px-1 text-xs font-medium text-muted-foreground">
        Extractor
      </legend>

      <TooltipProvider>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <RadioGroup
            value={extractorBackend}
            onValueChange={(value) =>
              onExtractorBackendChange(value as ExtractorBackend)
            }
            className="flex flex-wrap items-center gap-x-6 gap-y-3"
          >
            {EXTRACTOR_BACKEND_OPTIONS.map((option) => {
              const inputId = `doc-extractor-${option.value}`

              return (
                <div key={option.value} className="flex items-center gap-2">
                  <RadioGroupItem id={inputId} value={option.value} />
                  <Label
                    htmlFor={inputId}
                    className="flex cursor-pointer items-center gap-1.5 text-sm font-medium"
                  >
                    {option.label}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="size-3.5 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>{option.help}</TooltipContent>
                    </Tooltip>
                  </Label>
                </div>
              )
            })}
          </RadioGroup>

          {extractorBackend === "external" && (
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-7"
                onClick={onShowExternalApiContract}
              >
                <FileJson className="mr-2 size-3.5" />
                API contract
              </Button>
            </div>
          )}
        </div>
      </TooltipProvider>

      {extractorBackend === "internal" ? (
        <>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="doc-internal-provider">Provider</Label>
              <Select
                value={internalProvider}
                onValueChange={(value) =>
                  onInternalProviderChange(value as InternalExtractorProvider)
                }
                required
              >
                <SelectTrigger id="doc-internal-provider">
                  <SelectValue placeholder="Select provider..." />
                </SelectTrigger>
                <SelectContent>
                  {INTERNAL_EXTRACTOR_PROVIDER_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="doc-model-name">Model</Label>
              <Input
                id="doc-model-name"
                value={modelName}
                onChange={(event) => onModelNameChange(event.target.value)}
                placeholder="Model name"
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="doc-internal-api-key">API key</Label>
              <Input
                id="doc-internal-api-key"
                type="password"
                value={internalProvider === "ollama" ? "" : internalApiKey}
                onChange={(event) => onInternalApiKeyChange(event.target.value)}
                placeholder={
                  internalProvider === "ollama"
                    ? "Not required"
                    : "Used only for this extraction"
                }
                autoComplete="off"
                required={internalProvider !== "ollama"}
                disabled={internalProvider === "ollama"}
              />
            </div>
          </div>
          {internalProvider !== "ollama" ? <ApiKeyNotice /> : null}
        </>
      ) : (
        <>
          <div className="mt-4 grid gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,0.85fr)]">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="doc-external-url">Extractor URL</Label>
              <Input
                id="doc-external-url"
                type="url"
                value={externalUrl}
                onChange={(event) => onExternalUrlChange(event.target.value)}
                placeholder="https://extractor.example.com"
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="doc-external-api-key">API key</Label>
              <Input
                id="doc-external-api-key"
                type="password"
                value={externalApiKey}
                onChange={(event) => onExternalApiKeyChange(event.target.value)}
                placeholder="Optional"
                autoComplete="off"
              />
            </div>
          </div>
          <ApiKeyNotice />
        </>
      )}
    </fieldset>
  )
}

function ApiKeyNotice() {
  return (
    <div className="mt-3 flex items-start gap-2 text-xs leading-5 text-amber-900 dark:text-amber-200">
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-800 dark:text-amber-300" />
      <p>API keys are used only for this extraction run and are not stored.</p>
    </div>
  )
}
