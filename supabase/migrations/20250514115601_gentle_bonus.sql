/*
  # Fix RLS policies and task creation

  1. Changes
    - Enable RLS on tasks table
    - Drop existing policies to avoid conflicts
    - Create new consolidated policies for task management
    - Add necessary indexes for performance

  2. Security
    - Enable RLS for tasks table
    - Add policies for task creation, viewing, updating and deletion
    - Add policy for shared task access
*/

-- Enable RLS on tasks table
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can create tasks" ON tasks;
DROP POLICY IF EXISTS "Users can view own and shared tasks" ON tasks;
DROP POLICY IF EXISTS "Users can update own tasks" ON tasks;
DROP POLICY IF EXISTS "Users can delete own tasks" ON tasks;

-- Create new consolidated policies
CREATE POLICY "Users can create tasks"
ON tasks
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own and shared tasks"
ON tasks
FOR SELECT
TO authenticated
USING (
  auth.uid() = user_id OR
  EXISTS (
    SELECT 1 FROM task_shares
    WHERE task_shares.task_id = tasks.id
    AND task_shares.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update own tasks"
ON tasks
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own tasks"
ON tasks
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Add necessary indexes
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);