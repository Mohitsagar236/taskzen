/*
  # Team Collaboration Schema

  1. New Tables
    - teams (if not exists)
    - team_members (if not exists)
    - team_activities (if not exists)
  
  2. Changes
    - Add team_id to tasks table (if not exists)
    
  3. Security
    - Enable RLS
    - Add policies for teams, members, and activities
    
  4. Functions & Triggers
    - Activity logging function
    - Task activity trigger
*/

-- Create teams table if not exists
CREATE TABLE IF NOT EXISTS teams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  created_by uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  avatar_url text,
  settings jsonb DEFAULT '{}'::jsonb,
  CONSTRAINT teams_name_check CHECK (char_length(name) >= 3)
);

-- Create team_members table if not exists
CREATE TABLE IF NOT EXISTS team_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid REFERENCES teams(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('admin', 'editor', 'viewer')),
  joined_at timestamptz DEFAULT now(),
  invited_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  UNIQUE (team_id, user_id)
);

-- Create team_activities table if not exists
CREATE TABLE IF NOT EXISTS team_activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid REFERENCES teams(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id uuid,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Add team_id to tasks table if not exists
DO $$ 
BEGIN 
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tasks' 
    AND column_name = 'team_id'
  ) THEN
    ALTER TABLE tasks
    ADD COLUMN team_id uuid REFERENCES teams(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Enable RLS
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_activities ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Team members can view their teams" ON teams;
DROP POLICY IF EXISTS "Team admins can update their teams" ON teams;
DROP POLICY IF EXISTS "Team members can view other team members" ON team_members;
DROP POLICY IF EXISTS "Team admins can manage team members" ON team_members;
DROP POLICY IF EXISTS "Team members can view activities" ON team_activities;

-- Create policies for teams
CREATE POLICY "Team members can view their teams"
  ON teams
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.team_id = teams.id
      AND team_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Team admins can update their teams"
  ON teams
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.team_id = teams.id
      AND team_members.user_id = auth.uid()
      AND team_members.role = 'admin'
    )
  );

-- Create policies for team_members
CREATE POLICY "Team members can view other team members"
  ON team_members
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM team_members tm
      WHERE tm.team_id = team_members.team_id
      AND tm.user_id = auth.uid()
    )
  );

CREATE POLICY "Team admins can manage team members"
  ON team_members
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM team_members tm
      WHERE tm.team_id = team_members.team_id
      AND tm.user_id = auth.uid()
      AND tm.role = 'admin'
    )
  );

-- Create policies for team_activities
CREATE POLICY "Team members can view activities"
  ON team_activities
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.team_id = team_activities.team_id
      AND team_members.user_id = auth.uid()
    )
  );

-- Drop existing function and trigger if they exist
DROP TRIGGER IF EXISTS log_task_activity ON tasks;
DROP FUNCTION IF EXISTS update_team_activity();

-- Create function to update team activity
CREATE OR REPLACE FUNCTION update_team_activity()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO team_activities (team_id, user_id, action, entity_type, entity_id, metadata)
  VALUES (
    NEW.team_id,
    auth.uid(),
    TG_OP,
    TG_TABLE_NAME,
    NEW.id,
    jsonb_build_object('changes', row_to_json(NEW))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for activity logging
CREATE TRIGGER log_task_activity
  AFTER INSERT OR UPDATE
  ON tasks
  FOR EACH ROW
  WHEN (NEW.team_id IS NOT NULL)
  EXECUTE FUNCTION update_team_activity();

-- Create indexes if they don't exist
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_team_members_team_id') THEN
    CREATE INDEX idx_team_members_team_id ON team_members(team_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_team_members_user_id') THEN
    CREATE INDEX idx_team_members_user_id ON team_members(user_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_team_activities_team_id') THEN
    CREATE INDEX idx_team_activities_team_id ON team_activities(team_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_tasks_team_id') THEN
    CREATE INDEX idx_tasks_team_id ON tasks(team_id);
  END IF;
END $$;