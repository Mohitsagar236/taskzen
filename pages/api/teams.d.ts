// Types for the teams API

export interface Team {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at?: string;
  owner_id: string;
  avatar_url?: string;
}

export interface TeamMember {
  id: string;
  team_id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'member';
  created_at: string;
  updated_at?: string;
}

export interface TeamsApiResponse {
  teams: Team[];
}

export interface TeamsApiErrorResponse {
  error: string;
}

export interface UpdateTeamRequest {
  id: string;
  name: string;
  description?: string;
}

export interface DeleteTeamRequest {
  id: string;
}

export interface UpdateTeamResponse {
  team: Team;
}

export interface DeleteTeamResponse {
  success: boolean;
}
