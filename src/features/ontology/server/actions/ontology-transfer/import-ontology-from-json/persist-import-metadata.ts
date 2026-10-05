import type { ImportOntology } from "@/features/ontology/schemas/import"
import { ontologyLocalizedTexts, ontologyNotes } from "@/server/db/schema"
import type { ImportIdMaps, ServerClient } from "./shared-types"
import {
  resolveLocalizedTextInsert,
  resolveNoteInsert,
} from "./resolve-import-inserts"
export async function persistImportMetadata({
  db,
  ontologyId,
  parsed,
  idMaps,
  warnings,
}: {
  db: ServerClient
  ontologyId: string
  parsed: ImportOntology
  idMaps: ImportIdMaps
  warnings: string[]
}) {
  const texts = parsed.localizedTexts.flatMap((text) => {
    const insert = resolveLocalizedTextInsert({
      localizedText: text,
      ontologyId,
      warnings,
      ...idMaps,
    })
    return insert ? [insert] : []
  })
  if (texts.length) await db.insert(ontologyLocalizedTexts).values(texts)
  const notes = parsed.notes.flatMap((note) => {
    const insert = resolveNoteInsert({ note, ontologyId, warnings, ...idMaps })
    return insert ? [insert] : []
  })
  if (notes.length) await db.insert(ontologyNotes).values(notes)
}
