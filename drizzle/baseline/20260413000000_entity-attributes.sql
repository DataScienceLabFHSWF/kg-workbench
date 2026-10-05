CREATE TABLE document_entities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  extraction_run_id uuid REFERENCES extraction_runs(id),
  entity_text text NOT NULL,
  class_id uuid REFERENCES ontology_classes(id),
  review_status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX document_entities_document_id_entity_text_idx
  ON document_entities (document_id, lower(entity_text));

CREATE TABLE entity_attribute_values (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_id uuid NOT NULL REFERENCES document_entities(id) ON DELETE CASCADE,
  attribute_id uuid NOT NULL REFERENCES ontology_attributes(id),
  value text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (entity_id, attribute_id)
);

ALTER TABLE facts
  ADD COLUMN subject_entity_id uuid REFERENCES document_entities(id),
  ADD COLUMN object_entity_id uuid REFERENCES document_entities(id);
