/*
  # Fix RLS Policies and Table Security

  1. Security
    - Enable RLS on all tables
    - Drop and recreate policies with proper checks
    - Add necessary indexes for performance
  
  2. Changes
    - Consolidate and fix policy definitions
    - Add activity tracking triggers
    - Add subscription usage tracking
*/

-- First enable RLS on all tables
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_activities ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies to avoid conflicts
DO $$ 
BEGIN
  -- Tasks policies
  DROP POLICY IF EXISTS "Users can create tasks" ON tasks;
  DROP POLICY IF EXISTS "Users can view own and shared tasks" ON tasks;
  DROP POLICY IF EXISTS "Users can update own tasks" ON tasks;
  DROP POLICY IF EXISTS "Users can delete own tasks" ON tasks;
  
  -- Task shares policies
  DROP POLICY IF EXISTS "Users can share their tasks" ON task_shares;
  
  -- Task comments policies
  DROP POLICY IF EXISTS "Users can comment on accessible tasks" ON task_comments;
  DROP POLICY IF EXISTS "Users can view comments on accessible tasks" ON task_comments;
  
  -- Team policies
  DROP POLICY IF EXISTS "Team members can access their teams" ON teams;
  DROP POLICY IF EXISTS "Team admins can manage members" ON team_members;
END $$;

-- Create new consolidated policies for tasks
CREATE POLICY "Users can create tasks"
ON tasks
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own and shared tasks"
ON tasks
FOR SELECT
TO authenticated
USING (
  auth.uid() = user_id OR
  EXISTS (
    SELECT 1 FROM task_shares
    WHERE task_shares.task_id = tasks.id
    AND task_shares.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update own tasks"
ON tasks
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own tasks"
ON tasks
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Task Comments Policies
CREATE POLICY "Users can comment on accessible tasks"
ON task_comments
FOR INSERT
TO authenticated
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
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM tasks
    LEFT JOIN task_shares ON tasks.id = task_shares.task_id
    WHERE tasks.id = task_comments.task_id
    AND (tasks.user_id = auth.uid() OR task_shares.user_id = auth.uid())
  )
);

-- Team Management Policies
CREATE POLICY "Team members can access their teams"
ON teams
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM team_members
    WHERE team_members.team_id = teams.id
    AND team_members.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM team_members
    WHERE team_members.team_id = teams.id
    AND team_members.user_id = auth.uid()
    AND team_members.role = 'admin'
  )
);

CREATE POLICY "Team admins can manage members"
ON team_members
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM team_members admin_check
    WHERE admin_check.team_id = team_members.team_id
    AND admin_check.user_id = auth.uid()
    AND admin_check.role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM team_members admin_check
    WHERE admin_check.team_id = team_members.team_id
    AND admin_check.user_id = auth.uid()
    AND admin_check.role = 'admin'
  )
);

-- Add necessary indexes
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_tasks_user_id') THEN
    CREATE INDEX idx_tasks_user_id ON tasks(user_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_tasks_status') THEN
    CREATE INDEX idx_tasks_status ON tasks(status);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_tasks_due_date') THEN
    CREATE INDEX idx_tasks_due_date ON tasks(due_date);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_task_shares_task_id') THEN
    CREATE INDEX idx_task_shares_task_id ON task_shares(task_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_task_shares_user_id') THEN
    CREATE INDEX idx_task_shares_user_id ON task_shares(user_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_team_members_team_id') THEN
    CREATE INDEX idx_team_members_team_id ON team_members(team_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_team_members_user_id') THEN
    CREATE INDEX idx_team_members_user_id ON team_members(user_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_task_comments_task_id') THEN
    CREATE INDEX idx_task_comments_task_id ON task_comments(task_id);
  END IF;
END $$;

-- Add triggers for activity tracking
CREATE OR REPLACE FUNCTION update_team_activity()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO team_activities (team_id, user_id, action, entity_type, entity_id)
    VALUES (NEW.team_id, auth.uid(), 'created', TG_TABLE_NAME, NEW.id);
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO team_activities (team_id, user_id, action, entity_type, entity_id)
    VALUES (NEW.team_id, auth.uid(), 'updated', TG_TABLE_NAME, NEW.id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS track_task_activity ON tasks;
CREATE TRIGGER track_task_activity
AFTER INSERT OR UPDATE ON tasks
FOR EACH ROW
WHEN (NEW.team_id IS NOT NULL)
EXECUTE FUNCTION update_team_activity();

-- Add function for subscription usage tracking
CREATE OR REPLACE FUNCTION update_subscription_usage()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO subscription_usage (subscription_id, feature, used)
  VALUES (
    (SELECT id FROM subscriptions WHERE user_id = auth.uid()),
    TG_ARGV[0],
    1
  )
  ON CONFLICT (subscription_id, feature) DO UPDATE
  SET used = subscription_usage.used + 1;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS track_task_usage ON tasks;
CREATE TRIGGER track_task_usage
AFTER INSERT ON tasks
FOR EACH ROW
EXECUTE FUNCTION update_subscription_usage('max_tasks');

DROP TRIGGER IF EXISTS track_team_member_usage ON team_members;
CREATE TRIGGER track_team_member_usage
AFTER INSERT ON team_members
FOR EACH ROW
EXECUTE FUNCTION update_subscription_usage('max_team_members');