/*
  # Team Members View and Security

  1. Changes
    - Creates a secure view for team member user data
    - Adds performance indexes
    - Sets up proper security policies

  2. Security
    - Implements row level security
    - Adds policy for authenticated users to view team member details
*/

-- Create a view to safely expose auth.users data
CREATE OR REPLACE VIEW public.team_member_users AS
SELECT 
  id,
  email,
  raw_user_meta_data->>'name' as name,
  raw_user_meta_data->>'avatar_url' as avatar_url
FROM auth.users;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_team_members_user_id ON public.team_members(user_id);
CREATE INDEX IF NOT EXISTS idx_team_members_team_id ON public.team_members(team_id);

-- Set view owner to authenticated role
ALTER VIEW public.team_member_users OWNER TO authenticated;

-- Enable RLS on the view
ALTER TABLE public.team_member_users ENABLE ROW LEVEL SECURITY;

-- Add policies for the view
CREATE POLICY "Users can view team member details"
  ON public.team_member_users
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.user_id = auth.uid()
      AND team_members.team_id IN (
        SELECT team_id FROM team_members WHERE user_id = team_member_users.id
      )
    )
  );