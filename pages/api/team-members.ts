import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 
    (typeof window !== 'undefined' ? import.meta.env.VITE_SUPABASE_URL : '');
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 
    (typeof window !== 'undefined' ? import.meta.env.VITE_SUPABASE_ANON_KEY : '');

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Support POST, PUT, and DELETE requests
  if (!['POST', 'PUT', 'DELETE'].includes(req.method || '')) {
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

    if (req.method === 'POST') {
      // Handle invitation of a new team member
      const { teamId, email, role } = req.body;

      // Validate required fields
      if (!teamId || !email || !role) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      // Check if the current user is an admin or owner of the team
      const { data: membership, error: membershipError } = await supabase
        .from('team_members')
        .select('role')
        .eq('team_id', teamId)
        .eq('user_id', userId)
        .single();

      if (membershipError || !membership) {
        return res.status(403).json({ error: 'You do not have permission to invite members to this team' });
      }

      if (!['owner', 'admin'].includes(membership.role)) {
        return res.status(403).json({ error: 'Only team owners and admins can invite new members' });
      }

      // Check if the user already exists
      const { data: invitedUser, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .single();

      if (userError && userError.code !== 'PGRST116') { // PGRST116 is the "not found" error
        console.error('Error checking if user exists:', userError);
        return res.status(500).json({ error: 'Failed to check if user exists' });
      }

      const invitedUserId = invitedUser?.id;

      if (invitedUserId) {
        // Check if user is already a member of this team
        const { data: existingMembership, error: existingError } = await supabase
          .from('team_members')
          .select('id')
          .eq('team_id', teamId)
          .eq('user_id', invitedUserId)
          .single();

        if (!existingError && existingMembership) {
          return res.status(400).json({ error: 'User is already a member of this team' });
        }

        // Add the user directly as a team member
        const { data: member, error: memberError } = await supabase
          .from('team_members')
          .insert([
            { 
              team_id: teamId,
              user_id: invitedUserId,
              role
            }
          ])
          .select()
          .single();

        if (memberError) {
          console.error('Error adding team member:', memberError);
          return res.status(500).json({ error: 'Failed to add team member' });
        }

        return res.status(201).json({ member });
      } else {
        // TODO: Handle invitation for users not in the system yet
        // For now, just return an error
        return res.status(404).json({ error: 'User not found' });
      }
    } 
    else if (req.method === 'PUT') {
      // Handle updating a team member's role
      const { memberId, role } = req.body;

      // Validate required fields
      if (!memberId || !role) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      // Get the team_id from the member record
      const { data: memberData, error: memberError } = await supabase
        .from('team_members')
        .select('team_id, role')
        .eq('id', memberId)
        .single();

      if (memberError || !memberData) {
        return res.status(404).json({ error: 'Team member not found' });
      }

      // Check if the current user is an admin or owner of the team
      const { data: userMembership, error: userMembershipError } = await supabase
        .from('team_members')
        .select('role')
        .eq('team_id', memberData.team_id)
        .eq('user_id', userId)
        .single();

      if (userMembershipError || !userMembership) {
        return res.status(403).json({ error: 'You do not have permission to update members in this team' });
      }

      if (!['owner', 'admin'].includes(userMembership.role)) {
        return res.status(403).json({ error: 'Only team owners and admins can update member roles' });
      }

      // Can't change the role of an owner
      if (memberData.role === 'owner') {
        return res.status(403).json({ error: 'Cannot change the role of a team owner' });
      }

      // Update the member's role
      const { data: updatedMember, error: updateError } = await supabase
        .from('team_members')
        .update({ role })
        .eq('id', memberId)
        .select()
        .single();

      if (updateError) {
        console.error('Error updating team member:', updateError);
        return res.status(500).json({ error: 'Failed to update team member' });
      }

      return res.status(200).json({ member: updatedMember });
    }
    else if (req.method === 'DELETE') {
      // Handle removing a team member
      const { memberId } = req.body;

      // Validate required fields
      if (!memberId) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      // Get the team_id and role from the member record
      const { data: memberData, error: memberError } = await supabase
        .from('team_members')
        .select('team_id, role, user_id')
        .eq('id', memberId)
        .single();

      if (memberError || !memberData) {
        return res.status(404).json({ error: 'Team member not found' });
      }

      // Check if the current user is an admin or owner of the team
      const { data: userMembership, error: userMembershipError } = await supabase
        .from('team_members')
        .select('role')
        .eq('team_id', memberData.team_id)
        .eq('user_id', userId)
        .single();

      if (userMembershipError || !userMembership) {
        return res.status(403).json({ error: 'You do not have permission to remove members from this team' });
      }

      // Can't remove an owner
      if (memberData.role === 'owner') {
        return res.status(403).json({ error: 'Cannot remove the team owner' });
      }

      // Check if the current user has sufficient permissions
      if (userMembership.role !== 'owner' && 
          !(userMembership.role === 'admin' && memberData.role !== 'admin')) {
        return res.status(403).json({ 
          error: 'You do not have permission to remove this member. Admins can only remove regular members.'
        });
      }

      // Remove the member
      const { error: deleteError } = await supabase
        .from('team_members')
        .delete()
        .eq('id', memberId);

      if (deleteError) {
        console.error('Error removing team member:', deleteError);
        return res.status(500).json({ error: 'Failed to remove team member' });
      }

      return res.status(200).json({ success: true });
    }
  } catch (error) {
    console.error('Unexpected error in /api/team-members:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
