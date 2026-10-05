import type {
  OntologyLanguage,
  OntologyLocalizedText,
  OntologyModule,
  OntologyRelation,
} from "@/domain/ontology"
import type { OntologyClassWithAttributes } from "@/features/ontology/server/queries"
import { ALL_LANGUAGES_EXPORT } from "@/features/ontology/utils/export-language"

import type {
  ExportLanguageOption,
  MissingTranslationEntry,
  MissingTranslationGroup,
  MissingTranslationSummary,
} from "./types"

const CLASS_FIELDS = [
  { name: "name", label: "name" },
  { name: "description", label: "description" },
] as const

const RELATION_FIELDS = [
  { name: "name", label: "name" },
  { name: "description", label: "description" },
  { name: "inverseName", label: "inverse name" },
] as const

const ATTRIBUTE_FIELDS = [
  { name: "name", label: "name" },
  { name: "description", label: "description" },
] as const

function createLocalizedTextKey(
  targetType:
    | "ontology"
    | "module"
    | "class"
    | "relation"
    | "attribute"
    | "relation_attribute"
    | "cq",
  targetId: string,
  fieldName: string,
  languageCode: string
) {
  return `${targetType}:${targetId}:${fieldName}:${languageCode}`
}

function buildLocalizedTextMap(localizedTexts: OntologyLocalizedText[]) {
  return new Map(
    localizedTexts.map((text) => {
      const targetId =
        text.target_ontology_id ??
        text.target_module_id ??
        text.target_class_id ??
        text.target_relation_id ??
        text.target_attribute_id ??
        text.target_relation_attribute_id ??
        text.target_cq_id

      let targetType:
        | "ontology"
        | "module"
        | "class"
        | "relation"
        | "attribute"
        | "relation_attribute"
        | "cq"

      if (text.target_ontology_id) targetType = "ontology"
      else if (text.target_module_id) targetType = "module"
      else if (text.target_class_id) targetType = "class"
      else if (text.target_relation_id) targetType = "relation"
      else if (text.target_attribute_id) targetType = "attribute"
      else if (text.target_relation_attribute_id)
        targetType = "relation_attribute"
      else targetType = "cq"

      return [
        createLocalizedTextKey(
          targetType,
          targetId ?? "",
          text.field_name,
          text.language_code
        ),
        text.value,
      ] as const
    })
  )
}

function hasLocalizedValue(
  localizedTextMap: Map<string, string>,
  targetType: "ontology" | "module" | "class" | "relation" | "attribute",
  targetId: string,
  fieldName: string,
  languageCode: string
) {
  return Boolean(
    localizedTextMap
      .get(
        createLocalizedTextKey(targetType, targetId, fieldName, languageCode)
      )
      ?.trim()
  )
}

function groupEntries(
  entries: Array<{ moduleLabel: string; entry: MissingTranslationEntry }>
) {
  const groups = new Map<string, MissingTranslationGroup>()

  for (const { moduleLabel, entry } of entries) {
    const existing = groups.get(moduleLabel)
    if (existing) {
      existing.entries.push(entry)
      continue
    }

    groups.set(moduleLabel, {
      moduleLabel,
      entries: [entry],
    })
  }

  return Array.from(groups.values()).sort((left, right) =>
    left.moduleLabel.localeCompare(right.moduleLabel)
  )
}

function getModuleLabel(
  moduleById: Map<string, OntologyModule>,
  moduleId: string | null
) {
  if (!moduleId) return "No module"
  return moduleById.get(moduleId)?.name ?? "Unknown module"
}

function getRelationModuleLabel(
  relation: OntologyRelation,
  classById: Map<string, OntologyClassWithAttributes>,
  moduleById: Map<string, OntologyModule>
) {
  const domainModuleId =
    classById.get(relation.domain_class_id)?.module_id ?? null
  const rangeModuleId =
    classById.get(relation.range_class_id)?.module_id ?? null
  const domainLabel = getModuleLabel(moduleById, domainModuleId)
  const rangeLabel = getModuleLabel(moduleById, rangeModuleId)

  return domainLabel === rangeLabel
    ? domainLabel
    : `${domainLabel} -> ${rangeLabel}`
}

export function getExportLanguageOptions({
  defaultLanguage,
  languages,
}: {
  defaultLanguage: string
  languages: OntologyLanguage[]
}) {
  const options = new Map<string, ExportLanguageOption>()

  options.set(ALL_LANGUAGES_EXPORT, {
    code: ALL_LANGUAGES_EXPORT,
    label: "All languages",
  })

  for (const language of languages) {
    options.set(language.language_code, {
      code: language.language_code,
      label: language.label || language.language_code,
    })
  }

  if (!options.has(defaultLanguage)) {
    options.set(defaultLanguage, {
      code: defaultLanguage,
      label: defaultLanguage,
    })
  }

  return Array.from(options.values()).sort((left, right) =>
    left.label.localeCompare(right.label)
  )
}

