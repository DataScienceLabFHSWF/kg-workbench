"use server"

import { assertOntologyDocumentAccess } from "@/server/group-access"
import { getDb } from "@/server/database"
import {
  ontologyClassPositions,
  ontologyModuleLayout,
} from "@/server/db/schema"
import { eq } from "drizzle-orm"

import type { ClassPositionsByModule, ModuleLayoutMap } from "./types"

export async function getClassPositions(
  ontologyId: string
): Promise<ClassPositionsByModule> {
  const db = getDb()
  await assertOntologyDocumentAccess(ontologyId, db)
  const data = await db
    .select({
      class_id: ontologyClassPositions.class_id,
      module_id: ontologyClassPositions.module_id,
      x: ontologyClassPositions.x,
      y: ontologyClassPositions.y,
    })
    .from(ontologyClassPositions)
    .where(eq(ontologyClassPositions.ontology_id, ontologyId))
  const result: ClassPositionsByModule = {}
  for (const row of data) {
    if (!result[row.module_id]) result[row.module_id] = {}
    result[row.module_id][row.class_id] = { x: row.x, y: row.y }
  }
  return result
}

export async function getModuleLayouts(
  ontologyId: string
): Promise<ModuleLayoutMap> {
  const db = getDb()
  await assertOntologyDocumentAccess(ontologyId, db)
  const data = await db
    .select({
      module_id: ontologyModuleLayout.module_id,
      x: ontologyModuleLayout.x,
      y: ontologyModuleLayout.y,
      width: ontologyModuleLayout.width,
      height: ontologyModuleLayout.height,
    })
    .from(ontologyModuleLayout)
    .where(eq(ontologyModuleLayout.ontology_id, ontologyId))
  const result: ModuleLayoutMap = {}
  for (const row of data) {
    result[row.module_id] = {
      x: row.x,
      y: row.y,
      width: row.width,
      height: row.height,
    }
  }
  return result
}
