-- Drop existing team policies
DROP POLICY IF EXISTS "Team members can access their teams" ON teams;
DROP POLICY IF EXISTS "Team admins can manage members" ON team_members;

-- Create new team policies that allow creation
CREATE POLICY "Users can create and manage teams"
ON teams
FOR ALL 
TO authenticated
USING (
  auth.uid() = created_by OR  -- Team creator can access
  EXISTS (
    SELECT 1 FROM team_members
    WHERE team_members.team_id = teams.id
    AND team_members.user_id = auth.uid()
  )
)
WITH CHECK (
  auth.uid() = created_by OR  -- Team creator can modify
  EXISTS (
    SELECT 1 FROM team_members
    WHERE team_members.team_id = teams.id
    AND team_members.user_id = auth.uid()
    AND team_members.role = 'admin'
  )
);

-- Update team members policy
CREATE POLICY "Team admins can manage members"
ON team_members
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM teams
    WHERE teams.id = team_members.team_id
    AND (
      teams.created_by = auth.uid() OR  -- Team creator can manage members
      EXISTS (
        SELECT 1 FROM team_members admin_check
        WHERE admin_check.team_id = team_members.team_id
        AND admin_check.user_id = auth.uid()
        AND admin_check.role = 'admin'
      )
    )
  )
);
