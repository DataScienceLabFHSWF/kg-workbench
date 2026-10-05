import type { GroupedOptionPickerOption } from "@/components/shared/grouped-option-picker"

const ONTOLOGY_DATATYPE_GROUPS = [
  {
    id: "general-literals",
    label: "General literals",
    options: [
      { id: "rdfs:Literal", hint: "Any RDF literal" },
      { id: "rdf:PlainLiteral", hint: "Plain literal with optional language" },
      { id: "rdf:langString", hint: "Language-tagged string" },
      { id: "rdf:XMLLiteral", hint: "XML literal" },
    ],
  },
  {
    id: "strings",
    label: "Strings",
    options: [
      { id: "xsd:string", hint: "Generic string" },
      { id: "xsd:normalizedString", hint: "Whitespace-normalized string" },
      { id: "xsd:token", hint: "Tokenized string" },
      { id: "xsd:language", hint: "Language code" },
      { id: "xsd:Name", hint: "XML name" },
      { id: "xsd:NCName", hint: "XML name without colon" },
      { id: "xsd:NMTOKEN", hint: "XML name token" },
    ],
  },
  {
    id: "boolean",
    label: "Boolean",
    options: [{ id: "xsd:boolean", hint: "True or false" }],
  },
  {
    id: "numbers",
    label: "Numbers",
    options: [
      { id: "owl:real", hint: "OWL real number" },
      { id: "owl:rational", hint: "OWL rational number" },
      { id: "xsd:decimal", hint: "Arbitrary precision decimal" },
      { id: "xsd:integer", hint: "Integer" },
      { id: "xsd:nonNegativeInteger", hint: "Zero or positive integer" },
      { id: "xsd:nonPositiveInteger", hint: "Zero or negative integer" },
      { id: "xsd:positiveInteger", hint: "Positive integer" },
      { id: "xsd:negativeInteger", hint: "Negative integer" },
      { id: "xsd:long", hint: "64-bit signed integer" },
      { id: "xsd:int", hint: "32-bit signed integer" },
      { id: "xsd:short", hint: "16-bit signed integer" },
      { id: "xsd:byte", hint: "8-bit signed integer" },
      { id: "xsd:unsignedLong", hint: "64-bit unsigned integer" },
      { id: "xsd:unsignedInt", hint: "32-bit unsigned integer" },
      { id: "xsd:unsignedShort", hint: "16-bit unsigned integer" },
      { id: "xsd:unsignedByte", hint: "8-bit unsigned integer" },
      { id: "xsd:double", hint: "Double precision float" },
      { id: "xsd:float", hint: "Single precision float" },
    ],
  },
  {
    id: "binary",
    label: "Binary",
    options: [
      { id: "xsd:hexBinary", hint: "Hex-encoded binary" },
      { id: "xsd:base64Binary", hint: "Base64-encoded binary" },
    ],
  },
  {
    id: "iri",
    label: "IRI",
    options: [{ id: "xsd:anyURI", hint: "URI or IRI" }],
  },
  {
    id: "date-time",
    label: "Date & time",
    options: [
      { id: "xsd:dateTime", hint: "Date and time" },
      { id: "xsd:dateTimeStamp", hint: "Date and time with timezone" },
    ],
  },
] as const

const LEGACY_ONTOLOGY_DATA_TYPE_MAP = {
  boolean: "xsd:boolean",
  date: "xsd:dateTime",
  number: "xsd:decimal",
  string: "xsd:string",
  text: "xsd:string",
} as const

const QNAME_TO_IRI_PREFIX = {
  owl: "http://www.w3.org/2002/07/owl#",
  rdf: "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
  rdfs: "http://www.w3.org/2000/01/rdf-schema#",
  xsd: "http://www.w3.org/2001/XMLSchema#",
} as const

export const ONTOLOGY_DATA_TYPE_OPTIONS = ONTOLOGY_DATATYPE_GROUPS.flatMap(
  (group) =>
    group.options.map<GroupedOptionPickerOption>((option) => ({
      value: option.id,
      label: option.id,
      groupId: group.id,
      groupLabel: group.label,
      hint: option.hint,
      keywords: [group.label, option.hint ?? ""],
    }))
)

export type OntologyDataTypeId =
  (typeof ONTOLOGY_DATATYPE_GROUPS)[number]["options"][number]["id"]

export const ONTOLOGY_DATA_TYPE_IDS = ONTOLOGY_DATA_TYPE_OPTIONS.map(
  (option) => option.value
) as OntologyDataTypeId[]

export const DEFAULT_ONTOLOGY_DATA_TYPE: OntologyDataTypeId = "xsd:string"

const ONTOLOGY_DATA_TYPE_ID_SET = new Set<string>(ONTOLOGY_DATA_TYPE_IDS)

const ONTOLOGY_DATA_TYPE_IRI_BY_ID = Object.fromEntries(
  ONTOLOGY_DATA_TYPE_IDS.map((id) => [id, expandDatatypeQname(id)])
) as Record<OntologyDataTypeId, string>

function expandDatatypeQname(value: string) {
  const [prefix, localName] = value.split(":")
  const namespace =
    QNAME_TO_IRI_PREFIX[prefix as keyof typeof QNAME_TO_IRI_PREFIX]

  if (!namespace || !localName) {
    throw new Error(`Unsupported ontology datatype QName: ${value}`)
  }

  return `${namespace}${localName}`
}

export function isOntologyDataType(value: string): value is OntologyDataTypeId {
  return ONTOLOGY_DATA_TYPE_ID_SET.has(value)
}

export function normalizeOntologyDataType(
  value: string | null | undefined
): OntologyDataTypeId | null {
  const trimmed = value?.trim()
  if (!trimmed) return null
  if (isOntologyDataType(trimmed)) return trimmed

  return (
    LEGACY_ONTOLOGY_DATA_TYPE_MAP[
      trimmed.toLowerCase() as keyof typeof LEGACY_ONTOLOGY_DATA_TYPE_MAP
    ] ?? null
  )
}

export function normalizeOntologyDataTypeOrDefault(
  value: string | null | undefined,
  fallback: OntologyDataTypeId = DEFAULT_ONTOLOGY_DATA_TYPE
) {
  return normalizeOntologyDataType(value) ?? fallback
}

export function getOntologyDataTypeIri(value: string | null | undefined) {
  const normalized = normalizeOntologyDataType(value)
  return normalized ? ONTOLOGY_DATA_TYPE_IRI_BY_ID[normalized] : null
}
