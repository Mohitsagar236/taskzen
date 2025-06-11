/*
  # Backend Setup with Policy Checks
  
  1. Security
    - Enables RLS on all tables
    - Creates policies with existence checks
  2. Indexes
    - Adds performance optimization indexes
  3. Triggers
    - Sets up activity tracking
    - Implements usage monitoring
*/

-- Enable RLS on all tables if not already enabled
DO $$ 
BEGIN
  PERFORM 1 FROM pg_tables WHERE tablename = 'tasks' AND rowsecurity = false;
  IF FOUND THEN
    ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

DO $$ 
BEGIN
  PERFORM 1 FROM pg_tables WHERE tablename = 'task_shares' AND rowsecurity = false;
  IF FOUND THEN
    ALTER TABLE task_shares ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

DO $$ 
BEGIN
  PERFORM 1 FROM pg_tables WHERE tablename = 'task_assignments' AND rowsecurity = false;
  IF FOUND THEN
    ALTER TABLE task_assignments ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

DO $$ 
BEGIN
  PERFORM 1 FROM pg_tables WHERE tablename = 'task_comments' AND rowsecurity = false;
  IF FOUND THEN
    ALTER TABLE task_comments ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

DO $$ 
BEGIN
  PERFORM 1 FROM pg_tables WHERE tablename = 'teams' AND rowsecurity = false;
  IF FOUND THEN
    ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

DO $$ 
BEGIN
  PERFORM 1 FROM pg_tables WHERE tablename = 'team_members' AND rowsecurity = false;
  IF FOUND THEN
    ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

DO $$ 
BEGIN
  PERFORM 1 FROM pg_tables WHERE tablename = 'team_activities' AND rowsecurity = false;
  IF FOUND THEN
    ALTER TABLE team_activities ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Task Management Policies
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'tasks' AND policyname = 'Users can create their own tasks'
  ) THEN
    CREATE POLICY "Users can create their own tasks"
    ON tasks
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'tasks' AND policyname = 'Users can manage their own tasks'
  ) THEN
    CREATE POLICY "Users can manage their own tasks"
    ON tasks
    FOR ALL
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'tasks' AND policyname = 'Users can view tasks shared with them'
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

-- Task Sharing Policies
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'task_shares' AND policyname = 'Users can share their tasks'
  ) THEN
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
  END IF;
END $$;

-- Task Comments Policies
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'task_comments' AND policyname = 'Users can comment on accessible tasks'
  ) THEN
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
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'task_comments' AND policyname = 'Users can view comments on accessible tasks'
  ) THEN
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
  END IF;
END $$;

-- Team Management Policies
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'teams' AND policyname = 'Team members can access their teams'
  ) THEN
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
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'team_members' AND policyname = 'Team admins can manage members'
  ) THEN
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
  END IF;
END $$;

-- Add necessary indexes
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE indexname = 'idx_tasks_user_id'
  ) THEN
    CREATE INDEX idx_tasks_user_id ON tasks(user_id);
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE indexname = 'idx_tasks_status'
  ) THEN
    CREATE INDEX idx_tasks_status ON tasks(status);
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE indexname = 'idx_tasks_due_date'
  ) THEN
    CREATE INDEX idx_tasks_due_date ON tasks(due_date);
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE indexname = 'idx_task_shares_task_id'
  ) THEN
    CREATE INDEX idx_task_shares_task_id ON task_shares(task_id);
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE indexname = 'idx_task_shares_user_id'
  ) THEN
    CREATE INDEX idx_task_shares_user_id ON task_shares(user_id);
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE indexname = 'idx_team_members_team_id'
  ) THEN
    CREATE INDEX idx_team_members_team_id ON team_members(team_id);
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE indexname = 'idx_team_members_user_id'
  ) THEN
    CREATE INDEX idx_team_members_user_id ON team_members(user_id);
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE indexname = 'idx_task_comments_task_id'
  ) THEN
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