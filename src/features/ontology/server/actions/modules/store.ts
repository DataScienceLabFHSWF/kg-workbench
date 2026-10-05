import { eq } from "drizzle-orm"
import type { OntologyModule } from "@/domain/ontology"
import {
  assertOntologyDocumentAccess,
  assertOntologyRecordAccess,
} from "@/server/group-access"
import { getDb } from "@/server/database"
import { ontologyModules } from "@/server/db/schema"
import { normalizeComparableName } from "./shared"
async function getOntologyModuleRows(ontologyId: string) {
  const db = getDb()
  await assertOntologyDocumentAccess(ontologyId, db)
  return db
    .select({ id: ontologyModules.id, name: ontologyModules.name })
    .from(ontologyModules)
    .where(eq(ontologyModules.ontology_id, ontologyId))
}
export async function assertModuleNameAvailable(
  ontologyId: string,
  name: string,
  excludeId?: string
): Promise<string> {
  const trimmedName = name.trim()
  if (!trimmedName) throw new Error("Module name is required.")
  const modules = await getOntologyModuleRows(ontologyId)
  const normalized = normalizeComparableName(trimmedName)
  if (
    modules.some(
      (module) =>
        module.id !== excludeId &&
        normalizeComparableName(module.name) === normalized
    )
  )
    throw new Error(`Module "${trimmedName}" already exists.`)
  return trimmedName
}
export async function createUniqueModuleName(
  ontologyId: string,
  baseName: string
): Promise<string> {
  const trimmedBaseName = baseName.trim()
  const existingNames = new Set(
    (await getOntologyModuleRows(ontologyId)).map((module) =>
      normalizeComparableName(module.name)
    )
  )
  let candidate = trimmedBaseName
  let suffix = 2
  while (existingNames.has(normalizeComparableName(candidate)))
    candidate = `${trimmedBaseName} ${suffix++}`
  return candidate
}
export async function getModuleRecord(
  moduleId: string
): Promise<OntologyModule> {
  const db = getDb()
  await assertOntologyRecordAccess("ontology_modules", moduleId, db)
  const [row] = await db
    .select()
    .from(ontologyModules)
    .where(eq(ontologyModules.id, moduleId))
    .limit(1)
  if (!row) throw new Error("Module not found.")
  return row
}
