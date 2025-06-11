/*
  # Task Comments Security Configuration

  1. Security
    - Enable Row Level Security (RLS) on task_comments table
    - Add policy for authenticated users to create comments on accessible tasks
    - Add policy for authenticated users to view comments on accessible tasks

  Note: Foreign key constraint skipped as it already exists
*/

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