import React, { useState } from 'react';
import { useTeamStore } from '../store/teamStore';
import { TeamMember, Team } from '../types/team';
import { X, Check, UserPlus, ChevronDown, Shield, User, Users, Edit, Trash } from 'lucide-react';
import UIFeedback from './UIFeedback';

interface MemberItemProps {
  member: TeamMember;
  isCurrentUser: boolean;
  onUpdateRole: (memberId: string, newRole: 'admin' | 'editor' | 'viewer') => void;
  onRemove: (memberId: string) => void;
}

const MemberItem: React.FC<MemberItemProps> = ({ member, isCurrentUser, onUpdateRole, onRemove }) => {
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  
  const roleLabels: Record<string, { label: string; icon: React.ReactNode }> = {
    'owner': { label: 'Owner', icon: <Shield size={14} className="text-purple-500" /> },
    'admin': { label: 'Admin', icon: <Shield size={14} className="text-blue-500" /> },
    'editor': { label: 'Editor', icon: <Edit size={14} className="text-green-500" /> },
    'viewer': { label: 'Viewer', icon: <User size={14} className="text-gray-500" /> },
    'member': { label: 'Member', icon: <Users size={14} className="text-gray-500" /> }
  };
  
  const currentRole = roleLabels[member.role] || roleLabels.member;
  
  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
      <div className="flex items-center gap-3">
        <div className="relative">
          {member.avatarUrl ? (
            <img 
              src={member.avatarUrl} 
              alt={member.name} 
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
              <span className="text-blue-600 dark:text-blue-300 text-sm font-medium">
                {member.name.substring(0, 2).toUpperCase()}
              </span>
            </div>
          )}
        </div>
        
        <div>
          <h4 className="text-sm font-medium text-gray-800 dark:text-gray-200">
            {member.name} {isCurrentUser && <span className="text-xs text-gray-500">(You)</span>}
          </h4>
          <p className="text-xs text-gray-500 dark:text-gray-400">{member.email}</p>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <div className="relative">
          <button 
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            className="flex items-center gap-1 px-2 py-1 text-xs rounded border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            {currentRole.icon}
            <span>{currentRole.label}</span>
            <ChevronDown size={14} />
          </button>
          
          {showRoleMenu && (
            <div className="absolute right-0 top-full mt-1 bg-white dark:bg-gray-800 shadow-lg rounded-md border border-gray-200 dark:border-gray-700 z-10 py-1 w-36">
              {Object.entries(roleLabels).map(([role, { label, icon }]) => (                <button
                  key={role}
                  className={`w-full text-left px-3 py-1.5 flex items-center gap-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 ${
                    member.role === role ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : ''
                  }`}
                  onClick={() => {
                    // Only allow updating to admin, editor, or viewer roles
                    if (role === 'admin' || role === 'editor' || role === 'viewer') {
                      onUpdateRole(member.id, role);
                    }
                    setShowRoleMenu(false);
                  }}
                  disabled={member.role === 'owner' || (isCurrentUser && role !== member.role)}
                >
                  {icon}
                  <span>{label}</span>
                  {member.role === role && (
                    <Check size={14} className="ml-auto text-blue-500" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
        
        <button
          onClick={() => onRemove(member.id)}
          disabled={member.role === 'owner' || isCurrentUser}
          className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Remove member"
        >
          <Trash size={16} />
        </button>
      </div>
    </div>
  );
};

interface InviteMemberFormProps {
  onInvite: (email: string, role: 'admin' | 'editor' | 'viewer') => Promise<void>;
  onCancel: () => void;
}

const InviteMemberForm: React.FC<InviteMemberFormProps> = ({ onInvite, onCancel }) => {  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'admin' | 'editor' | 'viewer'>('editor');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setError('Email is required');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      await onInvite(email.trim(), role);
      setEmail('');
      onCancel();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to invite member');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200">Invite Team Member</h3>
        <button 
          type="button"
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          aria-label="Close"
          title="Close"
        >
          <X size={18} />
        </button>
      </div>
      
      {error && (
        <div className="mb-4 p-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-300 text-sm rounded">
          {error}
        </div>
      )}
      
      <div className="mb-4">
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Email Address
        </label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          placeholder="colleague@example.com"
          required
        />
      </div>
      
      <div className="mb-6">
        <label htmlFor="role" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Role
        </label>        <select
          id="role"
          value={role}
          onChange={(e) => {
            const selectedRole = e.target.value;
            if (selectedRole === 'admin' || selectedRole === 'editor' || selectedRole === 'viewer') {
              setRole(selectedRole);
            }
          }}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
        >
          <option value="admin">Admin</option>
          <option value="editor">Editor</option>
          <option value="viewer">Viewer</option>
        </select>
      </div>
      
      <div className="flex justify-end space-x-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {loading ? 'Sending...' : 'Send Invitation'}
        </button>
      </div>
    </form>
  );
};

interface TeamMembersProps {
  team?: Team | null;
}

export const TeamMembers: React.FC<TeamMembersProps> = ({ team }) => {
  const { members, currentTeam, inviteMember, updateMemberRole, removeMember } = useTeamStore();
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { currentUserId } = useTeamStore();
  const currentUser = currentUserId || '';
    const handleInvite = async (email: string, role: 'admin' | 'editor' | 'viewer') => {
    if (!team?.id) return;
    
    try {
      setLoading(true);
      setError(null);
      await inviteMember(team.id, email, role);
      
      // Show success feedback
      setUiFeedback({
        type: 'success',
        message: `Invitation sent to ${email} successfully!`,
        visible: true
      });
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to invite member';
      setError(errorMsg);
      
      // Show error feedback
      setUiFeedback({
        type: 'error',
        message: errorMsg,
        visible: true
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };
    const handleRoleUpdate = async (memberId: string, role: 'admin' | 'editor' | 'viewer') => {
    try {
      setLoading(true);
      setError(null);
      await updateMemberRole(memberId, role);
      
      // Show success feedback
      setUiFeedback({
        type: 'success',
        message: `Member role updated to ${role} successfully!`,
        visible: true
      });
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to update role';
      setError(errorMsg);
      
      // Show error feedback
      setUiFeedback({
        type: 'error',
        message: errorMsg,
        visible: true
      });
    } finally {
      setLoading(false);
    }
  };
    const handleRemoveMember = async (memberId: string) => {
    try {
      setLoading(true);
      setError(null);
      await removeMember(memberId);
      
      // Show success feedback
      setUiFeedback({
        type: 'success',
        message: 'Team member has been removed successfully',
        visible: true
      });
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to remove member';
      setError(errorMsg);
      
      // Show error feedback
      setUiFeedback({
        type: 'error',
        message: errorMsg,
        visible: true
      });
    } finally {
      setLoading(false);
    }
  };
  
  if (!team || !currentTeam) {
    return (
      <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded text-center">
        <p className="text-gray-500 dark:text-gray-400">Select a team to manage members</p>
      </div>
    );
  }
    const [uiFeedback, setUiFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
    visible: boolean;
  }>({
    type: 'success',
    message: '',
    visible: false
  });

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
      <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200">Team Members</h3>
        <button
          onClick={() => setShowInviteForm(!showInviteForm)}
          className="flex items-center gap-1 px-3 py-1.5 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors text-sm"
        >
          <UserPlus size={16} />
          <span>Invite</span>
        </button>
      </div>
      
      {uiFeedback.visible && (
        <div className="p-4">
          <UIFeedback
            type={uiFeedback.type}
            message={uiFeedback.message}
            onClose={() => setUiFeedback(prev => ({ ...prev, visible: false }))}
          />
        </div>
      )}
      
      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-300 text-sm">
          {error}
        </div>
      )}
      
      {showInviteForm && (
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <InviteMemberForm onInvite={handleInvite} onCancel={() => setShowInviteForm(false)} />
        </div>
      )}
      
      <div className="p-4">
        {loading && !error && (
          <div className="flex justify-center p-4">
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
        
        {members.length > 0 ? (
          <div className="space-y-1">
            {members.map(member => (
              <MemberItem
                key={member.id}
                member={member}
                isCurrentUser={member.id === currentUser}
                onUpdateRole={handleRoleUpdate}
                onRemove={handleRemoveMember}
              />
            ))}
          </div>
        ) : (
          <div className="text-center p-4">
            <p className="text-gray-500 dark:text-gray-400">No members in this team yet</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamMembers;
