-- ============================================================
-- Initial schema for kg-workbench
-- ============================================================

-- Ontology documents (top-level ontology container)
CREATE TABLE ontology_documents (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL,
  version     text,
  source_file text,
  created_at  timestamptz DEFAULT now()
);

-- Ontology modules (logical groupings within an ontology)
CREATE TABLE ontology_modules (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ontology_id uuid NOT NULL REFERENCES ontology_documents(id) ON DELETE CASCADE,
  name        text NOT NULL
);

-- Ontology classes
CREATE TABLE ontology_classes (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ontology_id     uuid NOT NULL REFERENCES ontology_documents(id) ON DELETE CASCADE,
  module_id       uuid REFERENCES ontology_modules(id) ON DELETE SET NULL,
  name            text NOT NULL,
  description     text NOT NULL DEFAULT '',
  parent_class_id uuid REFERENCES ontology_classes(id) ON DELETE SET NULL
);

-- Ontology attributes (properties on a class)
CREATE TABLE ontology_attributes (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id    uuid NOT NULL REFERENCES ontology_classes(id) ON DELETE CASCADE,
  name        text NOT NULL,
  data_type   text NOT NULL CHECK (data_type IN ('string', 'number', 'boolean', 'date')),
  required    boolean DEFAULT false,
  description text NOT NULL DEFAULT ''
);

-- Ontology relations (edges between classes)
CREATE TABLE ontology_relations (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ontology_id     uuid NOT NULL REFERENCES ontology_documents(id) ON DELETE CASCADE,
  name            text NOT NULL,
  domain_class_id uuid NOT NULL REFERENCES ontology_classes(id) ON DELETE CASCADE,
  range_class_id  uuid NOT NULL REFERENCES ontology_classes(id) ON DELETE CASCADE,
  description     text NOT NULL DEFAULT '',
  inverse_name    text,
  cardinality     text
);

-- Source documents
CREATE TABLE documents (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title       text NOT NULL,
  kind        text NOT NULL CHECK (kind IN ('report', 'manual', 'drawing', 'note')),
  status      text NOT NULL DEFAULT 'processing' CHECK (status IN ('processing', 'in_review', 'imported')),
  language    text NOT NULL DEFAULT 'en',
  page_count  int NOT NULL DEFAULT 0,
  uploaded_at timestamptz DEFAULT now(),
  excerpt     text NOT NULL DEFAULT '',
  tags        text[] DEFAULT '{}'
);

-- Document sections
CREATE TABLE document_sections (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  title       text NOT NULL,
  summary     text NOT NULL DEFAULT '',
  sort_order  int NOT NULL DEFAULT 0
);

-- Document paragraphs
CREATE TABLE document_paragraphs (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id uuid NOT NULL REFERENCES document_sections(id) ON DELETE CASCADE,
  content    text NOT NULL,
  sort_order int NOT NULL DEFAULT 0
);

-- Extraction runs (tracks external pipeline calls)
CREATE TABLE extraction_runs (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id  uuid NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  ontology_id  uuid REFERENCES ontology_documents(id),
  status       text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed')),
  started_at   timestamptz,
  completed_at timestamptz,
  created_at   timestamptz DEFAULT now()
);

-- Evidence anchors (text passages that support a fact)
CREATE TABLE evidence_anchors (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id  uuid NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  section_id   uuid REFERENCES document_sections(id),
  paragraph_id uuid REFERENCES document_paragraphs(id),
  quote_text   text NOT NULL,
  context_text text,
  page_from    int,
  page_to      int,
  start_char   int,
  end_char     int
);

-- Facts (extracted subject-relation-object triples)
CREATE TABLE facts (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  extraction_run_id uuid NOT NULL REFERENCES extraction_runs(id) ON DELETE CASCADE,
  document_id       uuid NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  subject_text      text NOT NULL,
  relation_text     text NOT NULL,
  object_text       text NOT NULL,
  subject_class_id  uuid REFERENCES ontology_classes(id),
  relation_type_id  uuid REFERENCES ontology_relations(id),
  object_class_id   uuid REFERENCES ontology_classes(id),
  review_status     text NOT NULL DEFAULT 'pending' CHECK (review_status IN ('pending', 'accepted', 'rejected')),
  confidence        real CHECK (confidence >= 0 AND confidence <= 1),
  primary_anchor_id uuid REFERENCES evidence_anchors(id),
  created_at        timestamptz DEFAULT now()
);

-- Fact anchors (junction: fact <-> evidence_anchor)
CREATE TABLE fact_anchors (
  fact_id   uuid NOT NULL REFERENCES facts(id) ON DELETE CASCADE,
  anchor_id uuid NOT NULL REFERENCES evidence_anchors(id) ON DELETE CASCADE,
  PRIMARY KEY (fact_id, anchor_id)
);
