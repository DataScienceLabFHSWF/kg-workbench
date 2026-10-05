import { ModuleTransferSchema } from "@/features/ontology/schemas/module-transfer"

type ModuleTransferPayload = ReturnType<typeof ModuleTransferSchema.parse>

export function getFileBaseName(fileName: string) {
  return fileName.replace(/\.json$/i, "").trim()
}

export async function parseModuleJsonFile(file: File) {
  return ModuleTransferSchema.parse(JSON.parse(await file.text()) as unknown)
}

export function analyzeModuleImportWarnings(payload: ModuleTransferPayload) {
  const classIds = new Set(payload.classes.map((cls) => cls.id))
  const warnings: string[] = []

  for (const relation of payload.relations) {
    if (
      !classIds.has(relation.domainClassId) ||
      !classIds.has(relation.rangeClassId)
    ) {
      warnings.push(
        `Skipped relation "${relation.name}" because it references classes outside the uploaded module JSON.`
      )
    }
  }

  for (const cls of payload.classes) {
    if (cls.parentClassId && !classIds.has(cls.parentClassId)) {
      warnings.push(
        `Imported class "${cls.name}" without parent because "${cls.parentClassId}" is missing from the uploaded module JSON.`
      )
    }
  }

  return warnings
}
