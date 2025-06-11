/*
  # Update task policies with checks

  This migration ensures task policies are properly set up by:
  1. Checking for existing policies before creating new ones
  2. Using DO blocks for conditional creation
  3. Maintaining proper RLS security
*/

-- Enable RLS on tasks table if not already enabled
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'tasks' 
    AND rowsecurity = true
  ) THEN
    ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Create policies only if they don't exist
DO $$ 
BEGIN
  -- Insert policy
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'tasks' 
    AND policyname = 'Users can create their own tasks'
  ) THEN
    CREATE POLICY "Users can create their own tasks"
    ON tasks
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);
  END IF;

  -- All operations policy
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'tasks' 
    AND policyname = 'Users can manage their own tasks'
  ) THEN
    CREATE POLICY "Users can manage their own tasks"
    ON tasks
    FOR ALL
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
  END IF;

  -- Shared tasks policy
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'tasks' 
    AND policyname = 'Users can view tasks shared with them'
  ) THEN
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
  END IF;
END $$;