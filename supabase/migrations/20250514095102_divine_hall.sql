/*
  # Team member users view and indexes
  
  1. Changes
    - Create team_member_users view to expose user data safely
    - Add performance indexes for team members
    - Set up RLS policies for secure access
  
  2. Security
    - Enable RLS on view
    - Add policy for authenticated users to view team member details
*/

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_team_members_user_id ON public.team_members(user_id);
CREATE INDEX IF NOT EXISTS idx_team_members_team_id ON public.team_members(team_id);

-- Create a view to safely expose auth.users data
CREATE OR REPLACE VIEW public.team_member_users AS
SELECT 
  id,
  email,
  raw_user_meta_data->>'name' as name,
  raw_user_meta_data->>'avatar_url' as avatar_url
FROM auth.users;

-- Enable RLS on the view
ALTER VIEW public.team_member_users ENABLE ROW LEVEL SECURITY;

-- Add policies for the view
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Users can view team member details" ON public.team_member_users;
  
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
END $$;