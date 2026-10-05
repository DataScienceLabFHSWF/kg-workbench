import { z } from "zod"

import {
  DEFAULT_ONTOLOGY_DATA_TYPE,
  normalizeOntologyDataType,
  ONTOLOGY_DATA_TYPE_IDS,
  type OntologyDataTypeId,
} from "@/features/ontology/utils/data-types"

export const IMPORT_LEGACY_ONTOLOGY_DATA_TYPE_IDS = [
  "string",
  "text",
  "number",
  "boolean",
  "date",
] as const

const CANONICAL_ONTOLOGY_DATA_TYPE_IDS = ONTOLOGY_DATA_TYPE_IDS as [
  OntologyDataTypeId,
  ...OntologyDataTypeId[],
]

const ImportAttributeDataTypeSchema = z
  .string()
  .trim()
  .transform((value, ctx) => {
    const normalized = normalizeOntologyDataType(value)

    if (!normalized) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Unsupported ontology datatype: ${value}`,
      })
      return z.NEVER
    }

    return normalized
  })

const ImportAttributeDataTypeJsonSchemaSource = z.union([
  z.enum(CANONICAL_ONTOLOGY_DATA_TYPE_IDS),
  z.enum(IMPORT_LEGACY_ONTOLOGY_DATA_TYPE_IDS),
])

const ImportAttributeDataTypeFieldSchema =
  ImportAttributeDataTypeSchema.default(DEFAULT_ONTOLOGY_DATA_TYPE)
const ImportAttributeDataTypeJsonSchemaFieldSource =
  ImportAttributeDataTypeJsonSchemaSource.default(DEFAULT_ONTOLOGY_DATA_TYPE)

function withJsonSchemaId<TSchema extends z.ZodTypeAny>(
  schema: TSchema,
  id: string,
  enabled: boolean
) {
  return enabled ? (schema.meta({ id }) as TSchema) : schema
}

function createImportSchemas<TDataTypeSchema extends z.ZodTypeAny>(
  dataTypeSchema: TDataTypeSchema,
  options: { includeJsonSchemaIds?: boolean } = {}
) {
  const includeJsonSchemaIds = options.includeJsonSchemaIds ?? false

  const ImportLanguageSchema = withJsonSchemaId(
    z.object({
      code: z.string(),
      label: z.string().default(""),
    }),
    "language",
    includeJsonSchemaIds
  )

  const ImportModuleRefSchema = withJsonSchemaId(
    z.object({
      id: z.string().optional(),
      name: z.string(),
      isCurrentModule: z.boolean().default(false),
    }),
    "moduleRef",
    includeJsonSchemaIds
  )

  const ImportLocalizedTextSchema = withJsonSchemaId(
    z.object({
      targetType: z.enum([
        "ontology",
        "module",
        "class",
        "relation",
        "attribute",
        "relation_attribute",
        "cq",
      ]),
      targetId: z.string(),
      fieldName: z.string(),
      languageCode: z.string(),
      value: z.string().default(""),
    }),
    "localizedText",
    includeJsonSchemaIds
  )

  const ImportModuleSchema = withJsonSchemaId(
    z.object({
      id: z.string(),
      name: z.string(),
      description: z.string().default(""),
    }),
    "module",
    includeJsonSchemaIds
  )

  const ImportAttributeSchema = withJsonSchemaId(
    z.object({
      id: z.string().optional(),
      name: z.string(),
      dataType: dataTypeSchema,
      required: z.boolean().default(false),
      description: z.string().default(""),
    }),
    "attribute",
    includeJsonSchemaIds
  )

  const ImportClassSchema = withJsonSchemaId(
    z.object({
      id: z.string(),
      name: z.string(),
      moduleId: z.string().nullable().optional(),
      module: z.string().nullable().optional(),
      description: z.string().default(""),
      parentClassId: z.string().nullable().optional(),
      attributes: z.array(ImportAttributeSchema).default([]),
    }),
    "class",
    includeJsonSchemaIds
  )

  const ImportRelationSchema = withJsonSchemaId(
    z.object({
      id: z.string().optional(),
      name: z.string(),
      domainClassId: z.string(),
      rangeClassId: z.string(),
      description: z.string().default(""),
      inverseName: z.string().nullable().optional(),
      cardinality: z.string().nullable().optional(),
    }),
    "relation",
    includeJsonSchemaIds
  )

  const ImportRelationAttributeSchema = withJsonSchemaId(
    z.object({
      id: z.string().optional(),
      relationId: z.string(),
      name: z.string(),
      dataType: dataTypeSchema,
      required: z.boolean().default(false),
      description: z.string().default(""),
      sortOrder: z.number().default(0),
    }),
    "relationAttribute",
    includeJsonSchemaIds
  )

  const ImportCompetencyQuestionSchema = withJsonSchemaId(
    z.object({
      id: z.string().optional(),
      question: z.string().default(""),
      subjectClassId: z.string().nullable().optional(),
      predicateRelationId: z.string().nullable().optional(),
      objectClassId: z.string().nullable().optional(),
      subjectExampleId: z.string().nullable().optional(),
      predicateExampleId: z.string().nullable().optional(),
      objectExampleId: z.string().nullable().optional(),
      sortOrder: z.number().default(0),
      modules: z.array(ImportModuleRefSchema).default([]),
    }),
    "competencyQuestion",
    includeJsonSchemaIds
  )

  const ImportNoteSchema = withJsonSchemaId(
    z.object({
      id: z.string().optional(),
      targetType: z.enum([
        "ontology",
        "module",
        "class",
        "relation",
        "attribute",
        "relation_attribute",
        "cq",
      ]),
      targetId: z.string(),
      body: z.string().default(""),
      authorName: z.string().default(""),
      sortOrder: z.number().default(0),
    }),
    "note",
    includeJsonSchemaIds
  )

  const ImportExampleSchema = withJsonSchemaId(
    z.object({
      id: z.string().optional(),
      targetType: z.enum([
        "class",
        "attribute",
        "relation",
        "relation_attribute",
        "cq",
      ]),
      targetId: z.string(),
      value: z.string().default(""),
      subjectLabel: z.string().nullable().optional(),
      predicateLabel: z.string().nullable().optional(),
      objectLabel: z.string().nullable().optional(),
      isInstanceCandidate: z.boolean().default(false),
      sortOrder: z.number().default(0),
    }),
    "example",
    includeJsonSchemaIds
  )

  const ImportVisualModuleLayoutSchema = withJsonSchemaId(
    z.object({
      moduleId: z.string().optional(),
      module: z.string(),
      x: z.number(),
      y: z.number(),
      width: z.number(),
      height: z.number(),
    }),
    "visualModuleLayout",
    includeJsonSchemaIds
  )

  const ImportVisualClassPositionSchema = withJsonSchemaId(
    z.object({
      classId: z.string(),
      moduleId: z.string().optional(),
      module: z.string(),
      x: z.number(),
      y: z.number(),
    }),
    "visualClassPosition",
    includeJsonSchemaIds
  )

  const ImportOntologyVisualSchema = withJsonSchemaId(
    z.object({
      moduleLayouts: z.array(ImportVisualModuleLayoutSchema).default([]),
      classPositions: z.array(ImportVisualClassPositionSchema).default([]),
    }),
    "visual",
    includeJsonSchemaIds
  )

  const ImportOntologySchema = z.object({
    defaultLanguage: z.string().default("en"),
    languages: z.array(ImportLanguageSchema).default([]),
    name: z.string(),
    usecase: z.string().default(""),
    version: z.string().nullable().optional(),
    modules: z.array(ImportModuleSchema).default([]),
    classes: z.array(ImportClassSchema),
    relations: z.array(ImportRelationSchema),
    relationAttributes: z.array(ImportRelationAttributeSchema).default([]),
    competencyQuestions: z.array(ImportCompetencyQuestionSchema).default([]),
    notes: z.array(ImportNoteSchema).default([]),
    examples: z.array(ImportExampleSchema).default([]),
    localizedTexts: z.array(ImportLocalizedTextSchema).default([]),
    visual: ImportOntologyVisualSchema.optional(),
  })

  return {
    ImportLanguageSchema,
    ImportModuleRefSchema,
    ImportLocalizedTextSchema,
    ImportModuleSchema,
    ImportAttributeSchema,
    ImportClassSchema,
    ImportRelationSchema,
    ImportRelationAttributeSchema,
    ImportCompetencyQuestionSchema,
    ImportNoteSchema,
    ImportExampleSchema,
    ImportVisualModuleLayoutSchema,
    ImportVisualClassPositionSchema,
    ImportOntologyVisualSchema,
    ImportOntologySchema,
  }
}

const runtimeImportSchemas = createImportSchemas(
  ImportAttributeDataTypeFieldSchema
)
const jsonSchemaImportSchemas = createImportSchemas(
  ImportAttributeDataTypeJsonSchemaFieldSource,
  { includeJsonSchemaIds: true }
)

export const ImportOntologyJsonSchemaSource =
  jsonSchemaImportSchemas.ImportOntologySchema

export const ImportLanguageSchema = runtimeImportSchemas.ImportLanguageSchema
export const ImportModuleRefSchema = runtimeImportSchemas.ImportModuleRefSchema
export const ImportLocalizedTextSchema =
  runtimeImportSchemas.ImportLocalizedTextSchema
export const ImportModuleSchema = runtimeImportSchemas.ImportModuleSchema
export const ImportAttributeSchema = runtimeImportSchemas.ImportAttributeSchema
export const ImportClassSchema = runtimeImportSchemas.ImportClassSchema
export const ImportRelationSchema = runtimeImportSchemas.ImportRelationSchema
export const ImportRelationAttributeSchema =
  runtimeImportSchemas.ImportRelationAttributeSchema
export const ImportCompetencyQuestionSchema =
  runtimeImportSchemas.ImportCompetencyQuestionSchema
export const ImportNoteSchema = runtimeImportSchemas.ImportNoteSchema
export const ImportExampleSchema = runtimeImportSchemas.ImportExampleSchema
export const ImportVisualModuleLayoutSchema =
  runtimeImportSchemas.ImportVisualModuleLayoutSchema
export const ImportVisualClassPositionSchema =
  runtimeImportSchemas.ImportVisualClassPositionSchema
export const ImportOntologyVisualSchema =
  runtimeImportSchemas.ImportOntologyVisualSchema
export const ImportOntologySchema = runtimeImportSchemas.ImportOntologySchema

export type ImportOntology = z.infer<typeof ImportOntologySchema>
export type ImportLanguage = z.infer<typeof ImportLanguageSchema>
export type ImportModuleRef = z.infer<typeof ImportModuleRefSchema>
export type ImportLocalizedText = z.infer<typeof ImportLocalizedTextSchema>
export type ImportModule = z.infer<typeof ImportModuleSchema>
export type ImportClass = z.infer<typeof ImportClassSchema>
export type ImportRelation = z.infer<typeof ImportRelationSchema>
export type ImportRelationAttribute = z.infer<
  typeof ImportRelationAttributeSchema
>
export type ImportCompetencyQuestion = z.infer<
  typeof ImportCompetencyQuestionSchema
>
export type ImportNote = z.infer<typeof ImportNoteSchema>
export type ImportExample = z.infer<typeof ImportExampleSchema>
export type ImportOntologyVisual = z.infer<typeof ImportOntologyVisualSchema>
export type ImportVisualModuleLayout = z.infer<
  typeof ImportVisualModuleLayoutSchema
>
export type ImportVisualClassPosition = z.infer<
  typeof ImportVisualClassPositionSchema
>
