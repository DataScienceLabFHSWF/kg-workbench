-- Add file storage path to documents
ALTER TABLE documents ADD COLUMN IF NOT EXISTS file_path text;
