import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { useUserStore } from './userStore';

interface Team {
  id: string;
  name: string;
  description?: string;
  avatarUrl?: string;
  createdBy: string;
  createdAt: Date;
  members: TeamMember[];
  settings: any;
}

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'editor' | 'viewer';
  avatarUrl?: string;
  joinedAt: Date;
}

interface Activity {
  id: string;
  user: {
    id: string;
    name: string;
    avatarUrl?: string;
  };
  action: string;
  entityType: string;
  entityId: string;
  metadata: any;
  createdAt: Date;
}

interface TeamStore {
  teams: Team[];
  currentTeam: Team | null;
  members: TeamMember[];
  activities: Activity[];
  loading: boolean;
  error: string | null;
  currentUserId: string | null;
  setCurrentTeam: (team: Team) => void;
  fetchTeams: () => Promise<void>;
  createTeam: (team: { name: string; description?: string }) => Promise<void>;
  updateTeam: (id: string, name: string, description?: string) => Promise<void>;
  deleteTeam: (id: string) => Promise<void>;
  inviteMember: (teamId: string, email: string, role: TeamMember['role']) => Promise<void>;
  updateMemberRole: (memberId: string, role: TeamMember['role']) => Promise<void>;
  removeMember: (memberId: string) => Promise<void>;
  fetchActivities: (teamId: string) => Promise<void>;
}

