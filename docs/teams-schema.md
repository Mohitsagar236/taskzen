# Teams Database Schema for Supabase

This document outlines the database schema required for the teams feature in Supabase.

## Tables

### teams

```sql
CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  avatar_url TEXT
);

-- Add RLS policies for teams
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;

-- Policy to allow team owners to update their teams
CREATE POLICY "Team owners can update their teams" 
  ON teams 
  FOR UPDATE 
  USING (auth.uid() = owner_id);

-- Policy to allow users to read teams they're members of
CREATE POLICY "Users can view teams they belong to" 
  ON teams 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM team_members 
      WHERE team_members.team_id = id 
      AND team_members.user_id = auth.uid()
    )
    OR auth.uid() = owner_id
  );

-- Policy to allow users to create teams
CREATE POLICY "Users can create teams" 
  ON teams 
  FOR INSERT 
  WITH CHECK (auth.uid() = owner_id);

-- Policy to allow team owners to delete their teams
CREATE POLICY "Team owners can delete their teams" 
  ON teams 
  FOR DELETE 
  USING (auth.uid() = owner_id);
```

### team_members

```sql
CREATE TABLE team_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'member')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(team_id, user_id)
);

-- Add RLS policies for team_members
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

-- Policy to allow team owners and admins to manage members
CREATE POLICY "Team owners and admins can manage members" 
  ON team_members 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM team_members AS tm 
      WHERE tm.team_id = team_id 
      AND tm.user_id = auth.uid() 
      AND tm.role IN ('owner', 'admin')
    )
    OR (
      EXISTS (
        SELECT 1 FROM teams 
        WHERE teams.id = team_id 
        AND teams.owner_id = auth.uid()
      )
    )
  );

-- Policy to allow users to view members of teams they belong to
CREATE POLICY "Users can view members of their teams" 
  ON team_members 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM team_members AS tm 
      WHERE tm.team_id = team_id 
      AND tm.user_id = auth.uid()
    )
  );
```

## Functions

### create_team_with_owner

```sql
CREATE OR REPLACE FUNCTION create_team_with_owner(
  team_name TEXT,
  team_description TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  new_team_id UUID;
BEGIN
  -- Insert the team
  INSERT INTO teams (name, description, owner_id)
  VALUES (team_name, team_description, auth.uid())
  RETURNING id INTO new_team_id;
  
  -- Add the creator as owner
  INSERT INTO team_members (team_id, user_id, role)
  VALUES (new_team_id, auth.uid(), 'owner');
  
  RETURN new_team_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
