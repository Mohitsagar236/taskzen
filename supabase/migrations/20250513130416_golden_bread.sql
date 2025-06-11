/*
  # Add advanced task management features

  1. New Tables
    - `subtasks`: For breaking down tasks into smaller units
    - `tags`: For task categorization and filtering
    - `task_tags`: Junction table for task-tag relationships
    - `task_recurrence`: For managing recurring tasks

  2. Changes to existing tables
    - Add `reminder_at` to tasks table
    - Add `parent_task_id` to tasks table for subtask relationships
    - Add `status` to tasks table for Kanban board view

  3. Security
    - Enable RLS on all new tables
    - Add policies for authenticated users
*/

-- Add new columns to tasks table
ALTER TABLE tasks
ADD COLUMN IF NOT EXISTS reminder_at timestamptz,
ADD COLUMN IF NOT EXISTS parent_task_id uuid REFERENCES tasks(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'todo'
CHECK (status IN ('todo', 'in_progress', 'review', 'done'));

-- Create tags table
CREATE TABLE IF NOT EXISTS tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  color text NOT NULL DEFAULT '#000000',
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(name, user_id)
);

ALTER TABLE tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own tags"
ON tags
FOR ALL TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create task_tags junction table
CREATE TABLE IF NOT EXISTS task_tags (
  task_id uuid REFERENCES tasks(id) ON DELETE CASCADE,
  tag_id uuid REFERENCES tags(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (task_id, tag_id)
);

ALTER TABLE task_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage tags for their tasks"
ON task_tags
FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM tasks
    WHERE tasks.id = task_tags.task_id
    AND tasks.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM tasks
    WHERE tasks.id = task_tags.task_id
    AND tasks.user_id = auth.uid()
  )
);

-- Create task_recurrence table
CREATE TABLE IF NOT EXISTS task_recurrence (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  frequency text NOT NULL CHECK (frequency IN ('daily', 'weekly', 'monthly', 'yearly')),
  interval integer NOT NULL DEFAULT 1,
  days_of_week integer[] DEFAULT NULL,
  day_of_month integer DEFAULT NULL CHECK (day_of_month BETWEEN 1 AND 31),
  month_of_year integer DEFAULT NULL CHECK (month_of_year BETWEEN 1 AND 12),
  start_date date NOT NULL,
  end_date date DEFAULT NULL,
  last_generated_at timestamptz DEFAULT NULL,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT valid_recurrence_pattern CHECK (
    (frequency = 'daily') OR
    (frequency = 'weekly' AND days_of_week IS NOT NULL) OR
    (frequency = 'monthly' AND day_of_month IS NOT NULL) OR
    (frequency = 'yearly' AND day_of_month IS NOT NULL AND month_of_year IS NOT NULL)
  )
);

ALTER TABLE task_recurrence ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage recurrence for their tasks"
ON task_recurrence
FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM tasks
    WHERE tasks.id = task_recurrence.task_id
    AND tasks.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM tasks
    WHERE tasks.id = task_recurrence.task_id
    AND tasks.user_id = auth.uid()
  )
);