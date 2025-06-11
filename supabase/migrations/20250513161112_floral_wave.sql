/*
  # Team Members View and Security

  1. Changes
    - Creates a view to safely expose auth.users data
    - Adds performance indexes for team members
    - Sets up RLS policies for secure access

  2. Security
    - Implements row-level security for team member access
    - Ensures users can only view team members they have access to
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

-- Add policies for team members table
CREATE POLICY "Users can view team member details"
  ON public.team_members
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM team_members tm
      WHERE tm.user_id = auth.uid()
      AND tm.team_id = team_members.team_id
    )
  );