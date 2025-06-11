/*
  # Add RLS policies for tasks table

  1. Changes
    - Add INSERT policy for tasks table to allow authenticated users to create their own tasks
    - Ensure proper RLS policies are in place for task management

  2. Security
    - Enable RLS on tasks table (if not already enabled)
    - Add policy for authenticated users to insert their own tasks
    - Maintain existing policies for task management
*/

-- Enable RLS on tasks table (idempotent)
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Drop existing INSERT policy if it exists
DROP POLICY IF EXISTS "Users can create their own tasks" ON tasks;

-- Create new INSERT policy
CREATE POLICY "Users can create their own tasks"
ON tasks
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Ensure other necessary policies exist (idempotent)
DO $$
BEGIN
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
END
$$;