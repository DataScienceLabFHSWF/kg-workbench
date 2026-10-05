"use server"
import { asc, eq, inArray } from "drizzle-orm"
import {
  assertOntologyDocumentAccess,
  assertOntologyRecordAccess,
} from "@/server/group-access"
import { getDb } from "@/server/database"
import { ontologyAttributes, ontologyClasses } from "@/server/db/schema"
import type { OntologyClassWithAttributes } from "./types"
async function loadClasses(
  where: ReturnType<typeof eq>
): Promise<OntologyClassWithAttributes[]> {
  const db = getDb()
  const classes = await db
    .select()
    .from(ontologyClasses)
    .where(where)
    .orderBy(asc(ontologyClasses.name))
  if (!classes.length) return []
  const attributes = await db
    .select()
    .from(ontologyAttributes)
    .where(
      inArray(
        ontologyAttributes.class_id,
        classes.map((cls) => cls.id)
      )
    )
  const attributesByClass = new Map<string, typeof attributes>()
  for (const attribute of attributes) {
    const values = attributesByClass.get(attribute.class_id) ?? []
    values.push(attribute)
    attributesByClass.set(attribute.class_id, values)
  }
  return classes.map((cls) => ({
    ...cls,
    attributes: attributesByClass.get(cls.id) ?? [],
  }))
}
export async function getOntologyClasses(
  ontologyId: string
): Promise<OntologyClassWithAttributes[]> {
  const db = getDb()
  await assertOntologyDocumentAccess(ontologyId, db)
  return loadClasses(eq(ontologyClasses.ontology_id, ontologyId))
}
export async function getOntologyClassesByModule(
  moduleId: string
): Promise<OntologyClassWithAttributes[]> {
  const db = getDb()
  await assertOntologyRecordAccess("ontology_modules", moduleId, db)
  return loadClasses(eq(ontologyClasses.module_id, moduleId))
}
export async function getOntologyClass(
  id: string
): Promise<OntologyClassWithAttributes> {
  const db = getDb()
  await assertOntologyRecordAccess("ontology_classes", id, db)
  const [cls] = await db
    .select()
    .from(ontologyClasses)
    .where(eq(ontologyClasses.id, id))
  if (!cls) throw new Error("Class not found.")
  const attributes = await db
    .select()
    .from(ontologyAttributes)
    .where(eq(ontologyAttributes.class_id, id))
  return { ...cls, attributes }
}
