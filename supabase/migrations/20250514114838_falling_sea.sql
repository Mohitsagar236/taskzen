/*
  # Fix Tasks RLS Policies

  1. Changes
    - Drop existing conflicting policies
    - Create new consolidated policies for task management
    - Enable RLS on tasks table
  
  2. Security
    - Users can only create tasks they own
    - Users can manage (read/update/delete) their own tasks
    - Users can view tasks shared with them
*/

-- First enable RLS
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can create their own tasks" ON tasks;
DROP POLICY IF EXISTS "Users can manage their own tasks" ON tasks;
DROP POLICY IF EXISTS "Users can view tasks shared with them" ON tasks;
DROP POLICY IF EXISTS "Users can view their own tasks" ON tasks;
DROP POLICY IF EXISTS "Users can update their own tasks" ON tasks;
DROP POLICY IF EXISTS "Users can delete their own tasks" ON tasks;

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