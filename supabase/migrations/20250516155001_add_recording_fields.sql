-- Add recording fields to tasks table
ALTER TABLE tasks
ADD COLUMN IF NOT EXISTS recording_url text,
ADD COLUMN IF NOT EXISTS recording_duration integer;

-- Add recording duration to screen_recordings table if it doesn't exist
ALTER TABLE screen_recordings
ADD COLUMN IF NOT EXISTS duration integer;
