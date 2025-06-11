import {
  InviteMemberRequest,
  UpdateMemberRoleRequest,
  RemoveMemberRequest,
  MemberResponse,
  MembersApiErrorResponse
} from '../../pages/api/team-members';
import { TeamMember } from '../types/team';

/**
 * Invites a new member to a team
 */
export async function inviteTeamMember(
  teamId: string,
  email: string,
  role: TeamMember['role']
): Promise<MemberResponse> {
  const payload: InviteMemberRequest = {
    teamId,
    email,
    role
  };

  const response = await fetch('/api/team-members', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData: MembersApiErrorResponse = await response.json();
    throw new Error(errorData.error || 'Failed to invite team member');
  }

  // Show success notification
  const { useNotificationStore } = await import('../store/notificationStore');
  useNotificationStore.getState().showToast({
    type: 'member_added',
    title: 'Member Invited',
    message: `Invitation sent to ${email} successfully`
  });

  return response.json();
}

/**
 * Updates a team member's role
 */
export async function updateMemberRole(
  memberId: string,
  role: TeamMember['role']
): Promise<MemberResponse> {
  const payload: UpdateMemberRoleRequest = {
    memberId,
    role
  };

  const response = await fetch('/api/team-members', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData: MembersApiErrorResponse = await response.json();
    throw new Error(errorData.error || 'Failed to update member role');
  }

  // Show success notification
  const { useNotificationStore } = await import('../store/notificationStore');
  useNotificationStore.getState().showToast({
    type: 'member_role_updated',
    title: 'Role Updated',
    message: `Member role updated to ${role} successfully`
  });

  return response.json();
}

/**
 * Removes a member from a team
 */
export async function removeTeamMember(memberId: string): Promise<{ success: boolean }> {
  const payload: RemoveMemberRequest = {
    memberId
  };

  const response = await fetch('/api/team-members', {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData: MembersApiErrorResponse = await response.json();
    throw new Error(errorData.error || 'Failed to remove team member');
  }

  // Show success notification
  const { useNotificationStore } = await import('../store/notificationStore');
  useNotificationStore.getState().showToast({
    type: 'member_removed',
    title: 'Member Removed',
    message: 'Team member has been removed successfully'
  });

  return response.json();
}
