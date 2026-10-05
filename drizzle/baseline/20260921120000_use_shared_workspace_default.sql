-- New unscoped records belong to the same workspace as local development and
-- shared-password access. Preserve existing ownership in group deployments.
ALTER TABLE ontology_documents ALTER COLUMN group_key SET DEFAULT 'shared';
ALTER TABLE documents ALTER COLUMN group_key SET DEFAULT 'shared';
ALTER TABLE extraction_runs ALTER COLUMN group_key SET DEFAULT 'shared';
