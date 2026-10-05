ALTER TABLE ontology_documents
  ADD COLUMN IF NOT EXISTS group_key text NOT NULL DEFAULT 'fhswf';

ALTER TABLE documents
  ADD COLUMN IF NOT EXISTS group_key text NOT NULL DEFAULT 'fhswf';

ALTER TABLE extraction_runs
  ADD COLUMN IF NOT EXISTS group_key text NOT NULL DEFAULT 'fhswf';

UPDATE ontology_documents
SET group_key = 'fhswf'
WHERE group_key IS NULL OR btrim(group_key) = '';

UPDATE documents
SET group_key = 'fhswf'
WHERE group_key IS NULL OR btrim(group_key) = '';

UPDATE extraction_runs
SET group_key = COALESCE(NULLIF(btrim(documents.group_key), ''), 'fhswf')
FROM documents
WHERE extraction_runs.document_id = documents.id
  AND (extraction_runs.group_key IS NULL OR btrim(extraction_runs.group_key) = '');

CREATE INDEX IF NOT EXISTS ontology_documents_group_key_idx
  ON ontology_documents (group_key);

CREATE INDEX IF NOT EXISTS documents_group_key_idx
  ON documents (group_key);

CREATE INDEX IF NOT EXISTS extraction_runs_group_key_idx
  ON extraction_runs (group_key);
