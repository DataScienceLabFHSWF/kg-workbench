import { revalidatePath } from "next/cache"
import { ImportOntologySchema } from "@/features/ontology/schemas/import"
import { routes } from "@/lib/routes"
import { getDb } from "@/server/database"
import { appendVisualInserts } from "./append-visual-inserts"
import { persistCompetencyQuestions } from "./persist-competency-questions"
import { persistImportExamples } from "./persist-import-examples"
import { persistImportMetadata } from "./persist-import-metadata"
import { persistOntologyStructure } from "./persist-ontology-structure"
import type { ImportOntologyFromJsonResult } from "../types"
export async function importOntologyFromJsonInternal(
  file: File
): Promise<ImportOntologyFromJsonResult> {
  const parsed = ImportOntologySchema.parse(
      JSON.parse(await file.text()) as unknown
    ),
    warnings: string[] = [],
    db = getDb()
  const { ontologyId, idMaps } = await persistOntologyStructure({
    db,
    parsed,
    fileName: file.name,
    warnings,
  })
  const pendingCQExampleRefs = await persistCompetencyQuestions({
    db,
    ontologyId,
    parsed,
    idMaps,
    warnings,
  })
  await persistImportMetadata({ db, ontologyId, parsed, idMaps, warnings })
  await persistImportExamples({
    db,
    ontologyId,
    parsed,
    idMaps,
    pendingCQExampleRefs,
    warnings,
  })
  if (parsed.visual)
    await appendVisualInserts({ db, ontologyId, parsed, warnings, idMaps })
  revalidatePath(routes.ontology.root)
  return { ontologyId, warnings }
}
