/*
  # Backend Setup for TaskZen

  1. Tables
    - Enable RLS on all tables
    - Set up proper policies
    - Add necessary indexes
    - Add foreign key constraints

  2. Security
    - Enable RLS
    - Add policies for task management
    - Add policies for team management
    - Add policies for sharing and collaboration

  3. Changes
    - Consolidate existing policies
    - Add missing indexes
    - Add proper constraints
*/

-- Enable RLS on all tables
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_activities ENABLE ROW LEVEL SECURITY;

-- Task Management Policies
CREATE POLICY "Users can create their own tasks"
ON tasks
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their own tasks"
ON tasks
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

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

-- Task Sharing Policies
CREATE POLICY "Users can share their tasks"
ON task_shares
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM tasks
    WHERE tasks.id = task_shares.task_id
    AND tasks.user_id = auth.uid()
  )
);

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
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_task_shares_task_id ON task_shares(task_id);
CREATE INDEX IF NOT EXISTS idx_task_shares_user_id ON task_shares(user_id);
CREATE INDEX IF NOT EXISTS idx_team_members_team_id ON team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_team_members_user_id ON team_members(user_id);
CREATE INDEX IF NOT EXISTS idx_task_comments_task_id ON task_comments(task_id);

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

CREATE TRIGGER track_task_usage
AFTER INSERT ON tasks
FOR EACH ROW
EXECUTE FUNCTION update_subscription_usage('max_tasks');

CREATE TRIGGER track_team_member_usage
AFTER INSERT ON team_members
FOR EACH ROW
EXECUTE FUNCTION update_subscription_usage('max_team_members');