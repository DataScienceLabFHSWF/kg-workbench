import type { ExtractionResultsResponse } from "@/server/external/extraction-api"

export const externalExtractionResponseExample = {
  sections: [
    {
      id: "section-1",
      title: "Executive summary",
      paragraphs: [
        {
          id: "paragraph-1",
          content: "Acme GmbH ships batteries to Berlin Recycling GmbH.",
        },
      ],
    },
  ],
  entities: [
    {
      temp_id: "entity-1",
      text: "Acme GmbH",
      className: "Company",
      attributes: [{ attribute_name: "legal_name", value: "Acme GmbH" }],
    },
    {
      temp_id: "entity-2",
      text: "Berlin Recycling GmbH",
      className: "Company",
      attributes: [],
    },
  ],
  facts: [
    {
      subject_temp_id: "entity-1",
      relation_text: "ships to",
      object_temp_id: "entity-2",
      subjectClassName: "Company",
      objectClassName: "Company",
      relationName: "SUPPLIES",
      confidence: 0.91,
      isCrossChapter: false,
      evidence: {
        quote: "Acme GmbH ships batteries to Berlin Recycling GmbH.",
        sectionTitle: "Executive summary",
        paragraphId: "paragraph-1",
        pageFrom: 1,
        pageTo: 1,
      },
    },
  ],
} satisfies ExtractionResultsResponse

export const externalExtractionResponseExampleJson = JSON.stringify(
  externalExtractionResponseExample,
  null,
  2
)
