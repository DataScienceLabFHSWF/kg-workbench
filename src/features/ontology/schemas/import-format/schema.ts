import { z } from "zod"

import {
  ImportOntologyJsonSchemaSource,
  IMPORT_LEGACY_ONTOLOGY_DATA_TYPE_IDS,
} from "@/features/ontology/schemas/import"
import { ONTOLOGY_DATA_TYPE_IDS } from "@/features/ontology/utils/data-types"

import { MODULE_REFERENCE_DESCRIPTION } from "./constants"

type JsonSchemaObject = {
  $defs?: Record<string, JsonSchemaObject>
  description?: string
  id?: string
  properties?: Record<string, JsonSchemaObject>
  required?: string[]
  title?: string
  [key: string]: unknown
}

const DATA_TYPE_DESCRIPTION =
  "Prefer canonical RDF/OWL datatype IDs. Legacy aliases are accepted and normalized during import."

const TOP_LEVEL_PROPERTY_DESCRIPTIONS = {
  defaultLanguage: "Default language code for canonical ontology text.",
  languages:
    "Optional list of available language codes and labels for the ontology.",
  name: "Ontology document name.",
  usecase: "Optional ontology use case summary.",
  version: "Optional version string.",
  modules:
    "Optional explicit module definitions. Useful when classes are grouped into modules with descriptions.",
  classes:
    "Required array of ontology classes, including optional parentClassId and inline attributes.",
  relations: "Required array of relations between classes.",
  relationAttributes: "Optional structured fields attached to relations.",
  competencyQuestions:
    "Optional competency questions with class, relation, module, and example references.",
  notes: "Optional editor notes attached to ontology entities.",
  examples:
    "Optional sample values or sample triples attached to ontology entities.",
  localizedTexts:
    "Optional translations for ontology, module, class, relation, attribute, relation attribute, and CQ fields.",
  visual:
    "Optional saved module layouts and class positions for the visual canvas.",
} satisfies Record<string, string>

function applyDescription(
  properties: Record<string, JsonSchemaObject> | undefined,
  propertyName: string,
  description: string
) {
  const property = properties?.[propertyName]
  if (property) {
    property.description = description
  }
}

function patchDataTypeSchema(dataTypeSchema: JsonSchemaObject | undefined) {
  if (!dataTypeSchema) return

  dataTypeSchema.description = DATA_TYPE_DESCRIPTION
  dataTypeSchema.anyOf = [
    { enum: ONTOLOGY_DATA_TYPE_IDS },
    { enum: [...IMPORT_LEGACY_ONTOLOGY_DATA_TYPE_IDS] },
  ]
  dataTypeSchema.default = "xsd:string"
}

function buildOntologyImportJsonSchema() {
  const schema = z.toJSONSchema(ImportOntologyJsonSchemaSource, {
    io: "input",
  }) as JsonSchemaObject

  schema.$id = "https://kg-workbench.local/schema/ontology-import.json"
  schema.title = "KG Workbench Ontology Import"
  schema.description =
    "Canonical import format for ontology JSON files accepted by KG Workbench."

  schema.required = ["name", "classes", "relations"]

  const properties = schema.properties
  for (const [propertyName, description] of Object.entries(
    TOP_LEVEL_PROPERTY_DESCRIPTIONS
  )) {
    applyDescription(properties, propertyName, description)
  }

  const defs = schema.$defs
  if (defs) {
    for (const definition of Object.values(defs)) {
      delete definition.id
    }

    applyDescription(
      defs.class?.properties,
      "module",
      MODULE_REFERENCE_DESCRIPTION
    )
    patchDataTypeSchema(defs.attribute?.properties?.dataType)
    patchDataTypeSchema(defs.relationAttribute?.properties?.dataType)
  }

  return schema
}

export const ontologyImportJsonSchema = buildOntologyImportJsonSchema()

export const ontologyImportSchemaJson = JSON.stringify(
  ontologyImportJsonSchema,
  null,
  2
)
