"use client"

import { useState, useTransition } from "react"
import { Check, Info, Trash2 } from "lucide-react"
import { toast } from "sonner"

import type { OntologyLanguage } from "@/domain/ontology"
import {
  deleteLanguage,
  updateLanguage,
} from "@/features/ontology/server/actions/languages"
import { updateOntologyDocument } from "@/features/ontology/server/actions/ontology-documents"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { TableCell, TableRow } from "@/components/ui/table"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface LanguageRowProps {
  language: OntologyLanguage
  isDefault: boolean
  ontologyId: string
}

const DEFAULT_LANGUAGE_TOOLTIP =
  "The default language decides which text is shown first across ontology fields. Switching it does not move old default-language values to the new one automatically."

export function LanguageRow({
  language,
  isDefault,
  ontologyId,
}: LanguageRowProps) {
  const [label, setLabel] = useState(language.label)
  const [isSavingLabel, startSaveLabel] = useTransition()
  const [isDeleting, startDelete] = useTransition()
  const [isMakingDefault, startMakeDefault] = useTransition()

  const labelChanged = label !== language.label

  function handleSaveLabel() {
    startSaveLabel(async () => {
      try {
        await updateLanguage(language.id, label)
        toast.success("Label saved.")
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Save failed.")
      }
    })
  }

  function handleMakeDefault() {
    startMakeDefault(async () => {
      try {
        await updateOntologyDocument(ontologyId, {
          defaultLanguage: language.language_code,
        })
        toast.success(
          `"${language.language_code}" is now the default language.`
        )
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Save failed.")
      }
    })
  }

  function handleDelete() {
    startDelete(async () => {
      try {
        await deleteLanguage(language.id)
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Delete failed.")
      }
    })
  }

  return (
    <TableRow>
      <TableCell className="text-sm">{language.language_code}</TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <Input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            className="h-7 w-40"
            disabled={isSavingLabel}
          />
          {labelChanged && (
            <Button
              size="sm"
              variant="outline"
              className="h-7"
              onClick={handleSaveLabel}
              disabled={isSavingLabel}
            >
              <Check className="mr-1 size-3" />
              Save
            </Button>
          )}
        </div>
      </TableCell>
      <TableCell>
        {isDefault ? (
          <div className="flex items-center gap-1">
            <Badge variant="secondary">Default</Badge>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  className="shrink-0 text-muted-foreground"
                  aria-label="Explain default language"
                >
                  <Info className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top" align="start" className="max-w-80">
                {DEFAULT_LANGUAGE_TOOLTIP}
              </TooltipContent>
            </Tooltip>
          </div>
        ) : (
          <Button
            size="sm"
            variant="ghost"
            className="h-7 px-3 text-xs"
            onClick={handleMakeDefault}
            disabled={isMakingDefault}
          >
            Make default
          </Button>
        )}
      </TableCell>
      <TableCell>
        <Button
          size="icon"
          variant="ghost"
          className="size-7"
          onClick={handleDelete}
          disabled={isDefault || isDeleting}
          title={
            isDefault ? "Cannot delete the default language" : "Delete language"
          }
        >
          <Trash2 className="size-3.5" />
        </Button>
      </TableCell>
    </TableRow>
  )
}
