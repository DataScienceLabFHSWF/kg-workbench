import type {
  ImportModule,
  ImportOntology,
} from "@/features/ontology/schemas/import"

export function normalizeModuleName(
  name: string | null | undefined
): string | null {
  const trimmed = name?.trim()
  return trimmed ? trimmed : null
}

function collectImportModuleNames(parsed: ImportOntology): string[] {
  return [
    ...new Set(
      [
        ...parsed.classes.map((cls) => normalizeModuleName(cls.module)),
        ...(parsed.visual?.moduleLayouts ?? []).map((layout) =>
          normalizeModuleName(layout.module)
        ),
      ].filter((moduleName): moduleName is string => Boolean(moduleName))
    ),
  ]
}

export function collectImportModules(parsed: ImportOntology): ImportModule[] {
  if (parsed.modules.length > 0) {
    return parsed.modules
  }

  return collectImportModuleNames(parsed).map((name, index) => ({
    id: `legacy-module-${index + 1}`,
    name,
    description: "",
  }))
}

export function resolveImportedModuleId({
  moduleId,
  moduleName,
  moduleIdByLegacyId,
  moduleIdByName,
}: {
  moduleId?: string | null
  moduleName?: string | null
  moduleIdByLegacyId: Map<string, string>
  moduleIdByName: Map<string, string>
}) {
  if (moduleId) {
    const resolvedById = moduleIdByLegacyId.get(moduleId)
    if (resolvedById) return resolvedById
  }

  const normalizedName = normalizeModuleName(moduleName)
  return normalizedName ? (moduleIdByName.get(normalizedName) ?? null) : null
}
