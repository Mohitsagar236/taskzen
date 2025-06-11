/*
  # Update task comments security

  1. Security
    - Enable RLS on task_comments table
    - Add policy for creating comments on accessible tasks
    - Add policy for viewing comments on accessible tasks
*/

-- Enable RLS if not already enabled
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'task_comments' 
    AND rowsecurity = true
  ) THEN
    ALTER TABLE task_comments ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Add policies if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'task_comments' 
    AND policyname = 'Users can create comments on accessible tasks'
  ) THEN
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
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'task_comments' 
    AND policyname = 'Users can view comments on accessible tasks'
  ) THEN
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
  END IF;
END $$;