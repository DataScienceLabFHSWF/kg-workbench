ALTER TABLE extraction_runs
ADD COLUMN IF NOT EXISTS internal_provider text
CHECK (internal_provider IS NULL OR internal_provider IN ('openai', 'anthropic', 'ollama')),
ADD COLUMN IF NOT EXISTS internal_model_name text,
ADD COLUMN IF NOT EXISTS external_extractor_url text;
