-- Slice 1: Core metadata columns on existing tables
ALTER TABLE ontology_documents
  ADD COLUMN default_language text NOT NULL DEFAULT 'en',
  ADD COLUMN usecase text NOT NULL DEFAULT '';

ALTER TABLE ontology_modules
  ADD COLUMN description text NOT NULL DEFAULT '';

ALTER TABLE ontology_relations
  ADD COLUMN required boolean NOT NULL DEFAULT false;

ALTER TABLE ontology_classes
  ADD COLUMN instance_policy text NOT NULL DEFAULT 'open';

-- Slice 2: Available editor languages per ontology
CREATE TABLE ontology_languages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ontology_id uuid NOT NULL REFERENCES ontology_documents(id) ON DELETE CASCADE,
  language_code text NOT NULL,
  label text NOT NULL DEFAULT '',
  UNIQUE (ontology_id, language_code)
);

-- Slice 4: Allowed class instances (before CQs which may reference them)
CREATE TABLE ontology_allowed_instances (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id uuid NOT NULL REFERENCES ontology_classes(id) ON DELETE CASCADE,
  value text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (class_id, value)
);

-- Slice 5: Relation attributes (before CQs to keep FK order clean)
CREATE TABLE ontology_relation_attributes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  relation_id uuid NOT NULL REFERENCES ontology_relations(id) ON DELETE CASCADE,
  name text NOT NULL,
  data_type text NOT NULL DEFAULT 'text',
  description text NOT NULL DEFAULT '',
  required boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Slice 3: Competency questions
CREATE TABLE ontology_competency_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ontology_id uuid NOT NULL REFERENCES ontology_documents(id) ON DELETE CASCADE,
  question text NOT NULL DEFAULT '',
  subject_class_id uuid REFERENCES ontology_classes(id) ON DELETE SET NULL,
  predicate_relation_id uuid REFERENCES ontology_relations(id) ON DELETE SET NULL,
  object_class_id uuid REFERENCES ontology_classes(id) ON DELETE SET NULL,
  subject_instance_id uuid REFERENCES ontology_allowed_instances(id) ON DELETE SET NULL,
  object_instance_id uuid REFERENCES ontology_allowed_instances(id) ON DELETE SET NULL,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE ontology_competency_question_modules (
  cq_id uuid NOT NULL REFERENCES ontology_competency_questions(id) ON DELETE CASCADE,
  module_id uuid NOT NULL REFERENCES ontology_modules(id) ON DELETE CASCADE,
  PRIMARY KEY (cq_id, module_id)
);

-- Slice 5: Fact-level values for relation attributes
CREATE TABLE fact_relation_attribute_values (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  fact_id uuid NOT NULL REFERENCES facts(id) ON DELETE CASCADE,
  relation_attribute_id uuid NOT NULL REFERENCES ontology_relation_attributes(id) ON DELETE CASCADE,
  value text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (fact_id, relation_attribute_id)
);

-- Slice 2: Notes — exactly one target FK must be set
CREATE TABLE ontology_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ontology_id uuid NOT NULL REFERENCES ontology_documents(id) ON DELETE CASCADE,
  body text NOT NULL DEFAULT '',
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  target_ontology_id uuid REFERENCES ontology_documents(id) ON DELETE CASCADE,
  target_module_id uuid REFERENCES ontology_modules(id) ON DELETE CASCADE,
  target_class_id uuid REFERENCES ontology_classes(id) ON DELETE CASCADE,
  target_relation_id uuid REFERENCES ontology_relations(id) ON DELETE CASCADE,
  target_attribute_id uuid REFERENCES ontology_attributes(id) ON DELETE CASCADE,
  target_relation_attribute_id uuid REFERENCES ontology_relation_attributes(id) ON DELETE CASCADE,
  target_cq_id uuid REFERENCES ontology_competency_questions(id) ON DELETE CASCADE,
  CONSTRAINT notes_exactly_one_target CHECK (
    (target_ontology_id IS NOT NULL)::int +
    (target_module_id IS NOT NULL)::int +
    (target_class_id IS NOT NULL)::int +
    (target_relation_id IS NOT NULL)::int +
    (target_attribute_id IS NOT NULL)::int +
    (target_relation_attribute_id IS NOT NULL)::int +
    (target_cq_id IS NOT NULL)::int = 1
  )
);

