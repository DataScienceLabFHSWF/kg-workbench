"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"

import { ClassPicker } from "@/components/shared/class-picker"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { OntologyLanguage, OntologyModule } from "@/domain/ontology"
import {
  buildLocalizedTextInputs,
  updateLocalizedTextTranslations,
} from "@/lib/localized-text-utils"
import { LocalizedTextEditor } from "@/features/ontology/components/shared/localized-text-editor/localized-text-editor"
import { createClass } from "@/features/ontology/server/actions/classes"
import type { OntologyClassWithAttributes } from "@/features/ontology/server/queries"

const NONE = "__none__"

interface CreateClassDialogProps {
  ontologyId: string
  languages: OntologyLanguage[]
  defaultLanguage?: string | null
  modules: OntologyModule[]
  allClasses: OntologyClassWithAttributes[]
  defaultModuleId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: (classId: string) => void
}

export function CreateClassDialog({
  ontologyId,
  languages,
  defaultLanguage,
  modules,
  allClasses,
  defaultModuleId,
  open,
  onOpenChange,
  onSuccess,
}: CreateClassDialogProps) {
  const [name, setName] = useState("")
  const [nameTranslations, setNameTranslations] = useState<
    Record<string, string>
  >({})
  const [moduleId, setModuleId] = useState<string>(defaultModuleId ?? "")
  const [description, setDescription] = useState("")
  const [descriptionTranslations, setDescriptionTranslations] = useState<
    Record<string, string>
  >({})
  const [parentClassId, setParentClassId] = useState<string>(NONE)
  const [nameError, setNameError] = useState<string | null>(null)
  const [moduleError, setModuleError] = useState<string | null>(null)
  const [isPending, setIsPending] = useState(false)
  const canCreateClass = Boolean(name.trim() && moduleId)

  useEffect(() => {
    if (open) {
      setModuleId(defaultModuleId ?? "")
      setParentClassId(NONE)
    }
  }, [open, defaultModuleId])

  function reset() {
    setName("")
    setNameTranslations({})
    setModuleId(defaultModuleId ?? "")
    setDescription("")
    setDescriptionTranslations({})
    setParentClassId(NONE)
    setNameError(null)
    setModuleError(null)
  }

  function handleOpenChange(value: boolean) {
    if (!value) {
      reset()
    }
    onOpenChange(value)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    let valid = true
    const trimmedName = name.trim()

    if (!trimmedName) {
      setNameError("Name is required.")
      valid = false
    } else {
      setNameError(null)
    }

    if (!moduleId) {
      setModuleError("Module is required.")
      valid = false
    } else {
      setModuleError(null)
    }

    if (!valid) return

    setIsPending(true)
    try {
      const result = await createClass(ontologyId, moduleId, {
        name: trimmedName,
        description: description.trim() || undefined,
        parentClassId: parentClassId === NONE ? null : parentClassId,
        localizedTexts: buildLocalizedTextInputs({
          name: nameTranslations,
          description: descriptionTranslations,
        }),
      })
      reset()
      onSuccess(result.id)
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to create class."
      )
    } finally {
      setIsPending(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Class</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="class-module">Module</Label>
            <Select
              value={moduleId}
              onValueChange={(value) => {
                setModuleId(value)
                setParentClassId(NONE)
                if (value) {
                  setModuleError(null)
                }
              }}
            >
              <SelectTrigger id="class-module">
                <SelectValue placeholder="Select module..." />
              </SelectTrigger>
              <SelectContent>
                {modules.map((module) => (
                  <SelectItem key={module.id} value={module.id}>
                    {module.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {moduleError ? (
              <p className="text-xs text-destructive">{moduleError}</p>
            ) : null}
          </div>

          <div className="space-y-1.5">
            <Label>Parent Class</Label>
            <ClassPicker
              value={parentClassId}
              onValueChange={setParentClassId}
              allClasses={allClasses}
              modules={modules}
              currentModuleId={moduleId || null}
              noneOption={{ label: "None (root class)", value: NONE }}
            />
          </div>

          <LocalizedTextEditor
            ontologyId={ontologyId}
            languages={languages}
            defaultLanguage={defaultLanguage}
            draftState={{
              editorKey: "create-class-metadata",
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
                    setName(nextValue)
                    if (nextValue.trim()) {
                      setNameError(null)
                    }
                    return
                  }

                  setDescription(nextValue)
                  return
                }

                updateLocalizedTextTranslations(
                  fieldName === "name"
                    ? setNameTranslations
                    : setDescriptionTranslations,
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
                placeholder: "e.g. Person, Organization",
                onSaveCanonical: async (nextValue) => {
                  setName(nextValue)
                  if (nextValue.trim()) {
                    setNameError(null)
                  }
                },
              },
              {
                name: "description",
                label: "Description",
                canonicalValue: description,
                multiline: true,
                placeholder: "Optional description...",
                onSaveCanonical: async (nextValue) => {
                  setDescription(nextValue)
                },
              },
            ]}
          />
          {nameError ? (
            <p className="text-xs text-destructive">{nameError}</p>
          ) : null}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!canCreateClass || isPending}>
              {isPending ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
