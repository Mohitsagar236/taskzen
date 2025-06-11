/*
  # Update task comments security policies

  1. Security
    - Drop existing policies if they exist
    - Enable RLS on task_comments table
    - Add policies for:
      - Creating comments on accessible tasks
      - Viewing comments on accessible tasks
*/

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can create comments on accessible tasks" ON task_comments;
DROP POLICY IF EXISTS "Users can view comments on accessible tasks" ON task_comments;

-- Enable RLS
ALTER TABLE task_comments ENABLE ROW LEVEL SECURITY;

-- Add policies
CREATE POLICY "Users can create comments on accessible tasks"
ON task_comments
FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM tasks
    LEFT JOIN task_shares ON tasks.id = task_shares.task_id
    WHERE tasks.id = task_comments.task_id
    AND (tasks.user_id = auth.uid() OR task_shares.user_id = auth.uid())
  )
);

CREATE POLICY "Users can view comments on accessible tasks"
ON task_comments
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM tasks
    LEFT JOIN task_shares ON tasks.id = task_shares.task_id
    WHERE tasks.id = task_comments.task_id
    AND (tasks.user_id = auth.uid() OR task_shares.user_id = auth.uid())
  )
);