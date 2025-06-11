import React, { useState, useEffect } from 'react';
import { useTeamStore } from '../store/teamStore';
import { Team } from '../types/team';
import TeamMembers from './TeamMembers';
import { Users, Settings, Bell, BarChart2, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import UIFeedback from './UIFeedback';
import { updateTeam, deleteTeam } from '../lib/teamsClient';
import { useNotificationStore } from '../store/notificationStore';

interface TeamPanelProps {
  // No props needed as we use the team store
}

export function TeamPanel(props: TeamPanelProps) {
  const { currentTeam, activities, fetchTeams } = useTeamStore();
  const [activeTab, setActiveTab] = useState<'overview' | 'members' | 'settings'>('overview');
  const [teamData, setTeamData] = useState({
    name: '',
    description: ''
  });
  const [updateLoading, setUpdateLoading] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [uiFeedbackState, setUiFeedbackState] = useState<{
    type: 'success' | 'error',
    message: string,
    visible: boolean
  }>({
    type: 'success',
    message: '',
    visible: false
  });
  
  // Update local state when current team changes
  useEffect(() => {
    if (currentTeam) {
      setTeamData({
        name: currentTeam.name,
        description: currentTeam.description || ''
      });
    }
  }, [currentTeam]);

  // Handle team data form changes
  const handleTeamDataChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setTeamData(prev => ({ ...prev, [name]: value }));
  };

  // Handle team update form submission
  const handleUpdateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentTeam) return;
    
    try {
      setUpdateLoading(true);
      setUpdateError(null);
      await updateTeam(currentTeam.id, teamData.name, teamData.description || undefined);
      
      // Refresh teams
      fetchTeams();
      
      // Show success feedback
      setUiFeedbackState({
        type: 'success',
        message: 'Team has been updated successfully!',
        visible: true
      });
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to update team';
      setUpdateError(errorMsg);
      
      // Show error feedback
      setUiFeedbackState({
        type: 'error',
        message: errorMsg,
        visible: true
      });
    } finally {
      setUpdateLoading(false);
    }
  };

  // Handle team deletion
  const handleDeleteTeam = async () => {
    if (!currentTeam) return;
    
    try {
      setDeleteLoading(true);
      setDeleteError(null);
      await deleteTeam(currentTeam.id);
      
      // Refresh teams list
      fetchTeams();
      
      // Show success feedback
      setUiFeedbackState({
        type: 'success',
        message: 'Team has been deleted successfully!',
        visible: true
      });
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to delete team';
      setDeleteError(errorMsg);
      
      // Show error feedback
      setUiFeedbackState({
        type: 'error',
        message: errorMsg,
        visible: true
      });
    } finally {
      setDeleteLoading(false);
      setShowDeleteConfirm(false);
    }
  };
  if (!currentTeam) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 flex flex-col items-center justify-center h-64">
        <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-300 mb-2">No Team Selected</h3>
        <p className="text-gray-500 dark:text-gray-400 text-center">
          Select a team from the list to view details and manage team settings.
        </p>
      </div>
    );
  }
    return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
      {/* UI Feedback */}
      {uiFeedbackState.visible && (
        <div className="p-4">
          <UIFeedback
            type={uiFeedbackState.type}
            message={uiFeedbackState.message}
            onClose={() => setUiFeedbackState(prev => ({ ...prev, visible: false }))}
          />
        </div>
      )}
      
      {/* Team Header */}
      <div className="p-6 bg-gradient-to-r from-blue-500 to-blue-600 text-white">
        <h2 className="text-2xl font-bold">{currentTeam.name}</h2>
        {currentTeam.description && (
          <p className="mt-2 text-blue-100">{currentTeam.description}</p>
        )}
      </div>
      
      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex px-6 -mb-px">
          <button
            onClick={() => setActiveTab('overview')}
            className={`mr-8 py-4 text-sm font-medium border-b-2 ${
              activeTab === 'overview'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <div className="flex items-center">
              <BarChart2 size={16} className="mr-2" />
              <span>Overview</span>
            </div>
          </button>
          
          <button
            onClick={() => setActiveTab('members')}
            className={`mr-8 py-4 text-sm font-medium border-b-2 ${
              activeTab === 'members'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <div className="flex items-center">
              <Users size={16} className="mr-2" />
              <span>Members</span>
            </div>
          </button>
          
          <button
            onClick={() => setActiveTab('settings')}
            className={`py-4 text-sm font-medium border-b-2 ${
              activeTab === 'settings'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <div className="flex items-center">
              <Settings size={16} className="mr-2" />
              <span>Settings</span>
            </div>
          </button>
        </nav>
      </div>
      
      {/* Tab Content */}
      <div className="p-6">
        {activeTab === 'overview' && (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-2">Members</h3>
                <div className="flex items-center">
                  <Users className="text-blue-500 mr-2" size={20} />
                  <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {currentTeam.members?.length || 0}
                  </span>
                </div>
              </div>
              
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-2">Tasks</h3>
                <div className="flex items-center">
                  <Calendar className="text-green-500 mr-2" size={20} />
                  <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                    0
                  </span>
                </div>
              </div>
              
              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-2">Activity</h3>
                <div className="flex items-center">
                  <Bell className="text-purple-500 mr-2" size={20} />
                  <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {activities?.length || 0}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-4">Recent Activity</h3>
              
              {activities && activities.length > 0 ? (
                <div className="space-y-4">
                  {activities.slice(0, 5).map((activity) => (
                    <div key={activity.id} className="flex items-start">
                      <div className="flex-shrink-0 mr-3">
                        {activity.user?.avatarUrl ? (
                          <img
                            src={activity.user.avatarUrl}
                            alt={activity.user.name}
                            className="w-8 h-8 rounded-full"
                          />
                        ) : (
                          <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                            <span className="text-gray-600 dark:text-gray-300 text-sm font-medium">
                              {activity.user?.name?.substring(0, 2).toUpperCase() || '??'}
                            </span>
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="text-sm text-gray-800 dark:text-gray-200">
                          <span className="font-medium">{activity.user?.name}</span> {activity.action}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {format(new Date(activity.createdAt), 'MMM d, yyyy h:mm a')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                  No recent activity
                </p>
              )}
            </div>
          </div>
        )}
        
        {activeTab === 'members' && (
          <TeamMembers team={currentTeam} />
        )}
        
        {activeTab === 'settings' && (
          <div>
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">Team Settings</h3>
              <form className="space-y-4" onSubmit={handleUpdateTeam}>
              {updateError && (
                <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-md">
                  <p className="text-sm text-red-600 dark:text-red-400">{updateError}</p>
                </div>
              )}
              
              <div>
                <label htmlFor="teamName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Team Name
                </label>
                <input
                  type="text"
                  id="teamName"
                  name="name"
                  value={teamData.name}
                  onChange={handleTeamDataChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="teamDescription" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  id="teamDescription"
                  name="description"
                  rows={3}
                  value={teamData.description || ''}
                  onChange={handleTeamDataChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              
              <div>
                <button
                  type="submit"
                  disabled={updateLoading}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
                >
                  {updateLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
            
            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
              <h4 className="text-lg font-medium text-red-600 dark:text-red-500 mb-4">Danger Zone</h4>
              
              {deleteError && (
                <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-md mb-4">
                  <p className="text-sm text-red-600 dark:text-red-400">{deleteError}</p>
                </div>
              )}
              
              {showDeleteConfirm ? (
                <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-md">
                  <p className="text-sm text-red-600 dark:text-red-400 mb-3">
                    Are you sure you want to delete this team? This action cannot be undone.
                  </p>
                  <div className="flex space-x-3">
                    <button
                      onClick={handleDeleteTeam}
                      disabled={deleteLoading}
                      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                    >
                      {deleteLoading ? 'Deleting...' : 'Yes, Delete Team'}
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(false)}
                      className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="px-4 py-2 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-500 rounded-md hover:bg-red-200 dark:hover:bg-red-900/30"
                >
                  Delete Team
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
