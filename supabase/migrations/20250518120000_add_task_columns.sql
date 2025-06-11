/*
  Add missing task columns to support updateTask functionality:
  - assigned_to (uuid)
  - completed_at (timestamptz)
  - status (text)
*/

BEGIN;

ALTER TABLE tasks
  ADD COLUMN IF NOT EXISTS assigned_to uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS completed_at timestamptz,
  ADD COLUMN IF NOT EXISTS status text DEFAULT 'todo';

-- Enable RLS for new columns is covered by existing RLS on tasks

COMMIT;
