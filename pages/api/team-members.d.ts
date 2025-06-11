// Types for the team members API

import { TeamMember } from "../../src/types/team";

export interface InviteMemberRequest {
  teamId: string;
  email: string;
  role: 'owner' | 'admin' | 'member' | 'editor' | 'viewer';
}

export interface UpdateMemberRoleRequest {
  memberId: string;
  role: TeamMember['role'];
}

export interface RemoveMemberRequest {
  memberId: string;
}

export interface MemberResponse {
  member: TeamMember;
}

export interface MembersApiErrorResponse {
  error: string;
}
