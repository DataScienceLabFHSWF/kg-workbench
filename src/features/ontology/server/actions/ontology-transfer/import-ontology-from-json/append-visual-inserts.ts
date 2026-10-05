import type { ImportOntology } from "@/features/ontology/schemas/import"
import {
  ontologyClassPositions,
  ontologyModuleLayout,
} from "@/server/db/schema"
import { resolveImportedModuleId } from "../helpers"
import type { ImportIdMaps, ServerClient } from "./shared-types"
export async function appendVisualInserts({
  db,
  ontologyId,
  parsed,
  warnings,
  idMaps,
}: {
  db: ServerClient
  ontologyId: string
  parsed: ImportOntology
  warnings: string[]
  idMaps: ImportIdMaps
}) {
  const moduleLayouts =
    parsed.visual?.moduleLayouts.flatMap((layout) => {
      const moduleId = resolveImportedModuleId({
        moduleId: layout.moduleId,
        moduleName: layout.module,
        moduleIdByLegacyId: idMaps.moduleIdByLegacyId,
        moduleIdByName: idMaps.moduleIdByName,
      })
      if (!moduleId) {
        warnings.push(
          `Skipped module layout for unknown module "${layout.module}".`
        )
        return []
      }
      return [
        {
          ontology_id: ontologyId,
          module_id: moduleId,
          x: layout.x,
          y: layout.y,
          width: layout.width,
          height: layout.height,
        },
      ]
    }) ?? []
  if (moduleLayouts.length)
    await db.insert(ontologyModuleLayout).values(moduleLayouts)
  const classPositions =
    parsed.visual?.classPositions.flatMap((position) => {
      const moduleId = resolveImportedModuleId({
        moduleId: position.moduleId,
        moduleName: position.module,
        moduleIdByLegacyId: idMaps.moduleIdByLegacyId,
        moduleIdByName: idMaps.moduleIdByName,
      })
      const classId = idMaps.oldClassIdToNewId.get(position.classId),
        classModuleId = idMaps.oldClassIdToNewModuleId.get(position.classId)
      if (!classId) {
        warnings.push(
          `Skipped class position for unknown class "${position.classId}".`
        )
        return []
      }
      if (!moduleId) {
        warnings.push(
          `Skipped class position for class "${position.classId}" because module "${position.module}" is unknown.`
        )
        return []
      }
      if (classModuleId && classModuleId !== moduleId) {
        warnings.push(
          `Skipped class position for class "${position.classId}" because it does not belong to module "${position.module}".`
        )
        return []
      }
      return [
        {
          ontology_id: ontologyId,
          class_id: classId,
          module_id: moduleId,
          x: position.x,
          y: position.y,
        },
      ]
    }) ?? []
  if (classPositions.length)
    await db.insert(ontologyClassPositions).values(classPositions)
}
