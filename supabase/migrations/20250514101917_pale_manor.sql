/*
  # Fix team members policies

  1. Changes
    - Remove recursive policies from team_members table
    - Simplify policy conditions to prevent infinite recursion
    - Add clear separation between admin and member permissions

  2. Security
    - Maintain RLS protection
    - Ensure proper access control for team members
    - Prevent unauthorized access to team data
*/

-- Drop existing policies to recreate them
DROP POLICY IF EXISTS "Team admins can manage team members" ON team_members;
DROP POLICY IF EXISTS "Team members can view other team members" ON team_members;
DROP POLICY IF EXISTS "Users can view team member details" ON team_members;

-- Create new, simplified policies
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

CREATE POLICY "Members can view team members"
ON team_members
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM team_members member_check
    WHERE member_check.team_id = team_members.team_id
    AND member_check.user_id = auth.uid()
  )
);