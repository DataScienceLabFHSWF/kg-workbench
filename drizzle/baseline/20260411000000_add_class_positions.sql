-- Node positions per class per module view (for canvas drag-to-save)
CREATE TABLE ontology_class_positions (
  class_id    uuid NOT NULL REFERENCES ontology_classes(id) ON DELETE CASCADE,
  module_id   uuid NOT NULL REFERENCES ontology_modules(id) ON DELETE CASCADE,
  ontology_id uuid NOT NULL REFERENCES ontology_documents(id) ON DELETE CASCADE,
  x           double precision NOT NULL,
  y           double precision NOT NULL,
  PRIMARY KEY (class_id, module_id)
);