-- Slice 2: Localized texts — exactly one target FK must be set
CREATE TABLE ontology_localized_texts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ontology_id uuid NOT NULL REFERENCES ontology_documents(id) ON DELETE CASCADE,
  field_name text NOT NULL,
  language_code text NOT NULL,
  value text NOT NULL DEFAULT '',
  target_ontology_id uuid REFERENCES ontology_documents(id) ON DELETE CASCADE,
  target_module_id uuid REFERENCES ontology_modules(id) ON DELETE CASCADE,
  target_class_id uuid REFERENCES ontology_classes(id) ON DELETE CASCADE,
  target_relation_id uuid REFERENCES ontology_relations(id) ON DELETE CASCADE,
  target_attribute_id uuid REFERENCES ontology_attributes(id) ON DELETE CASCADE,
  target_relation_attribute_id uuid REFERENCES ontology_relation_attributes(id) ON DELETE CASCADE,
  target_cq_id uuid REFERENCES ontology_competency_questions(id) ON DELETE CASCADE,
  CONSTRAINT localized_texts_exactly_one_target CHECK (
    (target_ontology_id IS NOT NULL)::int +
    (target_module_id IS NOT NULL)::int +
    (target_class_id IS NOT NULL)::int +
    (target_relation_id IS NOT NULL)::int +
    (target_attribute_id IS NOT NULL)::int +
    (target_relation_attribute_id IS NOT NULL)::int +
    (target_cq_id IS NOT NULL)::int = 1
  )
);

CREATE UNIQUE INDEX localized_texts_ontology_unique
  ON ontology_localized_texts (target_ontology_id, field_name, language_code)
  WHERE target_ontology_id IS NOT NULL;

CREATE UNIQUE INDEX localized_texts_module_unique
  ON ontology_localized_texts (target_module_id, field_name, language_code)
  WHERE target_module_id IS NOT NULL;

CREATE UNIQUE INDEX localized_texts_class_unique
  ON ontology_localized_texts (target_class_id, field_name, language_code)
  WHERE target_class_id IS NOT NULL;

CREATE UNIQUE INDEX localized_texts_relation_unique
  ON ontology_localized_texts (target_relation_id, field_name, language_code)
  WHERE target_relation_id IS NOT NULL;

CREATE UNIQUE INDEX localized_texts_attribute_unique
  ON ontology_localized_texts (target_attribute_id, field_name, language_code)
  WHERE target_attribute_id IS NOT NULL;

CREATE UNIQUE INDEX localized_texts_relation_attribute_unique
  ON ontology_localized_texts (target_relation_attribute_id, field_name, language_code)
  WHERE target_relation_attribute_id IS NOT NULL;

CREATE UNIQUE INDEX localized_texts_cq_unique
  ON ontology_localized_texts (target_cq_id, field_name, language_code)
  WHERE target_cq_id IS NOT NULL;

-- Slice 4: Examples — exactly one target FK must be set
CREATE TABLE ontology_examples (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ontology_id uuid NOT NULL REFERENCES ontology_documents(id) ON DELETE CASCADE,
  value text NOT NULL,
  subject_label text,
  predicate_label text,
  object_label text,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  target_class_id uuid REFERENCES ontology_classes(id) ON DELETE CASCADE,
  target_attribute_id uuid REFERENCES ontology_attributes(id) ON DELETE CASCADE,
  target_relation_id uuid REFERENCES ontology_relations(id) ON DELETE CASCADE,
  target_relation_attribute_id uuid REFERENCES ontology_relation_attributes(id) ON DELETE CASCADE,
  target_cq_id uuid REFERENCES ontology_competency_questions(id) ON DELETE CASCADE,
  CONSTRAINT examples_exactly_one_target CHECK (
    (target_class_id IS NOT NULL)::int +
    (target_attribute_id IS NOT NULL)::int +
    (target_relation_id IS NOT NULL)::int +
    (target_relation_attribute_id IS NOT NULL)::int +
    (target_cq_id IS NOT NULL)::int = 1
  )
);
