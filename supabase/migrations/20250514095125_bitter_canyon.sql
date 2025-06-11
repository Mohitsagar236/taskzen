/*
  # Team member users view and indexes
  
  1. Changes
    - Create indexes for team members table
    - Create a secure view for exposing user data
    - Implement row-level security through view definition
  
  2. Security
    - View only exposes necessary user fields
    - Access restricted to team members only
*/

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_team_members_user_id ON public.team_members(user_id);
CREATE INDEX IF NOT EXISTS idx_team_members_team_id ON public.team_members(team_id);

-- Create a view to safely expose auth.users data with built-in security
CREATE OR REPLACE VIEW public.team_member_users AS
SELECT DISTINCT 
  u.id,
  u.email,
  u.raw_user_meta_data->>'name' as name,
  u.raw_user_meta_data->>'avatar_url' as avatar_url
FROM auth.users u
INNER JOIN team_members tm ON tm.user_id = u.id
WHERE EXISTS (
  SELECT 1 
  FROM team_members 
  WHERE team_members.team_id = tm.team_id 
  AND team_members.user_id = auth.uid()
);