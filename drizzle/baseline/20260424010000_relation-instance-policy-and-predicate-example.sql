ALTER TABLE ontology_relations
  ADD COLUMN instance_policy text NOT NULL DEFAULT 'open';

ALTER TABLE ontology_competency_questions
  ADD COLUMN predicate_example_id uuid REFERENCES ontology_examples(id) ON DELETE SET NULL;
