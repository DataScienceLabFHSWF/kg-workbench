import type { ImportOntology } from "@/features/ontology/schemas/import"

export const ontologyImportExample = {
  defaultLanguage: "en",
  languages: [
    { code: "en", label: "English" },
    { code: "de", label: "Deutsch" },
  ],
  name: "Organization Ontology",
  usecase: "Capture organizations, people, and employment relations.",
  version: "1.0.0",
  modules: [
    {
      id: "core",
      name: "Core",
      description: "Foundational organization entities.",
    },
  ],
  classes: [
    {
      id: "organization",
      name: "Organization",
      moduleId: "core",
      module: "Core",
      description: "A company, institution, or other formal organization.",
      parentClassId: null,
      attributes: [
        {
          id: "organization-name",
          name: "Name",
          dataType: "xsd:string",
          required: true,
          description: "Primary display name.",
        },
      ],
    },
    {
      id: "person",
      name: "Person",
      moduleId: "core",
      module: "Core",
      description: "A human individual.",
      parentClassId: null,
      attributes: [
        {
          id: "person-email",
          name: "Email",
          dataType: "xsd:string",
          required: false,
          description: "Preferred email address.",
        },
      ],
    },
  ],
  relations: [
    {
      id: "works-for",
      name: "works for",
      domainClassId: "person",
      rangeClassId: "organization",
      description: "Connects a person to their employer.",
      inverseName: "employs",
      cardinality: "many-to-one",
    },
  ],
  relationAttributes: [
    {
      id: "employment-start-date",
      relationId: "works-for",
      name: "Start date",
      dataType: "xsd:dateTime",
      required: false,
      description: "Employment start date.",
      sortOrder: 0,
    },
  ],
  competencyQuestions: [
    {
      id: "cq-1",
      question: "Which organization does a person work for?",
      subjectClassId: "person",
      predicateRelationId: "works-for",
      objectClassId: "organization",
      subjectExampleId: "example-person",
      predicateExampleId: "example-works-for",
      objectExampleId: "example-organization",
      sortOrder: 0,
      modules: [{ id: "core", name: "Core", isCurrentModule: true }],
    },
  ],
  notes: [
    {
      id: "note-1",
      targetType: "relation",
      targetId: "works-for",
      body: "Use this relation for current employment only.",
      authorName: "Ontology Team",
      sortOrder: 0,
    },
  ],
  examples: [
    {
      id: "example-person",
      targetType: "class",
      targetId: "person",
      value: "Ada Lovelace",
      subjectLabel: null,
      predicateLabel: null,
      objectLabel: null,
      isInstanceCandidate: true,
      sortOrder: 0,
    },
    {
      id: "example-organization",
      targetType: "class",
      targetId: "organization",
      value: "Analytical Engines Ltd.",
      subjectLabel: null,
      predicateLabel: null,
      objectLabel: null,
      isInstanceCandidate: true,
      sortOrder: 1,
    },
    {
      id: "example-works-for",
      targetType: "relation",
      targetId: "works-for",
      value: "Ada Lovelace works for Analytical Engines Ltd.",
      subjectLabel: "Ada Lovelace",
      predicateLabel: "works for",
      objectLabel: "Analytical Engines Ltd.",
      isInstanceCandidate: false,
      sortOrder: 0,
    },
  ],
  localizedTexts: [
    {
      targetType: "class",
      targetId: "organization",
      fieldName: "name",
      languageCode: "de",
      value: "Organisation",
    },
  ],
  visual: {
    moduleLayouts: [
      {
        moduleId: "core",
        module: "Core",
        x: 40,
        y: 40,
        width: 520,
        height: 320,
      },
    ],
    classPositions: [
      {
        classId: "organization",
        moduleId: "core",
        module: "Core",
        x: 120,
        y: 120,
      },
      {
        classId: "person",
        moduleId: "core",
        module: "Core",
        x: 320,
        y: 120,
      },
    ],
  },
} satisfies ImportOntology

export const ontologyImportExampleJson = JSON.stringify(
  ontologyImportExample,
  null,
  2
)
