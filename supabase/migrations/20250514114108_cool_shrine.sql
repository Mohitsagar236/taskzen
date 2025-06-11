/*
  # Fix task creation and RLS policies

  1. Changes
    - Drop existing policies to avoid conflicts
    - Enable RLS on tasks table
    - Create proper INSERT policy for authenticated users
    - Ensure proper ALL and SELECT policies exist

  2. Security
    - Enable RLS on tasks table
    - Add policy for task creation
    - Add policy for task management
    - Add policy for shared task viewing
*/

-- Enable RLS on tasks table
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can create their own tasks" ON tasks;
DROP POLICY IF EXISTS "Users can manage their own tasks" ON tasks;
DROP POLICY IF EXISTS "Users can view tasks shared with them" ON tasks;

-- Create INSERT policy for task creation
CREATE POLICY "Users can create their own tasks"
ON tasks
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Create ALL policy for task management
CREATE POLICY "Users can manage their own tasks"
ON tasks
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create SELECT policy for shared tasks
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