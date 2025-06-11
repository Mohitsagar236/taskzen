/*
  # Team Management Schema Updates
  
  This migration ensures team-related tables and functionality exist and are properly configured.
  
  1. Tables
    - Ensures teams, team_members, and team_activities tables exist
    - Adds team_id to tasks table if not present
  
  2. Security
    - Enables RLS on all team-related tables
    - Creates or updates policies for team access control
  
  3. Functions & Triggers
    - Creates activity logging function and trigger
    - Handles team member management
  
  4. Indexes
    - Creates performance-optimizing indexes for team-related queries
*/

-- Create team_role type if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'team_role') THEN
    CREATE TYPE team_role AS ENUM ('admin', 'editor', 'viewer');
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

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

-- Create function to update team activity if it doesn't exist
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

-- Create trigger for activity logging if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'log_task_activity'
  ) THEN
    CREATE TRIGGER log_task_activity
      AFTER INSERT OR UPDATE
      ON tasks
      FOR EACH ROW
      WHEN (NEW.team_id IS NOT NULL)
      EXECUTE FUNCTION update_team_activity();
  END IF;
END $$;

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

-- Ensure RLS is enabled
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_activities ENABLE ROW LEVEL SECURITY;

-- Create or replace policies
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Team members can view their teams" ON teams;
  DROP POLICY IF EXISTS "Team admins can update their teams" ON teams;
  DROP POLICY IF EXISTS "Team members can view other team members" ON team_members;
  DROP POLICY IF EXISTS "Team admins can manage team members" ON team_members;
  DROP POLICY IF EXISTS "Team members can view activities" ON team_activities;

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
END $$;