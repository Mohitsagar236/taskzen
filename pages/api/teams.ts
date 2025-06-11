import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client - using the same environment variables as the rest of your app
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 
    (typeof window !== 'undefined' ? import.meta.env.VITE_SUPABASE_URL : '');
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 
    (typeof window !== 'undefined' ? import.meta.env.VITE_SUPABASE_ANON_KEY : '');

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {  // Support GET, POST, PUT and DELETE requests
  if (!['GET', 'POST', 'PUT', 'DELETE'].includes(req.method || '')) {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  try {
    // Get the current session to authenticate the user
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    // Check if the user is authenticated
    if (sessionError || !session) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const userId = session.user.id;
    
    // Handle POST request to create a new team
    if (req.method === 'POST') {
      const { name, description } = req.body;
      
      // Validate required fields
      if (!name) {
        return res.status(400).json({ error: 'Team name is required' });
      }
      
      // Create a new team
      const { data: team, error: createError } = await supabase
        .from('teams')
        .insert([
          { 
            name,
            description: description || null,
            owner_id: userId 
          }
        ])
        .select()
        .single();
      
      if (createError) {
        console.error('Error creating team:', createError);
        return res.status(500).json({ error: 'Failed to create team' });
      }
      
      // Add the creator as a team member with owner role
      const { error: memberError } = await supabase
        .from('team_members')
        .insert([
          { 
            team_id: team.id,
            user_id: userId,
            role: 'owner' 
          }
        ]);
      
      if (memberError) {
        console.error('Error adding team member:', memberError);
        return res.status(500).json({ error: 'Failed to add team member' });
      }
        return res.status(201).json({ team });
    }
    
    // Handle PUT request to update a team
    if (req.method === 'PUT') {
      const { id, name, description } = req.body;
      
      // Validate required fields
      if (!id || !name) {
        return res.status(400).json({ error: 'Team ID and name are required' });
      }
      
      // Check if the user has permission to update the team
      const { data: membership, error: membershipError } = await supabase
        .from('team_members')
        .select('role')
        .eq('team_id', id)
        .eq('user_id', userId)
        .single();
      
      if (membershipError || !membership) {
        return res.status(403).json({ error: 'You do not have permission to update this team' });
      }
      
      if (!['owner', 'admin'].includes(membership.role)) {
        return res.status(403).json({ error: 'Only team owners and admins can update team details' });
      }
      
      // Update the team
      const { data: updatedTeam, error: updateError } = await supabase
        .from('teams')
        .update({ 
          name, 
          description: description || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();
      
      if (updateError) {
        console.error('Error updating team:', updateError);
        return res.status(500).json({ error: 'Failed to update team' });
      }
      
      return res.status(200).json({ team: updatedTeam });
    }
    
    // Handle DELETE request to delete a team
    if (req.method === 'DELETE') {
      const { id } = req.body;
      
      // Validate required fields
      if (!id) {
        return res.status(400).json({ error: 'Team ID is required' });
      }
      
      // Check if the user is the owner of the team
      const { data: membership, error: membershipError } = await supabase
        .from('team_members')
        .select('role')
        .eq('team_id', id)
        .eq('user_id', userId)
        .single();
      
      if (membershipError || !membership) {
        return res.status(403).json({ error: 'You do not have permission to delete this team' });
      }
      
      if (membership.role !== 'owner') {
        return res.status(403).json({ error: 'Only team owners can delete teams' });
      }
      
      // Delete team members first (cascade deletion might handle this, but being explicit)
      const { error: membersDeleteError } = await supabase
        .from('team_members')
        .delete()
        .eq('team_id', id);
      
      if (membersDeleteError) {
        console.error('Error deleting team members:', membersDeleteError);
        return res.status(500).json({ error: 'Failed to delete team members' });
      }
      
      // Delete the team
      const { error: teamDeleteError } = await supabase
        .from('teams')
        .delete()
        .eq('id', id);
      
      if (teamDeleteError) {
        console.error('Error deleting team:', teamDeleteError);
        return res.status(500).json({ error: 'Failed to delete team' });
      }
      
      return res.status(200).json({ success: true });
    }
    
    // Handle GET request to fetch teams
    const userId = session.user.id;

    // Query for teams that the user is a member of
    const { data: teamMemberships, error: membershipError } = await supabase
      .from('team_members')
      .select('team_id')
      .eq('user_id', userId);

    if (membershipError) {
      console.error('Error fetching team memberships:', membershipError);
      return res.status(500).json({ error: 'Failed to fetch team memberships' });
    }

    // If user has no teams, return empty array
    if (!teamMemberships || teamMemberships.length === 0) {
      return res.status(200).json({ teams: [] });
    }

    // Extract team IDs from memberships
    const teamIds = teamMemberships.map(membership => membership.team_id);

    // Query teams table to get team details
    const { data: teams, error: teamsError } = await supabase
      .from('teams')
      .select('*')
      .in('id', teamIds);

    if (teamsError) {
      console.error('Error fetching teams:', teamsError);
      return res.status(500).json({ error: 'Failed to fetch teams' });
    }

    // Return the teams data
    return res.status(200).json({ teams: teams || [] });
  } catch (error) {
    console.error('Unexpected error in /api/teams:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
