import React, { useState, useEffect } from 'react';
import { TeamPanel } from '../components/TeamPanelUpdated';
import { ErrorBoundaryWrapper } from '../components/ErrorBoundaryWrapper';
import { useTeamStore } from '../store/teamStore';
import TeamList from '../components/TeamList';
import { CreateTeamForm } from '../components/CreateTeamForm';
import { Team as TeamType } from '../types/team';
import { Plus } from 'lucide-react';
import UIFeedback from '../components/UIFeedback';
import { useNotificationStore } from '../store/notificationStore';

export default function Team() {
  const { teams, loading, error } = useTeamStore();
  const [selectedTeam, setSelectedTeam] = useState<TeamType | null>(null);
  const [showCreateTeamForm, setShowCreateTeamForm] = useState(false);
  const [feedbackState, setFeedbackState] = useState<{
    type: 'success' | 'error';
    message: string;
    visible: boolean;
  }>({ type: 'success', message: '', visible: false });
  
  // Fetch notifications when component mounts
  useEffect(() => {
    useNotificationStore.getState().fetchNotifications();
  }, []);

  const handleRetryTeamLoad = async () => {
    try {
      await useTeamStore.getState().fetchTeams();
    } catch (err) {
      console.error('Failed to retry team load:', err);
    }
  };

  const handleTeamSelect = (team: TeamType) => {
    setSelectedTeam(team);
    // Set the current team in the team store
    useTeamStore.getState().setCurrentTeam(team);
  };
  // Handle successful team creation
  const handleTeamCreated = (teamName: string) => {
    // Refresh teams list
    useTeamStore.getState().fetchTeams();
    
    // Show success feedback
    setFeedbackState({
      type: 'success',
      message: `Team "${teamName}" has been created successfully!`,
      visible: true
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4 flex justify-center items-center h-[70vh]">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-xl max-w-2xl mx-auto">
          <h2 className="text-xl font-bold text-red-700 dark:text-red-400 mb-2">Error Loading Teams</h2>
          <p className="text-red-600 dark:text-red-300 mb-4">{error}</p>
          <button
            onClick={handleRetryTeamLoad}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-200">Teams</h1>
      
      {/* UI Feedback component */}
      {feedbackState.visible && (
        <div className="mb-6">
          <UIFeedback 
            type={feedbackState.type} 
            message={feedbackState.message}
            onClose={() => setFeedbackState(prev => ({ ...prev, visible: false }))}
          />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Your Teams</h2>
              <button
                onClick={() => setShowCreateTeamForm(true)}
                className="flex items-center gap-1 px-3 py-1.5 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
              >
                <Plus size={16} />
                <span>New Team</span>
              </button>
            </div>
            <ErrorBoundaryWrapper
              name="TeamList"
              fallback={
                <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-xl">
                  <h3 className="text-lg font-bold text-red-700 dark:text-red-400 mb-2">Team List Error</h3>
                  <p className="text-red-600 dark:text-red-300">
                    There was an error loading your teams.
                  </p>
                </div>
              }
            >
              <TeamList onTeamSelect={handleTeamSelect} />
            </ErrorBoundaryWrapper>
          </div>
        </div>

        <div className="lg:col-span-2">
          {selectedTeam ? (
            <ErrorBoundaryWrapper 
              name="TeamPanel" 
              fallback={
                <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-xl">
                  <h2 className="text-xl font-bold text-red-700 dark:text-red-400 mb-2">Team Panel Error</h2>
                  <p className="text-red-600 dark:text-red-300 mb-4">
                    There was an error loading the team panel.
                  </p>
                  <button
                    onClick={handleRetryTeamLoad}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Retry
                  </button>
                </div>
              }
            >
              <TeamPanel />
            </ErrorBoundaryWrapper>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 flex flex-col items-center justify-center h-64">
              <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-300 mb-2">No Team Selected</h3>
              <p className="text-gray-500 dark:text-gray-400 text-center">
                Select a team from the list to view details and manage team settings.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Create Team Modal */}
      {showCreateTeamForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="max-w-md w-full">
            <CreateTeamForm 
              onClose={() => setShowCreateTeamForm(false)}
              onSuccess={handleTeamCreated}
            />
          </div>
        </div>
      )}
    </div>
  );
}
