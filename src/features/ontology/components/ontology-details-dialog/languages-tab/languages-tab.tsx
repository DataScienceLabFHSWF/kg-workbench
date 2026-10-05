"use client"

import { useState, useTransition } from "react"
import { toast } from "sonner"

import type { OntologyLanguage } from "@/domain/ontology"
import type { OntologyDocumentWithModules } from "@/features/ontology/server/queries"
import { createLanguage } from "@/features/ontology/server/actions/languages"
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { CreateLanguageRow } from "./create-language-row"
import { LanguageRow } from "./language-row"

interface LanguagesTabProps {
  ontology: OntologyDocumentWithModules
  languages: OntologyLanguage[]
}

export function LanguagesTab({ ontology, languages }: LanguagesTabProps) {
  const [newCode, setNewCode] = useState("")
  const [newLabel, setNewLabel] = useState("")
  const [isCreating, startCreate] = useTransition()

  const normalizedCode = newCode.trim().toLowerCase()
  const isDuplicateCode = languages.some(
    (l) => l.language_code === normalizedCode
  )

  function handleCreate() {
    if (!normalizedCode || isDuplicateCode) return
    startCreate(async () => {
      try {
        await createLanguage(
          ontology.id,
          normalizedCode,
          newLabel.trim() || normalizedCode
        )
        setNewCode("")
        setNewLabel("")
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Failed to add language."
        )
      }
    })
  }

  return (
    <div className="space-y-2 p-6">
      <div className="space-y-2">
        <h2 className="text-sm font-medium">Languages</h2>
        <Table className="w-auto">
          <TableHeader>
            <TableRow>
              <TableHead className="w-32">Code</TableHead>
              <TableHead className="w-[16rem]">Label</TableHead>
              <TableHead className="w-36">Default</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            <CreateLanguageRow
              code={newCode}
              label={newLabel}
              isCreating={isCreating}
              isDuplicateCode={isDuplicateCode}
              onCodeChange={setNewCode}
              onLabelChange={setNewLabel}
              onCreate={handleCreate}
            />
            {languages.map((lang) => (
              <LanguageRow
                key={lang.id}
                language={lang}
                isDefault={lang.language_code === ontology.default_language}
                ontologyId={ontology.id}
              />
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
