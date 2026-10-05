"use client"

import { useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { createOntologyDocument } from "@/features/ontology/server/actions/ontology-documents"

const DEFAULT_LANGUAGE_OPTIONS = [
  { code: "en", label: "English" },
  { code: "de", label: "German" },
  { code: "fr", label: "French" },
  { code: "es", label: "Spanish" },
  { code: "it", label: "Italian" },
] as const

interface CreateOntologyDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: (docId: string) => void
}

export function CreateOntologyDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreateOntologyDialogProps) {
  const [defaultLanguage, setDefaultLanguage] = useState("")
  const [name, setName] = useState("")
  const [usecase, setUsecase] = useState("")
  const [defaultLanguageError, setDefaultLanguageError] = useState<
    string | null
  >(null)
  const [nameError, setNameError] = useState<string | null>(null)
  const [isPending, setIsPending] = useState(false)
  const normalizedDefaultLanguage = defaultLanguage.trim().toLowerCase()
  const trimmedName = name.trim()
  const isCreateDisabled =
    isPending || !normalizedDefaultLanguage || !trimmedName

  function resolveDefaultLanguageLabel(languageCode: string) {
    return (
      DEFAULT_LANGUAGE_OPTIONS.find((option) => option.code === languageCode)
        ?.label ?? languageCode
    )
  }

  function handleOpenChange(value: boolean) {
    if (!value) {
      setDefaultLanguage("")
      setName("")
      setUsecase("")
      setDefaultLanguageError(null)
      setNameError(null)
    }
    onOpenChange(value)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (isCreateDisabled) {
      return
    }

    const trimmedUsecase = usecase.trim()
    if (!normalizedDefaultLanguage) {
      setDefaultLanguageError("Default language is required.")
      return
    }
    setDefaultLanguageError(null)
    if (!trimmedName) {
      setNameError("Name is required.")
      return
    }
    setNameError(null)
    setIsPending(true)

    try {
      const doc = await createOntologyDocument({
        defaultLanguage: normalizedDefaultLanguage,
        defaultLanguageLabel: resolveDefaultLanguageLabel(
          normalizedDefaultLanguage
        ),
        name: trimmedName,
        usecase: trimmedUsecase,
      })
      handleOpenChange(false)
      onSuccess(doc.id)
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to create ontology."
      )
    } finally {
      setIsPending(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>New Ontology</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="ontology-default-language">Default Language</Label>
            <Input
              id="ontology-default-language"
              list="ontology-default-language-options"
              value={defaultLanguage}
              onChange={(e) => {
                setDefaultLanguage(e.target.value)
                if (defaultLanguageError) {
                  setDefaultLanguageError(null)
                }
              }}
              placeholder="e.g. en"
              autoFocus
            />
            <datalist id="ontology-default-language-options">
              {DEFAULT_LANGUAGE_OPTIONS.map((option) => (
                <option key={option.code} value={option.code}>
                  {option.label}
                </option>
              ))}
            </datalist>
            {defaultLanguageError && (
              <p className="text-xs text-destructive">{defaultLanguageError}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="ontology-name">Name</Label>
            <Input
              id="ontology-name"
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                if (nameError) {
                  setNameError(null)
                }
              }}
              placeholder="e.g. My Ontology"
            />
            {nameError && (
              <p className="text-xs text-destructive">{nameError}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="ontology-usecase">Use Case</Label>
            <Textarea
              id="ontology-usecase"
              value={usecase}
              onChange={(e) => setUsecase(e.target.value)}
              placeholder="Describe the intended use case for this ontology"
              className="min-h-24"
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isCreateDisabled}>
              {isPending ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
