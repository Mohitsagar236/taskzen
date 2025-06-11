// Re-export from the fixed implementation
import { useTeamStore } from './teamStore.fixed';
import { Team } from '../types'; // Assuming a Team type is defined in a types file
import { supabase } from '../lib/supabaseClient'; // Assuming supabase client is initialized here
import { useUserStore } from './userStore'; // Assuming userStore is defined
import create from 'zustand'; // Zustand for state management

// Re-export the store
export { useTeamStore };

const teamStore = create<{ [key: string]: any }>((set, get) => ({
  teams: [],
  currentTeam: null,
  members: [],
  activities: [],
  loading: false,
  error: null,

  setCurrentTeam: (team: Team) => {
    set({ currentTeam: team, members: team.members || [] });
  },

  fetchTeams: async () => {
    try {
      set({ loading: true });

      const { data: teams, error } = await supabase
        .from('teams')
        .select(`
          *,
          team_members (
            id, user_id, role, joined_at,
            team_member_users!team_members_user_id_fkey (
              id, email, name, avatar_url
            )
          )
        `);

      if (error) throw error;

      set({
        teams: teams.map((team: any) => ({
          ...team,
          members: team.team_members || [],
        })),
        loading: false,
      });
    } catch (error) {
      console.error('Error fetching teams:', error);
      set({ error: 'Failed to fetch teams', loading: false });
    }
  },

  createTeam: async (team: Team) => {
    try {
      const user = useUserStore.getState().user;
      const { error } = await supabase
        .from('teams')
        .insert([{ ...team, created_by: user.id }]);

      if (error) throw error;

      // Optionally refresh teams after creation
      await get().fetchTeams();
    } catch (error) {
      console.error('Error creating team:', error);
      throw error;
    }
  },

  inviteMember: async (teamId: string, email: string, role: string) => {
    try {
      const { error } = await supabase
        .from('team_members')
        .insert([{ team_id: teamId, email, role }]);

      if (error) throw error;

      // Optionally refresh team members after inviting
      await get().fetchTeams();
    } catch (error) {
      console.error('Error inviting member:', error);
      throw error;
    }
  },

  updateMemberRole: async (memberId: string, role: string) => {
    try {
      const { error } = await supabase
        .from('team_members')
        .update({ role })
        .eq('id', memberId);

      if (error) throw error;

      await get().fetchTeams();
    } catch (error) {
      set({ error: 'Failed to update member role' });
    }
  },

  removeMember: async (memberId: string) => {
    try {
      const { error } = await supabase
        .from('team_members')
        .delete()
        .eq('id', memberId);

      if (error) throw error;

      await get().fetchTeams();
    } catch (error) {
      set({ error: 'Failed to remove member' });
    }
  },

  fetchActivities: async (teamId: string) => {
    try {
      const { data, error } = await supabase
        .from('activities')
        .select('*')
        .eq('team_id', teamId);

      if (error) throw error;

      set({ activities: data });
    } catch (error) {
      set({ error: 'Failed to fetch activities' });
    }
  },
}));

export default teamStore;