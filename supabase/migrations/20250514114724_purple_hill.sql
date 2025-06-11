/*
  # Fix Tasks RLS Policies

  1. Changes
    - Drop existing RLS policies for tasks table
    - Create new comprehensive RLS policies for tasks table that properly handle all operations
    
  2. Security
    - Enable RLS on tasks table
    - Add policies for:
      - INSERT: Users can create their own tasks
      - SELECT: Users can view their own tasks and shared tasks
      - UPDATE: Users can update their own tasks
      - DELETE: Users can delete their own tasks
*/

-- First enable RLS if not already enabled
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can create their own tasks" ON tasks;
DROP POLICY IF EXISTS "Users can manage their own tasks" ON tasks;
DROP POLICY IF EXISTS "Users can view tasks shared with them" ON tasks;

-- Create new comprehensive policies
CREATE POLICY "Users can create their own tasks"
ON tasks FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own tasks"
ON tasks FOR SELECT 
TO authenticated
USING (
  auth.uid() = user_id OR 
  EXISTS (
    SELECT 1 FROM task_shares 
    WHERE task_shares.task_id = tasks.id 
    AND task_shares.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update their own tasks"
ON tasks FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tasks"
ON tasks FOR DELETE
TO authenticated
USING (auth.uid() = user_id);