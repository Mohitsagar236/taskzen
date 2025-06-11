export interface Team {
  id: string;
  name: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
  owner_id?: string;
  avatar_url?: string;
  avatarUrl?: string;
  createdBy: string;
  createdAt: Date;
  members: Array<TeamMember>;
  settings: Record<string, any>;
}

export interface TeamMember {
  id: string;
  team_id?: string;
  user_id?: string;
  name: string;
  email: string;
  role: 'owner' | 'admin' | 'member' | 'editor' | 'viewer';
  created_at?: string;
  updated_at?: string;
  avatarUrl?: string;
  joinedAt: Date;
}

export interface TeamsApiResponse {
  teams: Team[];
}

export interface TeamsApiErrorResponse {
  error: string;
}

export interface CreateTeamPayload {
  name: string;
  description?: string;
}

export interface CreateTeamResponse {
  team: Team;
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
