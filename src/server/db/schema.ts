import { sql } from "drizzle-orm"
import {
  boolean,
  doublePrecision,
  integer,
  pgTable,
  primaryKey,
  real,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core"

const generatedId = () => uuid("id").defaultRandom().primaryKey()
const created_at = () =>
  timestamp("created_at", { withTimezone: true, mode: "string" }).defaultNow()

// This schema mirrors the application-owned PostgreSQL schema. The existing
// SQL migrations remain the baseline for installed databases; new migrations
// are generated into /drizzle after that baseline has been applied.
export const ontologyDocuments = pgTable("ontology_documents", {
  id: generatedId(),
  name: text("name").notNull(),
  version: text("version"),
  source_file: text("source_file"),
  created_at: created_at(),
  default_language: text("default_language").notNull().default("en"),
  usecase: text("usecase").notNull().default(""),
  group_key: text("group_key").notNull().default("shared"),
})

export const ontologyModules = pgTable("ontology_modules", {
  id: generatedId(),
  ontology_id: uuid("ontology_id").notNull(),
  name: text("name").notNull(),
  description: text("description").notNull().default(""),
})

export const ontologyClasses = pgTable("ontology_classes", {
  id: generatedId(),
  ontology_id: uuid("ontology_id").notNull(),
  module_id: uuid("module_id"),
  name: text("name").notNull(),
  description: text("description").notNull().default(""),
  parent_class_id: uuid("parent_class_id"),
  instance_policy: text("instance_policy").notNull().default("open"),
})

export const ontologyAttributes = pgTable("ontology_attributes", {
  id: generatedId(),
  class_id: uuid("class_id").notNull(),
  name: text("name").notNull(),
  data_type: text("data_type").notNull().default("xsd:string"),
  required: boolean("required").default(false),
  description: text("description").notNull().default(""),
})

export const ontologyRelations = pgTable("ontology_relations", {
  id: generatedId(),
  ontology_id: uuid("ontology_id").notNull(),
  name: text("name").notNull(),
  domain_class_id: uuid("domain_class_id").notNull(),
  range_class_id: uuid("range_class_id").notNull(),
  description: text("description").notNull().default(""),
  inverse_name: text("inverse_name"),
  cardinality: text("cardinality"),
  instance_policy: text("instance_policy").notNull().default("open"),
})

export const documents = pgTable("documents", {
  id: generatedId(),
  title: text("title").notNull(),
  status: text("status").notNull().default("processing"),
  language: text("language").notNull().default("en"),
  page_count: integer("page_count").notNull().default(0),
  uploaded_at: timestamp("uploaded_at", {
    withTimezone: true,
    mode: "string",
  }).defaultNow(),
  excerpt: text("excerpt").notNull().default(""),
  tags: text("tags")
    .array()
    .default(sql`'{}'::text[]`),
  file_path: text("file_path"),
  group_key: text("group_key").notNull().default("shared"),
})

export const documentSections = pgTable("document_sections", {
  id: generatedId(),
  document_id: uuid("document_id").notNull(),
  title: text("title").notNull(),
  summary: text("summary").notNull().default(""),
  sort_order: integer("sort_order").notNull().default(0),
})

export const documentParagraphs = pgTable("document_paragraphs", {
  id: generatedId(),
  section_id: uuid("section_id").notNull(),
  content: text("content").notNull(),
  sort_order: integer("sort_order").notNull().default(0),
})

export const extractionRuns = pgTable("extraction_runs", {
  id: generatedId(),
  document_id: uuid("document_id").notNull(),
  ontology_id: uuid("ontology_id"),
  status: text("status").notNull().default("pending"),
  started_at: timestamp("started_at", { withTimezone: true, mode: "string" }),
  completed_at: timestamp("completed_at", {
    withTimezone: true,
    mode: "string",
  }),
  created_at: created_at(),
  group_key: text("group_key").notNull().default("shared"),
  extractor_backend: text("extractor_backend").notNull().default("external"),
  internal_provider: text("internal_provider"),
  internal_model_name: text("internal_model_name"),
  external_extractor_url: text("external_extractor_url"),
})

export const evidenceAnchors = pgTable("evidence_anchors", {
  id: generatedId(),
  document_id: uuid("document_id").notNull(),
  section_id: uuid("section_id"),
  paragraph_id: uuid("paragraph_id"),
  quote_text: text("quote_text").notNull(),
  context_text: text("context_text"),
  page_from: integer("page_from"),
  page_to: integer("page_to"),
  start_char: integer("start_char"),
  end_char: integer("end_char"),
})

export const facts = pgTable("facts", {
  id: generatedId(),
  extraction_run_id: uuid("extraction_run_id").notNull(),
  document_id: uuid("document_id").notNull(),
  subject_text: text("subject_text").notNull(),
  relation_text: text("relation_text").notNull(),
  object_text: text("object_text").notNull(),
  relation_type_id: uuid("relation_type_id"),
  review_status: text("review_status").notNull().default("pending"),
  confidence: real("confidence"),
  primary_anchor_id: uuid("primary_anchor_id"),
  created_at: created_at(),
  is_cross_chapter: boolean("is_cross_chapter").notNull().default(false),
  subject_entity_id: uuid("subject_entity_id"),
  object_entity_id: uuid("object_entity_id"),
})

export const factAnchors = pgTable(
  "fact_anchors",
  {
    fact_id: uuid("fact_id").notNull(),
    anchor_id: uuid("anchor_id").notNull(),
  },
  (table) => [primaryKey({ columns: [table.fact_id, table.anchor_id] })]
)

export const documentEntities = pgTable("document_entities", {
  id: generatedId(),
  document_id: uuid("document_id").notNull(),
  extraction_run_id: uuid("extraction_run_id"),
  entity_text: text("entity_text").notNull(),
  class_id: uuid("class_id"),
  review_status: text("review_status").notNull().default("pending"),
  created_at: created_at().notNull(),
})

export const entityAttributeValues = pgTable("entity_attribute_values", {
  id: generatedId(),
  entity_id: uuid("entity_id").notNull(),
  attribute_id: uuid("attribute_id").notNull(),
  value: text("value").notNull(),
  created_at: created_at().notNull(),
})

export const ontologyClassPositions = pgTable(
  "ontology_class_positions",
  {
    class_id: uuid("class_id").notNull(),
    module_id: uuid("module_id").notNull(),
    ontology_id: uuid("ontology_id").notNull(),
    x: doublePrecision("x").notNull(),
    y: doublePrecision("y").notNull(),
  },
  (table) => [primaryKey({ columns: [table.class_id, table.module_id] })]
)

export const ontologyModuleLayout = pgTable("ontology_module_layout", {
  module_id: uuid("module_id").primaryKey(),
  ontology_id: uuid("ontology_id").notNull(),
  x: doublePrecision("x").notNull(),
  y: doublePrecision("y").notNull(),
  width: doublePrecision("width").notNull(),
  height: doublePrecision("height").notNull(),
})

export const ontologyLanguages = pgTable("ontology_languages", {
  id: generatedId(),
  ontology_id: uuid("ontology_id").notNull(),
  language_code: text("language_code").notNull(),
  label: text("label").notNull().default(""),
})

export const ontologyRelationAttributes = pgTable(
  "ontology_relation_attributes",
  {
    id: generatedId(),
    relation_id: uuid("relation_id").notNull(),
    name: text("name").notNull(),
    data_type: text("data_type").notNull().default("xsd:string"),
    description: text("description").notNull().default(""),
    required: boolean("required").notNull().default(false),
    sort_order: integer("sort_order").notNull().default(0),
    created_at: created_at().notNull(),
  }
)

export const ontologyCompetencyQuestions = pgTable(
  "ontology_competency_questions",
  {
    id: generatedId(),
    ontology_id: uuid("ontology_id").notNull(),
    question: text("question").notNull().default(""),
    subject_class_id: uuid("subject_class_id"),
    predicate_relation_id: uuid("predicate_relation_id"),
    object_class_id: uuid("object_class_id"),
    subject_example_id: uuid("subject_example_id"),
    predicate_example_id: uuid("predicate_example_id"),
    object_example_id: uuid("object_example_id"),
    sort_order: integer("sort_order").notNull().default(0),
    created_at: created_at().notNull(),
  }
)

export const ontologyCompetencyQuestionModules = pgTable(
  "ontology_competency_question_modules",
  {
    cq_id: uuid("cq_id").notNull(),
    module_id: uuid("module_id").notNull(),
  },
  (table) => [primaryKey({ columns: [table.cq_id, table.module_id] })]
)

export const factRelationAttributeValues = pgTable(
  "fact_relation_attribute_values",
  {
    id: generatedId(),
    fact_id: uuid("fact_id").notNull(),
    relation_attribute_id: uuid("relation_attribute_id").notNull(),
    value: text("value").notNull(),
    created_at: created_at().notNull(),
  }
)

export const ontologyNotes = pgTable("ontology_notes", {
  id: generatedId(),
  ontology_id: uuid("ontology_id").notNull(),
  body: text("body").notNull().default(""),
  author_name: text("author_name").notNull().default(""),
  sort_order: integer("sort_order").notNull().default(0),
  created_at: created_at().notNull(),
  target_ontology_id: uuid("target_ontology_id"),
  target_module_id: uuid("target_module_id"),
  target_class_id: uuid("target_class_id"),
  target_relation_id: uuid("target_relation_id"),
  target_attribute_id: uuid("target_attribute_id"),
  target_relation_attribute_id: uuid("target_relation_attribute_id"),
  target_cq_id: uuid("target_cq_id"),
})

export const ontologyLocalizedTexts = pgTable("ontology_localized_texts", {
  id: generatedId(),
  ontology_id: uuid("ontology_id").notNull(),
  field_name: text("field_name").notNull(),
  language_code: text("language_code").notNull(),
  value: text("value").notNull().default(""),
  target_ontology_id: uuid("target_ontology_id"),
  target_module_id: uuid("target_module_id"),
  target_class_id: uuid("target_class_id"),
  target_relation_id: uuid("target_relation_id"),
  target_attribute_id: uuid("target_attribute_id"),
  target_relation_attribute_id: uuid("target_relation_attribute_id"),
  target_cq_id: uuid("target_cq_id"),
})

export const ontologyExamples = pgTable("ontology_examples", {
  id: generatedId(),
  ontology_id: uuid("ontology_id").notNull(),
  value: text("value").notNull(),
  subject_label: text("subject_label"),
  predicate_label: text("predicate_label"),
  object_label: text("object_label"),
  sort_order: integer("sort_order").notNull().default(0),
  created_at: created_at().notNull(),
  is_instance_candidate: boolean("is_instance_candidate")
    .notNull()
    .default(false),
  target_class_id: uuid("target_class_id"),
  target_attribute_id: uuid("target_attribute_id"),
  target_relation_id: uuid("target_relation_id"),
  target_relation_attribute_id: uuid("target_relation_attribute_id"),
  target_cq_id: uuid("target_cq_id"),
})
