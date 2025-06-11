/*
  # Add RLS policies for tasks table

  1. Security Changes
    - Enable RLS on tasks table (if not already enabled)
    - Add policies for CRUD operations:
      - INSERT: Users can create their own tasks
      - SELECT: Users can view their own tasks and shared tasks
      - UPDATE: Users can update their own tasks
      - DELETE: Users can delete their own tasks

  2. Notes
    - All policies are permissive
    - Policies ensure users can only access their own data
    - Shared tasks are accessible through task_shares table
*/

-- Enable RLS
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can create tasks" ON tasks;
DROP POLICY IF EXISTS "Users can view own and shared tasks" ON tasks;
DROP POLICY IF EXISTS "Users can update own tasks" ON tasks;
DROP POLICY IF EXISTS "Users can delete own tasks" ON tasks;

-- Create new policies
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