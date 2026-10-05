import { MODULE_REFERENCE_DESCRIPTION } from "./constants"

export const ontologyImportQuickStart = [
  "name, classes, and relations are the only required top-level fields.",
  "IDs are document-local strings used by references such as domainClassId, rangeClassId, relationId, and targetId.",
  "Prefer canonical datatypes like xsd:string. Legacy aliases string, text, number, boolean, and date are also accepted on import.",
]

export const ontologyImportDetailSections = [
  {
    title: "Required structure",
    bullets: [
      "Provide ontology name plus arrays for classes and relations.",
      "Each class needs an id and name. Relations need at least name, domainClassId, and rangeClassId.",
      "Referenced class, relation, attribute, relation-attribute, module, and CQ IDs should stay stable within the same file.",
    ],
  },
  {
    title: "Optional sections",
    bullets: [
      "modules defines explicit module metadata. If you omit it, module names can still be inferred from classes and visual layouts.",
      "languages and localizedTexts let you preserve multilingual editor metadata.",
      "relationAttributes, competencyQuestions, notes, examples, and visual are optional editor features that can be included when available.",
    ],
  },
  {
    title: "Validation rules",
    bullets: [
      MODULE_REFERENCE_DESCRIPTION,
      "Unresolved visual references are imported with warnings when possible instead of failing the whole import.",
      "OWL export is supported today. OWL import is not supported yet because several editor-specific concepts do not map losslessly from OWL.",
    ],
  },
] as const
