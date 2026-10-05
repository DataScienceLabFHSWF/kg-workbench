ALTER TABLE ontology_examples
  ADD COLUMN is_instance_candidate boolean NOT NULL DEFAULT false;

ALTER TABLE ontology_notes
  ADD COLUMN author_name text NOT NULL DEFAULT '';

INSERT INTO ontology_examples (
  id,
  ontology_id,
  value,
  sort_order,
  target_class_id,
  is_instance_candidate
)
SELECT
  allowed_instance.id,
  ontology_class.ontology_id,
  allowed_instance.value,
  allowed_instance.sort_order,
  allowed_instance.class_id,
  true
FROM ontology_allowed_instances allowed_instance
JOIN ontology_classes ontology_class
  ON ontology_class.id = allowed_instance.class_id
ON CONFLICT (id) DO NOTHING;

ALTER TABLE ontology_competency_questions
  DROP CONSTRAINT IF EXISTS ontology_competency_questions_subject_instance_id_fkey,
  DROP CONSTRAINT IF EXISTS ontology_competency_questions_object_instance_id_fkey;

ALTER TABLE ontology_competency_questions
  RENAME COLUMN subject_instance_id TO subject_example_id;

ALTER TABLE ontology_competency_questions
  RENAME COLUMN object_instance_id TO object_example_id;

ALTER TABLE ontology_competency_questions
  ADD CONSTRAINT ontology_competency_questions_subject_example_id_fkey
    FOREIGN KEY (subject_example_id) REFERENCES ontology_examples(id) ON DELETE SET NULL,
  ADD CONSTRAINT ontology_competency_questions_object_example_id_fkey
    FOREIGN KEY (object_example_id) REFERENCES ontology_examples(id) ON DELETE SET NULL;

DROP TABLE ontology_allowed_instances;

ALTER TABLE ontology_relations
  DROP COLUMN required;
