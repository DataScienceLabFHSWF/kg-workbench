ALTER TABLE extraction_runs
ADD COLUMN IF NOT EXISTS extractor_backend text NOT NULL DEFAULT 'external'
CHECK (extractor_backend IN ('external', 'internal'));

UPDATE extraction_runs
SET extractor_backend = 'external'
WHERE extractor_backend IS NULL;
