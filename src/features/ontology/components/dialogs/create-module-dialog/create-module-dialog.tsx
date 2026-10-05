"use client"

import { useRef, useState, type ChangeEvent, type FormEvent } from "react"
import { toast } from "sonner"

import type { OntologyLanguage } from "@/domain/ontology"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  createModule,
  importModuleFromJson,
} from "@/features/ontology/server/actions/modules"
import {
  buildLocalizedTextInputs,
  updateLocalizedTextTranslations,
} from "@/lib/localized-text-utils"

import { EmptyModuleForm } from "./empty-module-form"
import { ModuleMetadataEditor } from "./module-metadata-editor"
import {
  analyzeModuleImportWarnings,
  getFileBaseName,
  parseModuleJsonFile,
} from "./module-import-utils"
import { ModuleJsonImportForm } from "./module-json-import-form"
import { ModuleImportConfirmationDialog } from "./module-import-confirmation-dialog"
import {
  suggestUniqueModuleName,
  validateModuleName,
} from "./module-name-utils"
import type { CreateModuleMode } from "./types"

interface CreateModuleDialogProps {
  ontologyId: string
  languages: OntologyLanguage[]
  defaultLanguage?: string | null
  existingModuleNames: string[]
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: (moduleId: string) => void
}

export function CreateModuleDialog({
  ontologyId,
  languages,
  defaultLanguage,
  existingModuleNames,
  open,
  onOpenChange,
  onSuccess,
}: CreateModuleDialogProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [mode, setMode] = useState<CreateModuleMode>("empty")
  const [emptyName, setEmptyName] = useState("")
  const [emptyNameTranslations, setEmptyNameTranslations] = useState<
    Record<string, string>
  >({})
  const [emptyDescription, setEmptyDescription] = useState("")
  const [emptyDescriptionTranslations, setEmptyDescriptionTranslations] =
    useState<Record<string, string>>({})
  const [importName, setImportName] = useState("")
  const [importNameTranslations, setImportNameTranslations] = useState<
    Record<string, string>
  >({})
  const [importDescription, setImportDescription] = useState("")
  const [importDescriptionTranslations, setImportDescriptionTranslations] =
    useState<Record<string, string>>({})
  const [importFile, setImportFile] = useState<File | null>(null)
  const [importWarnings, setImportWarnings] = useState<string[]>([])
  const [validationError, setValidationError] = useState<string | null>(null)
  const [isPending, setIsPending] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const canCreateEmptyModule = Boolean(emptyName.trim())

  function resetState() {
    setMode("empty")
    setEmptyName("")
    setEmptyNameTranslations({})
    setEmptyDescription("")
    setEmptyDescriptionTranslations({})
    setImportName("")
    setImportNameTranslations({})
    setImportDescription("")
    setImportDescriptionTranslations({})
    setImportFile(null)
    setImportWarnings([])
    setValidationError(null)
    setConfirmOpen(false)
  }

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      resetState()
    }
    onOpenChange(nextOpen)
  }

  async function handleImportFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ""

    if (!file) return

    try {
      const parsed = await parseModuleJsonFile(file)
      const suggestedName = suggestUniqueModuleName(
        parsed.name.trim() || getFileBaseName(file.name),
        existingModuleNames
      )

      setImportFile(file)
      setImportName(suggestedName)
      setImportNameTranslations({})
      setImportDescription(parsed.description)
      setImportDescriptionTranslations({})
      setImportWarnings(analyzeModuleImportWarnings(parsed))
      setValidationError(null)
    } catch (error) {
      setImportFile(null)
      setImportWarnings([])
      setValidationError("The selected file is not a valid module JSON file.")
      toast.error(
        error instanceof Error ? error.message : "Failed to read module JSON."
      )
    }
  }

  async function handleCreateSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const error = validateModuleName(emptyName, existingModuleNames)
    if (error) {
      setValidationError(error)
      return
    }

    setValidationError(null)
    setIsPending(true)

    try {
      const result = await createModule({
        ontologyId,
        name: emptyName.trim(),
        description: emptyDescription,
        localizedTexts: buildLocalizedTextInputs({
          nameTranslations: emptyNameTranslations,
          descriptionTranslations: emptyDescriptionTranslations,
        }),
      })
      onSuccess(result.id)
      handleOpenChange(false)
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to create module."
      )
    } finally {
      setIsPending(false)
    }
  }

  async function performImport(confirmWarnings: boolean) {
    if (!importFile) {
      setValidationError("Choose a JSON file first.")
      return
    }

    const error = validateModuleName(importName, existingModuleNames)
    if (error) {
      setValidationError(error)
      return
    }

    setValidationError(null)
    setIsPending(true)

    try {
      const result = await importModuleFromJson({
        ontologyId,
        file: importFile,
        name: importName.trim(),
        description: importDescription,
        localizedTexts: buildLocalizedTextInputs({
          nameTranslations: importNameTranslations,
          descriptionTranslations: importDescriptionTranslations,
        }),
        confirmWarnings,
      })

      if (result.status === "needs-confirmation") {
        setImportName(result.name)
        setImportWarnings(result.warnings)
        setConfirmOpen(true)
        return
      }

      if (result.warnings.length > 0) {
        toast.warning("Imported with skipped items.", {
          description: result.warnings.slice(0, 2).join(" "),
        })
      }

      onSuccess(result.module.id)
      handleOpenChange(false)
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to import module."
      )
    } finally {
      setIsPending(false)
    }
  }

  async function handleImportSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!importFile) {
      setValidationError("Choose a JSON file first.")
      return
    }

    const error = validateModuleName(importName, existingModuleNames)
    if (error) {
      setValidationError(error)
      return
    }

    if (importWarnings.length > 0) {
      setConfirmOpen(true)
      return
    }

    await performImport(false)
  }

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Create Module</DialogTitle>
          </DialogHeader>

          <Tabs
            value={mode}
            onValueChange={(value) => {
              setMode(value as CreateModuleMode)
              setValidationError(null)
            }}
            className="space-y-4"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="empty">Empty module</TabsTrigger>
              <TabsTrigger value="import">Import JSON</TabsTrigger>
            </TabsList>

            <TabsContent value="empty" className="mt-0">
              <EmptyModuleForm
                canSubmit={canCreateEmptyModule}
                metadataEditor={
                  <ModuleMetadataEditor
                    ontologyId={ontologyId}
                    languages={languages}
                    defaultLanguage={defaultLanguage}
                    editorKey="create-module-metadata"
                    name={emptyName}
                    nameTranslations={emptyNameTranslations}
                    namePlaceholder="e.g. Core, Relations, Events"
                    description={emptyDescription}
                    descriptionTranslations={emptyDescriptionTranslations}
                    descriptionPlaceholder="No description"
                    onNameChange={setEmptyName}
                    onDescriptionChange={setEmptyDescription}
                    onTranslationChange={(fieldName, languageCode, nextValue) =>
                      updateLocalizedTextTranslations(
                        fieldName === "name"
                          ? setEmptyNameTranslations
                          : setEmptyDescriptionTranslations,
                        languageCode,
                        nextValue
                      )
                    }
                  />
                }
                validationError={validationError}
                isPending={isPending}
                onCancel={() => handleOpenChange(false)}
                onSubmit={handleCreateSubmit}
              />
            </TabsContent>

            <TabsContent value="import" className="mt-0">
              <ModuleJsonImportForm
                fileInputRef={fileInputRef}
                importFile={importFile}
                metadataEditor={
                  <ModuleMetadataEditor
                    ontologyId={ontologyId}
                    languages={languages}
                    defaultLanguage={defaultLanguage}
                    editorKey="import-module-metadata"
                    name={importName}
                    nameTranslations={importNameTranslations}
                    namePlaceholder="Imported module name"
                    description={importDescription}
                    descriptionTranslations={importDescriptionTranslations}
                    descriptionPlaceholder="No description"
                    onNameChange={setImportName}
                    onDescriptionChange={setImportDescription}
                    onTranslationChange={(fieldName, languageCode, nextValue) =>
                      updateLocalizedTextTranslations(
                        fieldName === "name"
                          ? setImportNameTranslations
                          : setImportDescriptionTranslations,
                        languageCode,
                        nextValue
                      )
                    }
                  />
                }
                warningCount={importWarnings.length}
                validationError={validationError}
                isPending={isPending}
                onFileChange={handleImportFileChange}
                onCancel={() => handleOpenChange(false)}
                onSubmit={handleImportSubmit}
              />
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      <ModuleImportConfirmationDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        warnings={importWarnings}
        isPending={isPending}
        onConfirm={() => {
          void performImport(true)
        }}
      />
    </>
  )
}
