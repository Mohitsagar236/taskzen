/*
  # Add Collaboration Features

  1. New Tables
    - `task_shares`
      - `id` (uuid, primary key)
      - `task_id` (uuid, references tasks)
      - `user_id` (uuid, references auth.users)
      - `permission` (text: 'view' or 'edit')
      - `created_at` (timestamp)

    - `task_assignments`
      - `id` (uuid, primary key)
      - `task_id` (uuid, references tasks)
      - `assigned_to` (uuid, references auth.users)
      - `assigned_by` (uuid, references auth.users)
      - `created_at` (timestamp)

    - `task_comments`
      - `id` (uuid, primary key)
      - `task_id` (uuid, references tasks)
      - `user_id` (uuid, references auth.users)
      - `content` (text)
      - `created_at` (timestamp)
      - `mentions` (uuid[], stores mentioned user IDs)

  2. Security
    - Enable RLS on all new tables
    - Add policies for task sharing and commenting
*/

-- Create task_shares table
CREATE TABLE IF NOT EXISTS task_shares (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid REFERENCES tasks(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  permission text NOT NULL CHECK (permission IN ('view', 'edit')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(task_id, user_id)
);

-- Create task_assignments table
CREATE TABLE IF NOT EXISTS task_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid REFERENCES tasks(id) ON DELETE CASCADE,
  assigned_to uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  assigned_by uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(task_id, assigned_to)
);

-- Create task_comments table
CREATE TABLE IF NOT EXISTS task_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid REFERENCES tasks(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  content text NOT NULL,
  mentions uuid[] DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE task_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_comments ENABLE ROW LEVEL SECURITY;

-- Policies for task_shares
CREATE POLICY "Users can create task shares" ON task_shares
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM tasks
    WHERE tasks.id = task_id AND tasks.user_id = auth.uid()
  ));

CREATE POLICY "Users can view shared tasks" ON tasks
  FOR SELECT TO authenticated
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM task_shares
      WHERE task_shares.task_id = tasks.id
      AND task_shares.user_id = auth.uid()
    )
  );

-- Policies for task_assignments
CREATE POLICY "Users can assign tasks they own" ON task_assignments
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM tasks
    WHERE tasks.id = task_id AND tasks.user_id = auth.uid()
  ));

CREATE POLICY "Users can view their assignments" ON task_assignments
  FOR SELECT TO authenticated
  USING (assigned_to = auth.uid() OR assigned_by = auth.uid());

-- Policies for task_comments
CREATE POLICY "Users can create comments on accessible tasks" ON task_comments
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM tasks
    LEFT JOIN task_shares ON tasks.id = task_shares.task_id
    WHERE tasks.id = task_id
    AND (tasks.user_id = auth.uid() OR task_shares.user_id = auth.uid())
  ));

CREATE POLICY "Users can view comments on accessible tasks" ON task_comments
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM tasks
    LEFT JOIN task_shares ON tasks.id = task_shares.task_id
    WHERE tasks.id = task_id
    AND (tasks.user_id = auth.uid() OR task_shares.user_id = auth.uid())
  ));