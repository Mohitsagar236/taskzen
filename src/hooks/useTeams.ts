import { useState, useEffect } from 'react';
import { fetchUserTeams } from '../lib/teamsClient';
import { Team } from '../types/team';

/**
 * React hook for fetching and managing teams for the current user
 */
export function useTeams() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTeams = async () => {
    try {
      setLoading(true);
      setError(null);
      const { teams: fetchedTeams } = await fetchUserTeams();
      setTeams(fetchedTeams);
    } catch (err) {
      console.error('Error fetching teams:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch teams');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, []);

  return {
    teams,
    loading,
    error,
    refetch: fetchTeams
  };
}
