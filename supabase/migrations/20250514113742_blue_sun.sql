/*
  # Add RLS policies for tasks table

  1. Security Changes
    - Enable RLS on tasks table (if not already enabled)
    - Add policy for authenticated users to insert their own tasks
    - Add policy for authenticated users to manage their own tasks
    - Add policy for users to view tasks shared with them
*/

-- Enable RLS
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

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