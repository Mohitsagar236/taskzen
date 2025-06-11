/*
  # Fix Tasks RLS Policies

  1. Changes
    - Add proper INSERT policy for tasks table to allow authenticated users to create their own tasks
    - Consolidate existing policies into clearer, more maintainable ones
    - Ensure all CRUD operations are properly secured

  2. Security
    - Enable RLS on tasks table (already enabled)
    - Add policy for authenticated users to create their own tasks
    - Maintain existing policies for other operations
*/

-- Drop existing policies to clean up and consolidate
DROP POLICY IF EXISTS "Users can create tasks" ON tasks;
DROP POLICY IF EXISTS "Users can read own tasks" ON tasks;
DROP POLICY IF EXISTS "Users can update own tasks" ON tasks;
DROP POLICY IF EXISTS "Users can delete own tasks" ON tasks;
DROP POLICY IF EXISTS "Users can view shared tasks" ON tasks;

-- Create consolidated policies with proper security
CREATE POLICY "Users can manage their own tasks"
ON tasks
FOR ALL
TO authenticated
USING (
  user_id = auth.uid()
)
WITH CHECK (
  user_id = auth.uid()
);

-- Additional policy for shared tasks (read-only)
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