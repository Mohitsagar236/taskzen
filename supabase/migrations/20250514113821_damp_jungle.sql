/*
  # Fix Tasks Table RLS Policies
  
  1. Changes
    - Enable RLS on tasks table if not already enabled
    - Add policies for task management if they don't exist:
      - Policy for users to create their own tasks
      - Policy for users to manage their own tasks
      - Policy for users to view shared tasks
  
  2. Security
    - Ensures proper row-level security
    - Prevents unauthorized access to tasks
    - Allows task sharing functionality
*/

-- Enable RLS if not already enabled
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'tasks' 
    AND rowsecurity = true
  ) THEN
    ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can create their own tasks" ON tasks;
DROP POLICY IF EXISTS "Users can manage their own tasks" ON tasks;
DROP POLICY IF EXISTS "Users can view tasks shared with them" ON tasks;

-- Policy for inserting tasks
CREATE POLICY "Users can create their own tasks"
ON tasks
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Policy for managing own tasks
CREATE POLICY "Users can manage their own tasks"
ON tasks
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Policy for viewing shared tasks
CREATE POLICY "Users can view tasks shared with them"
ON tasks
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM task_shares
    WHERE task_shares.task_id = tasks.id
    AND task_shares.user_id = auth.uid()
  )
);