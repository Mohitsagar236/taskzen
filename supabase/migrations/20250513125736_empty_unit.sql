/*
  # Add foreign key relationships for task comments

  1. Changes
    - Add foreign key constraint from task_comments.user_id to users.id
    - Enable RLS on task_comments table
    - Add policies for task comments access

  2. Security
    - Enable RLS
    - Add policies for authenticated users to:
      - Create comments on tasks they have access to
      - Read comments on tasks they have access to
*/

-- Add foreign key constraint
ALTER TABLE task_comments
ADD CONSTRAINT task_comments_user_id_fkey
FOREIGN KEY (user_id) REFERENCES users(id)
ON DELETE CASCADE;

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