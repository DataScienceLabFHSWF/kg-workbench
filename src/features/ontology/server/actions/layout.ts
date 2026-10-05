"use server"

import {
  assertOntologyDocumentAccess,
  assertOntologyRecordAccess,
} from "@/server/group-access"
import { getDb } from "@/server/database"
import {
  ontologyClassPositions,
  ontologyModuleLayout,
} from "@/server/db/schema"

export async function saveModuleLayout(
  ontologyId: string,
  moduleId: string,
  x: number,
  y: number,
  width: number,
  height: number
): Promise<void> {
  const db = getDb()
  await assertOntologyDocumentAccess(ontologyId, db)
  await assertOntologyRecordAccess("ontology_modules", moduleId, db)
  await db
    .insert(ontologyModuleLayout)
    .values({
      ontology_id: ontologyId,
      module_id: moduleId,
      x,
      y,
      width,
      height,
    })
    .onConflictDoUpdate({
      target: ontologyModuleLayout.module_id,
      set: { ontology_id: ontologyId, x, y, width, height },
    })
}

export async function saveClassPosition(
  ontologyId: string,
  classId: string,
  moduleId: string,
  x: number,
  y: number
): Promise<void> {
  const db = getDb()
  await assertOntologyDocumentAccess(ontologyId, db)
  await assertOntologyRecordAccess("ontology_classes", classId, db)
  await assertOntologyRecordAccess("ontology_modules", moduleId, db)
  await db
    .insert(ontologyClassPositions)
    .values({
      ontology_id: ontologyId,
      class_id: classId,
      module_id: moduleId,
      x,
      y,
    })
    .onConflictDoUpdate({
      target: [
        ontologyClassPositions.class_id,
        ontologyClassPositions.module_id,
      ],
      set: { ontology_id: ontologyId, x, y },
    })
}
