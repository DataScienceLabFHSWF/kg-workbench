-- Module group positions and sizes for the canvas all-modules view
CREATE TABLE ontology_module_layout (
  module_id   uuid PRIMARY KEY REFERENCES ontology_modules(id) ON DELETE CASCADE,
  ontology_id uuid NOT NULL REFERENCES ontology_documents(id) ON DELETE CASCADE,
  x           double precision NOT NULL,
  y           double precision NOT NULL,
  width       double precision NOT NULL,
  height      double precision NOT NULL
);
