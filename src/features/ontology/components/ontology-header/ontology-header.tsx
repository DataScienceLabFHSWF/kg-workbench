"use client"

import { useRef, useState, type ChangeEvent } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Settings2 } from "lucide-react"
import { toast } from "sonner"

import { CreateOntologyDialog } from "@/features/ontology/components/dialogs/create-ontology-dialog"
import { ExportOntologyDialog } from "@/features/ontology/components/export-ontology-dialog/export-ontology-dialog"
import { ImportFormatDialog } from "@/features/ontology/components/import-format-dialog/import-format-dialog"
import type { ExportOntologyMode } from "@/features/ontology/components/export-ontology-dialog/types"
import { deleteOntologyDocument } from "@/features/ontology/server/actions/ontology-documents"
import { importOntologyFromJson } from "@/features/ontology/server/actions/ontology-transfer"
import { routes } from "@/lib/routes"
import type {
  OntologyDocument,
  OntologyLanguage,
  OntologyLocalizedText,
  OntologyRelation,
} from "@/domain/ontology"
import type {
  OntologyClassWithAttributes,
  OntologyDocumentWithModules,
} from "@/features/ontology/server/queries"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

import { DocumentSelector } from "./document-selector"
import { DeleteConfirmationDialog } from "./delete-confirmation-dialog"
import { CreateImportActions } from "./create-import-actions"
import { VisualToggle } from "./visual-toggle"

export interface OntologyHeaderProps {
  documents: OntologyDocument[]
  currentDocument: OntologyDocumentWithModules | null
  classes: OntologyClassWithAttributes[]
  relations: OntologyRelation[]
  languages: OntologyLanguage[]
  localizedTexts: OntologyLocalizedText[]
  isVisual: boolean
  onVisualToggle?: (checked: boolean) => void
  onOpenOntologyDetails?: () => void
}

export function OntologyHeader({
  documents,
  currentDocument,
  classes,
  relations,
  languages,
  localizedTexts,
  isVisual,
  onVisualToggle,
  onOpenOntologyDetails,
}: OntologyHeaderProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [isImporting, setIsImporting] = useState(false)
  const [createOpen, setCreateOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [exportOpen, setExportOpen] = useState(false)
  const [importFormatOpen, setImportFormatOpen] = useState(false)
  const [exportMode, setExportMode] = useState<ExportOntologyMode>("json")
  const [isDeleting, setIsDeleting] = useState(false)
  const hasCurrentDocument = currentDocument !== null

  function handleDocumentChange(docId: string) {
    const params = new URLSearchParams(searchParams.toString())
    params.set("doc", docId)
    router.push(`${routes.ontology.root}?${params.toString()}`)
  }

  function openExport(mode: ExportOntologyMode) {
    if (!currentDocument) return
    setExportMode(mode)
    setExportOpen(true)
  }

  async function handleDelete() {
    if (!currentDocument) return

    setIsDeleting(true)
    try {
      await deleteOntologyDocument(currentDocument.id)
      const remaining = documents.filter(
        (document) => document.id !== currentDocument.id
      )
      if (remaining.length > 0) {
        const params = new URLSearchParams()
        params.set("doc", remaining[0].id)
        router.push(`${routes.ontology.root}?${params.toString()}`)
      } else {
        router.push(routes.ontology.root)
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Delete failed.")
    } finally {
      setIsDeleting(false)
      setDeleteOpen(false)
    }
  }

  async function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    // Reset input so the same file can be re-selected if needed.
    e.target.value = ""

    setIsImporting(true)
    try {
      const { ontologyId, warnings } = await importOntologyFromJson(file)
      if (warnings.length > 0) {
        toast.warning("Imported with visual warnings.", {
          description: warnings.slice(0, 3).join(" "),
        })
      }
      const params = new URLSearchParams()
      params.set("doc", ontologyId)
      router.push(`${routes.ontology.root}?${params.toString()}`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Import failed.")
    } finally {
      setIsImporting(false)
    }
  }

  return (
    <div className="flex items-center gap-3 border-b px-4 py-2">
      <h1 className="font-heading text-lg font-semibold">Ontology</h1>

      <DocumentSelector
        documents={documents}
        currentDocumentId={currentDocument?.id ?? null}
        disabled={!hasCurrentDocument}
        placeholder={
          hasCurrentDocument ? "Select ontology" : "No ontology selected"
        }
        onDocumentChange={handleDocumentChange}
      />

      <CreateImportActions
        fileInputRef={fileInputRef}
        isBusy={isImporting}
        hasCurrentDocument={hasCurrentDocument}
        onCreate={() => setCreateOpen(true)}
        onImport={() => fileInputRef.current?.click()}
        onOpenImportFormat={() => setImportFormatOpen(true)}
        onExportJson={() => openExport("json")}
        onExportOwl={() => openExport("owl")}
        onDelete={() => setDeleteOpen(true)}
        onFileChange={handleFileChange}
      />

      <CreateOntologyDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSuccess={(docId) => {
          const params = new URLSearchParams()
          params.set("doc", docId)
          router.push(`${routes.ontology.root}?${params.toString()}`)
        }}
      />

      <ImportFormatDialog
        open={importFormatOpen}
        onOpenChange={setImportFormatOpen}
      />

      {currentDocument && (
        <ExportOntologyDialog
          open={exportOpen}
          onOpenChange={setExportOpen}
          mode={exportMode}
          ontologyId={currentDocument.id}
          ontologyName={currentDocument.name}
          defaultLanguage={currentDocument.default_language}
          localizedTexts={localizedTexts}
          languages={languages}
          modules={currentDocument.modules}
          ontologyUsecase={currentDocument.usecase}
          classes={classes}
          relations={relations}
        />
      )}

      {currentDocument && (
        <DeleteConfirmationDialog
          open={deleteOpen}
          onOpenChange={setDeleteOpen}
          onConfirm={handleDelete}
          isDeleting={isDeleting}
          documentName={currentDocument.name}
        />
      )}

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            disabled={!hasCurrentDocument}
            onClick={onOpenOntologyDetails}
          >
            <Settings2 className="size-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Ontology details</TooltipContent>
      </Tooltip>

      <VisualToggle
        isVisual={hasCurrentDocument && isVisual}
        disabled={!hasCurrentDocument}
        onVisualToggle={onVisualToggle ?? (() => undefined)}
      />
    </div>
  )
}
