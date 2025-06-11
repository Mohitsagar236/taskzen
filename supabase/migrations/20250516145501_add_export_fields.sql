-- Add export related fields to tasks table
ALTER TABLE tasks
ADD COLUMN IF NOT EXISTS export_format text,
ADD COLUMN IF NOT EXISTS last_exported_at timestamptz;