export const useTeamStore = create<TeamStore>((set, get) => ({
  teams: [],
  currentTeam: null,
  members: [],
  activities: [],
  loading: false,
  error: null,
  currentUserId: null,
  
  setCurrentTeam: (team: Team) => {
    set({ currentTeam: team, members: team.members || [] });
  },
  fetchTeams: async () => {
    try {
      set({ loading: true });
      
      // Get the current user ID from the user store or the auth session
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          set({ currentUserId: session.user.id });
        }
      } catch (sessionError) {
        console.error('Error getting current user:', sessionError);
      }

      const { data: teams, error } = await supabase
        .from('teams')
        .select(`
          *,
          team_members (
            id,
            user_id,
            role,
            joined_at,
            team_member_users!team_members_user_id_fkey!inner (
              id,
              email,
              name,
              avatar_url
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedTeams = teams.map(team => ({
        ...team,
        id: team.id,
        name: team.name,
        description: team.description,
        createdBy: team.created_by,
        createdAt: new Date(team.created_at),
        members: team.team_members.map((member: any) => ({
          id: member.id,
          name: member.team_member_users.name || member.team_member_users.email.split('@')[0],
          email: member.team_member_users.email,
          role: member.role,
          avatarUrl: member.team_member_users.avatar_url,
          joinedAt: new Date(member.joined_at),
        })),
      }));

      set({
        teams: formattedTeams,
        loading: false,
        // If no current team is selected, select the first one
        currentTeam: get().currentTeam || (formattedTeams.length > 0 ? formattedTeams[0] : null),
        // Set members based on current team
        members: get().currentTeam ? 
          formattedTeams.find(t => t.id === get().currentTeam?.id)?.members || [] : 
          formattedTeams[0]?.members || []
      });
    } catch (error: any) {
      console.error('Error fetching teams:', error);
      if (error.code === '42P17') {
        console.warn('Policy recursion error, falling back to basic team fetch');
        try {
          const { data, error: err2 } = await supabase
            .from('teams')
            .select('id,name,description,avatar_url,created_by,created_at')
            .order('created_at', { ascending: false });
          if (err2) throw err2;
          // Map to Team[] with minimal members/settings
          const basicTeams = (data || []).map((t: any) => ({
            id: t.id,
            name: t.name,
            description: t.description,
            avatarUrl: t.avatar_url,
            createdBy: t.created_by,
            createdAt: new Date(t.created_at),
            members: [],
            settings: {}
          }));
          set({ teams: basicTeams, loading: false, currentTeam: basicTeams[0] || null, members: [] });
          return;
        } catch (fallbackErr) {
          console.error('Basic team fetch failed:', fallbackErr);
          set({ error: 'Failed to fetch teams', loading: false });
          return;
        }
      }
      set({ error: 'Failed to fetch teams', loading: false });
    }
  },
  createTeam: async (team) => {
    try {
      set({ loading: true });
      
      // Use the teamsClient API instead of direct Supabase access
      const { team: newTeam } = await import('../lib/teamsClient')
        .then(module => module.createTeam({
          name: team.name,
          description: team.description
        }));      // After successful creation, fetch teams to update the state
      await get().fetchTeams();
      
      // Set the newly created team as the current team
      const createdTeam = get().teams.find(t => t.id === newTeam.id);
      if (createdTeam) {
        get().setCurrentTeam(createdTeam);
      }
    } catch (error) {
      console.error('Error creating team:', error);
      set({ error: 'Failed to create team' });
      throw error;
    }
  },
  inviteMember: async (teamId, email, role) => {
    try {
      // Use the team members API client
      await import('../lib/teamMembersClient')
        .then(module => module.inviteTeamMember(
          teamId,
          email,
          role
        ));
      
      // Refetch teams to update state
      await get().fetchTeams();
    } catch (error) {
      console.error('Error inviting member:', error);
      set({ error: 'Failed to invite member' });
      throw error;
    }
  },  updateMemberRole: async (memberId, role) => {
    try {
      // Use the team members API client
      await import('../lib/teamMembersClient')
        .then(module => module.updateMemberRole(memberId, role));
      
      // Refetch teams to update state
      await get().fetchTeams();
    } catch (error) {
      console.error('Error updating member role:', error);
      set({ error: 'Failed to update member role' });
      throw error;
    }
  },

  updateTeam: async (id, name, description) => {
    try {
      set({ loading: true });
      
      // Use the teams API client
      await import('../lib/teamsClient')
        .then(module => module.updateTeam(id, name, description));
      
      // Refetch teams to update state
      await get().fetchTeams();
      
      // Update the current team if it was the one that was updated
      if (get().currentTeam?.id === id) {
        const updatedTeam = get().teams.find(t => t.id === id);
        if (updatedTeam) {
          get().setCurrentTeam(updatedTeam);
        }
      }
    } catch (error) {
      console.error('Error updating team:', error);
      set({ error: 'Failed to update team' });
      throw error;
    } finally {
      set({ loading: false });
    }
  },
  
  deleteTeam: async (id) => {
    try {
      set({ loading: true });
      
      // Use the teams API client
      await import('../lib/teamsClient')
        .then(module => module.deleteTeam(id));
      
      // Clear current team if it was the one that was deleted
      if (get().currentTeam?.id === id) {
        set({ currentTeam: null });
      }
      
      // Refetch teams to update state
      await get().fetchTeams();
    } catch (error) {
      console.error('Error deleting team:', error);
      set({ error: 'Failed to delete team' });
      throw error;
    } finally {
      set({ loading: false });
    }
  },
  removeMember: async (memberId) => {
    try {
      // Use the team members API client
      await import('../lib/teamMembersClient')
        .then(module => module.removeTeamMember(memberId));
      
      // Refetch teams to update state
      await get().fetchTeams();
    } catch (error) {
      console.error('Error removing member:', error);
      set({ error: 'Failed to remove member' });
      throw error;
    }
  },

  fetchActivities: async (teamId) => {
    try {
      const { data, error } = await supabase
        .from('team_activities')
        .select(`
          *,
          team_member_users!team_members_user_id_fkey!inner (
            id,
            name,
            avatar_url
          )
        `)
        .eq('team_id', teamId)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      set({
        activities: data.map((activity: any) => ({
          id: activity.id,
          user: {
            id: activity.team_member_users.id,
            name: activity.team_member_users.name,
            avatarUrl: activity.team_member_users.avatar_url,
          },
          action: activity.action,
          entityType: activity.entity_type,
          entityId: activity.entity_id,
          metadata: activity.metadata,
          createdAt: new Date(activity.created_at),
        })),
      });
    } catch (error) {
      console.error('Error fetching activities:', error);
      set({ error: 'Failed to fetch activities' });
    }
  },
}));
