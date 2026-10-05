export const externalExtractionResponseSchema = {
  $id: "https://kg-workbench.local/schema/external-extraction-response.json",
  title: "KG Workbench External Extraction Response",
  description:
    "Response body returned by GET /api/extract/{runId}/results for a compatible external extractor.",
  type: "object",
  additionalProperties: false,
  required: ["sections", "entities", "facts"],
  properties: {
    sections: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["id", "title", "paragraphs"],
        properties: {
          id: { type: "string" },
          title: { type: "string" },
          paragraphs: {
            type: "array",
            items: {
              type: "object",
              additionalProperties: false,
              required: ["id", "content"],
              properties: {
                id: { type: "string" },
                content: { type: "string" },
              },
            },
          },
        },
      },
    },
    entities: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["temp_id", "text", "className", "attributes"],
        properties: {
          temp_id: { type: "string" },
          text: { type: "string" },
          className: {
            type: "string",
            description:
              "Exact ontology class name assigned to this entity. This is required even when the entity is not referenced by a fact.",
          },
          attributes: {
            type: "array",
            items: {
              type: "object",
              additionalProperties: false,
              required: ["attribute_name", "value"],
              properties: {
                attribute_name: { type: "string" },
                value: { type: "string" },
              },
            },
          },
        },
      },
    },
    facts: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: [
          "subject_temp_id",
          "relation_text",
          "object_temp_id",
          "subjectClassName",
          "objectClassName",
          "relationName",
          "confidence",
          "evidence",
        ],
        properties: {
          subject_temp_id: { type: "string" },
          relation_text: { type: "string" },
          object_temp_id: { type: "string" },
          subjectClassName: { type: "string" },
          objectClassName: { type: "string" },
          relationName: { type: "string" },
          confidence: { type: "number", minimum: 0, maximum: 1 },
          isCrossChapter: { type: "boolean" },
          evidence: {
            anyOf: [
              { type: "null" },
              {
                type: "object",
                additionalProperties: false,
                required: ["quote", "sectionTitle", "paragraphId"],
                properties: {
                  quote: { type: "string" },
                  sectionTitle: { type: "string" },
                  paragraphId: {
                    anyOf: [{ type: "string" }, { type: "null" }],
                  },
                  pageFrom: { type: "integer" },
                  pageTo: { type: "integer" },
                },
              },
            ],
          },
        },
      },
    },
  },
} as const

export const externalExtractionResponseSchemaJson = JSON.stringify(
  externalExtractionResponseSchema,
  null,
  2
)
