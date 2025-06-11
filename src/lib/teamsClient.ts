import { 
  TeamsApiResponse, 
  TeamsApiErrorResponse, 
  CreateTeamPayload,
  CreateTeamResponse,
  UpdateTeamRequest,
  DeleteTeamRequest,
  UpdateTeamResponse,
  DeleteTeamResponse
} from '../types/team';

/**
 * Fetches teams for the currently authenticated user
 */
export async function fetchUserTeams(): Promise<TeamsApiResponse> {
  const response = await fetch('/api/teams');
  
  if (!response.ok) {
    const errorData: TeamsApiErrorResponse = await response.json();
    throw new Error(errorData.error || 'Failed to fetch teams');
  }
  
  return response.json();
}

/**
 * Creates a new team for the authenticated user
 */
export async function createTeam(payload: CreateTeamPayload): Promise<CreateTeamResponse> {
  const response = await fetch('/api/teams', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  
  if (!response.ok) {
    const errorData: TeamsApiErrorResponse = await response.json();
    throw new Error(errorData.error || 'Failed to create team');
  }
  
  // Import notification store dynamically to avoid circular dependencies
  const { useNotificationStore } = await import('../store/notificationStore');
  useNotificationStore.getState().showToast({
    type: 'team_update',
    title: 'Team Created',
    message: `Team "${payload.name}" has been created successfully!`
  });
  
  return response.json();
}

/**
 * Updates an existing team
 */
export async function updateTeam(id: string, name: string, description?: string): Promise<UpdateTeamResponse> {
  const payload: UpdateTeamRequest = {
    id,
    name,
    description
  };

  const response = await fetch('/api/teams', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  
  if (!response.ok) {
    const errorData: TeamsApiErrorResponse = await response.json();
    throw new Error(errorData.error || 'Failed to update team');
  }
  
  // Import notification store dynamically to avoid circular dependencies
  const { useNotificationStore } = await import('../store/notificationStore');
  useNotificationStore.getState().showToast({
    type: 'team_update',
    title: 'Team Updated',
    message: `Team "${name}" has been updated successfully!`
  });
  
  return response.json();
}

/**
 * Deletes a team
 */
export async function deleteTeam(id: string): Promise<DeleteTeamResponse> {
  const payload: DeleteTeamRequest = {
    id
  };

  const response = await fetch('/api/teams', {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  
  if (!response.ok) {
    const errorData: TeamsApiErrorResponse = await response.json();
    throw new Error(errorData.error || 'Failed to delete team');
  }
  
  // Import notification store dynamically to avoid circular dependencies
  const { useNotificationStore } = await import('../store/notificationStore');
  useNotificationStore.getState().showToast({
    type: 'team_delete',
    title: 'Team Deleted',
    message: 'The team has been deleted successfully'
  });
  
  return response.json();
}

/**
 * Check if a user is authenticated and has teams
 */
export async function hasTeams(): Promise<boolean> {
  try {
    const { teams } = await fetchUserTeams();
    return teams.length > 0;
  } catch (error) {
    return false;
  }
}
