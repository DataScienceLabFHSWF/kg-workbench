"use client"

import { useState, type FormEvent } from "react"
import { toast } from "sonner"

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
import {
  buildLocalizedTextInputs,
  updateLocalizedTextTranslations,
} from "@/lib/localized-text-utils"
import { createRelation } from "@/features/ontology/server/actions/relations"
import { LocalizedTextEditor } from "../../shared/localized-text-editor/localized-text-editor"

import { RelationClassField } from "./relation-class-field"
import type { CreateRelationDialogProps } from "./types"

export type { CreateRelationDialogProps } from "./types"

const NONE = "__none__"

const CARDINALITY_OPTIONS = [
  { value: "one-to-one", label: "One to One" },
  { value: "one-to-many", label: "One to Many" },
  { value: "many-to-many", label: "Many to Many" },
] as const

export function CreateRelationDialog({
  ontologyId,
  allClasses,
  modules,
  languages,
  defaultLanguage,
  currentModuleId,
  open,
  onOpenChange,
  onSuccess,
}: CreateRelationDialogProps) {
  const [name, setName] = useState("")
  const [nameTranslations, setNameTranslations] = useState<
    Record<string, string>
  >({})
  const [domainClassId, setDomainClassId] = useState("")
  const [rangeClassId, setRangeClassId] = useState("")
  const [description, setDescription] = useState("")
  const [descriptionTranslations, setDescriptionTranslations] = useState<
    Record<string, string>
  >({})
  const [inverseName, setInverseName] = useState("")
  const [inverseNameTranslations, setInverseNameTranslations] = useState<
    Record<string, string>
  >({})
  const [cardinality, setCardinality] = useState<string>(NONE)

  const [nameError, setNameError] = useState<string | null>(null)
  const [domainError, setDomainError] = useState<string | null>(null)
  const [rangeError, setRangeError] = useState<string | null>(null)
  const [isPending, setIsPending] = useState(false)
  const canCreateRelation = Boolean(
    name.trim() && domainClassId && rangeClassId
  )

  function reset() {
    setName("")
    setNameTranslations({})
    setDomainClassId("")
    setRangeClassId("")
    setDescription("")
    setDescriptionTranslations({})
    setInverseName("")
    setInverseNameTranslations({})
    setCardinality(NONE)
    setNameError(null)
    setDomainError(null)
    setRangeError(null)
  }

  function handleOpenChange(value: boolean) {
    if (!value) reset()
    onOpenChange(value)
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()

    let valid = true
    const trimmedName = name.trim()

    if (!trimmedName) {
      setNameError("Name is required.")
      valid = false
    } else {
      setNameError(null)
    }

    if (!domainClassId) {
      setDomainError("Domain class is required.")
      valid = false
    } else {
      setDomainError(null)
    }

    if (!rangeClassId) {
      setRangeError("Range class is required.")
      valid = false
    } else {
      setRangeError(null)
    }

    if (!valid) return

    setIsPending(true)
    try {
      const result = await createRelation(ontologyId, {
        name: trimmedName,
        domainClassId,
        rangeClassId,
        description: description.trim() || undefined,
        inverseName: inverseName.trim() || null,
        cardinality: cardinality === NONE ? null : cardinality,
        localizedTexts: buildLocalizedTextInputs({
          name: nameTranslations,
          description: descriptionTranslations,
          inverseName: inverseNameTranslations,
        }),
      })
      reset()
      onSuccess(result.id)
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to create relation."
      )
    } finally {
      setIsPending(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Relation</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <RelationClassField
              label="Domain Class"
              value={domainClassId}
              error={domainError}
              allClasses={allClasses}
              modules={modules}
              currentModuleId={currentModuleId}
              onValueChange={(value) => {
                setDomainClassId(value)
                if (value) setDomainError(null)
              }}
            />

            <RelationClassField
              label="Range Class"
              value={rangeClassId}
              error={rangeError}
              allClasses={allClasses}
              modules={modules}
              currentModuleId={currentModuleId}
              onValueChange={(value) => {
                setRangeClassId(value)
                if (value) setRangeError(null)
              }}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="relation-cardinality">Cardinality</Label>
            <Select value={cardinality} onValueChange={setCardinality}>
              <SelectTrigger id="relation-cardinality">
                <SelectValue placeholder="None" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE}>None</SelectItem>
                {CARDINALITY_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <LocalizedTextEditor
            ontologyId={ontologyId}
            languages={languages}
            defaultLanguage={defaultLanguage}
            draftState={{
              editorKey: "create-relation-metadata",
              getValue: (fieldName, languageCode, isDefaultLanguage) => {
                if (fieldName === "name") {
                  return isDefaultLanguage
                    ? name
                    : (nameTranslations[languageCode] ?? "")
                }

                if (fieldName === "description") {
                  return isDefaultLanguage
                    ? description
                    : (descriptionTranslations[languageCode] ?? "")
                }

                return isDefaultLanguage
                  ? inverseName
                  : (inverseNameTranslations[languageCode] ?? "")
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

                  if (fieldName === "description") {
                    setDescription(nextValue)
                    return
                  }

                  setInverseName(nextValue)
                  return
                }

                updateLocalizedTextTranslations(
                  fieldName === "name"
                    ? setNameTranslations
                    : fieldName === "description"
                      ? setDescriptionTranslations
                      : setInverseNameTranslations,
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
                placeholder: "e.g. worksAt, hasParent",
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
              {
                name: "inverseName",
                label: "Inverse Name",
                canonicalValue: inverseName,
                placeholder: "e.g. employedBy",
                onSaveCanonical: async (nextValue) => {
                  setInverseName(nextValue)
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
            <Button type="submit" disabled={!canCreateRelation || isPending}>
              {isPending ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