export function getMissingTranslationSummary({
  classes,
  defaultLanguage,
  exportLanguage,
  localizedTexts,
  modules,
  ontologyId,
  ontologyUsecase,
  relations,
  selectedClassIds,
  selectedRelationIds,
}: {
  classes: OntologyClassWithAttributes[]
  defaultLanguage: string
  exportLanguage: string
  localizedTexts: OntologyLocalizedText[]
  modules: OntologyModule[]
  ontologyId: string
  ontologyUsecase: string
  relations: OntologyRelation[]
  selectedClassIds: Set<string>
  selectedRelationIds: string[]
}) {
  if (
    exportLanguage === defaultLanguage ||
    exportLanguage === ALL_LANGUAGES_EXPORT
  ) {
    return null
  }

  const localizedTextMap = buildLocalizedTextMap(localizedTexts)
  const moduleById = new Map(modules.map((module) => [module.id, module]))
  const classById = new Map(classes.map((cls) => [cls.id, cls]))
  const selectedRelationIdSet = new Set(selectedRelationIds)

  let totalMissingValues = 0
  let otherCount = 0

  const classEntries: Array<{
    moduleLabel: string
    entry: MissingTranslationEntry
  }> = []
  for (const cls of classes) {
    if (!selectedClassIds.has(cls.id)) continue

    const missingFields = CLASS_FIELDS.filter(
      (field) =>
        !hasLocalizedValue(
          localizedTextMap,
          "class",
          cls.id,
          field.name,
          exportLanguage
        )
    ).map((field) => field.label)

    totalMissingValues += missingFields.length

    if (missingFields.length > 0) {
      classEntries.push({
        moduleLabel: getModuleLabel(moduleById, cls.module_id),
        entry: {
          id: cls.id,
          label: cls.name,
          missingFields,
        },
      })
    }

    for (const attribute of cls.attributes) {
      for (const field of ATTRIBUTE_FIELDS) {
        if (
          !hasLocalizedValue(
            localizedTextMap,
            "attribute",
            attribute.id,
            field.name,
            exportLanguage
          )
        ) {
          totalMissingValues += 1
          otherCount += 1
        }
      }
    }
  }

  const relationEntries: Array<{
    moduleLabel: string
    entry: MissingTranslationEntry
  }> = []
  for (const relation of relations) {
    if (!selectedRelationIdSet.has(relation.id)) continue

    const missingFields = RELATION_FIELDS.filter(
      (field) =>
        (field.name !== "inverseName" ||
          Boolean(relation.inverse_name?.trim())) &&
        !hasLocalizedValue(
          localizedTextMap,
          "relation",
          relation.id,
          field.name,
          exportLanguage
        )
    ).map((field) => field.label)

    totalMissingValues += missingFields.length

    if (missingFields.length > 0) {
      relationEntries.push({
        moduleLabel: getRelationModuleLabel(relation, classById, moduleById),
        entry: {
          id: relation.id,
          label: relation.name,
          missingFields,
        },
      })
    }
  }

  if (
    !hasLocalizedValue(
      localizedTextMap,
      "ontology",
      ontologyId,
      "name",
      exportLanguage
    )
  ) {
    totalMissingValues += 1
    otherCount += 1
  }

  if (
    ontologyUsecase.trim() &&
    !hasLocalizedValue(
      localizedTextMap,
      "ontology",
      ontologyId,
      "usecase",
      exportLanguage
    )
  ) {
    totalMissingValues += 1
    otherCount += 1
  }

  for (const ontologyModule of modules) {
    if (
      !hasLocalizedValue(
        localizedTextMap,
        "module",
        ontologyModule.id,
        "name",
        exportLanguage
      )
    ) {
      totalMissingValues += 1
      otherCount += 1
    }
  }

  if (totalMissingValues === 0) return null

  return {
    totalMissingValues,
    classCount: classEntries.length,
    relationCount: relationEntries.length,
    otherCount,
    classGroups: groupEntries(classEntries),
    relationGroups: groupEntries(relationEntries),
  } satisfies MissingTranslationSummary
}

export function formatMissingTranslationSummary(
  summary: MissingTranslationSummary,
  languageLabel: string
) {
  const itemParts = [
    summary.classCount > 0
      ? `${summary.classCount} ${summary.classCount === 1 ? "class" : "classes"}`
      : null,
    summary.relationCount > 0
      ? `${summary.relationCount} ${summary.relationCount === 1 ? "relation" : "relations"}`
      : null,
  ].filter((part): part is string => Boolean(part))

  const itemText =
    itemParts.length > 0 ? ` across ${itemParts.join(" and ")}` : ""

  return `${summary.totalMissingValues} missing values for ${languageLabel}${itemText}.`
}
