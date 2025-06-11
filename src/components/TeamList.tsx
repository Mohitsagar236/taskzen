import React from 'react';
import { useTeams } from '../hooks/useTeams';
import { Team } from '../types/team';

interface TeamCardProps {
  team: Team;
  onSelect?: (team: Team) => void;
}

const TeamCard: React.FC<TeamCardProps> = ({ team, onSelect }) => {
  return (
    <div 
      className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow cursor-pointer"
      onClick={() => onSelect && onSelect(team)}
    >
      <div className="flex items-center gap-3">
        {team.avatar_url ? (
          <img 
            src={team.avatar_url} 
            alt={team.name} 
            className="w-12 h-12 rounded-full object-cover"
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
            <span className="text-blue-600 dark:text-blue-300 text-lg font-medium">
              {team.name.substring(0, 2).toUpperCase()}
            </span>
          </div>
        )}
        
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">{team.name}</h3>
          {team.description && (
            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-1">{team.description}</p>
          )}
        </div>
      </div>
    </div>
  );
};

interface TeamListProps {
  onTeamSelect?: (team: Team) => void;
}

export const TeamList: React.FC<TeamListProps> = ({ onTeamSelect }) => {
  const { teams, loading, error, refetch } = useTeams();
  
  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/30 p-4 rounded-lg">
        <p className="text-red-600 dark:text-red-400">{error}</p>
        <button 
          onClick={() => refetch()} 
          className="mt-2 text-sm text-blue-500 hover:text-blue-700"
        >
          Try again
        </button>
      </div>
    );
  }
  
  if (teams.length === 0) {
    return (
      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-6 text-center">
        <h3 className="text-lg font-medium text-gray-600 dark:text-gray-300">No teams found</h3>
        <p className="mt-2 text-gray-500 dark:text-gray-400">You are not a member of any teams yet.</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {teams.map(team => (
        <TeamCard 
          key={team.id} 
          team={team} 
          onSelect={onTeamSelect} 
        />
      ))}
    </div>
  );
};

export default TeamList;
