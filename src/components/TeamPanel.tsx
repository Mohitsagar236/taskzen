import React, { useState, useEffect } from 'react';
import { useTeamStore } from '../store/teamStore';
import { useTaskStore } from '../store/taskStore';
import { Avatar } from './ui/Avatar';
import { Button } from './ui/Button';
import {
  Users,
  Plus,
  Settings,
  Bell,
  BarChart2,
  MessageSquare,
  Clock,
  AlertCircle,
  Calendar,
  CheckCircle,
  Target,
  TrendingUp,
  Award,
  Star,
  Filter,
  Search,
} from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export function TeamPanel() {
  const {
    teams,
    currentTeam,
    setCurrentTeam,
    members,
    activities,
    fetchTeams,
    createTeam,
    inviteMember,
    updateMemberRole,
    removeMember,
  } = useTeamStore();

  const { tasks, fetchTeamTasks } = useTaskStore();

  const [showCreateTeam, setShowCreateTeam] = useState(false);
  const [showInvite, setShowInvite] = useState(false);
  const [newTeam, setNewTeam] = useState({ name: '', description: '' });
  const [inviteEmail, setInviteEmail] = useState('');
  const [selectedRole, setSelectedRole] = useState<'admin' | 'editor' | 'viewer'>('editor');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState<'all' | 'admin' | 'editor' | 'viewer'>('all');

  useEffect(() => {
    fetchTeams();
  }, [fetchTeams]);

  // Fetch team tasks when current team changes
  useEffect(() => {
    if (currentTeam) {
      fetchTeamTasks(currentTeam.id);
    }
  }, [currentTeam, fetchTeamTasks]);

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newTeam.name.length < 3) {
      toast.error('Team name must be at least 3 characters long');
      return;
    }
    try {
      await createTeam(newTeam);
      setShowCreateTeam(false);
      setNewTeam({ name: '', description: '' });
      toast.success('Team created successfully!');
    } catch (error) {
      console.error('Error creating team:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create team');
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentTeam) return;

    try {
      await inviteMember(currentTeam.id, inviteEmail, selectedRole);
      setShowInvite(false);
      setInviteEmail('');
      toast.success('Invitation sent successfully!');
    } catch (error) {
      toast.error('Failed to send invitation');
    }
  };

  const filteredMembers = members.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         member.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = filterRole === 'all' || member.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const teamStats = {
    totalTasks: tasks.filter(t => t.teamId === currentTeam?.id).length,
    completedTasks: tasks.filter(t => t.teamId === currentTeam?.id && t.completed).length,
    activeMembers: members.length,
    upcomingDeadlines: tasks.filter(t => 
      t.teamId === currentTeam?.id && 
      t.dueDate && 
      t.dueDate > new Date() && 
      t.dueDate <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    ).length,
  };

  const memberStats = {
    admins: members.filter(m => m.role === 'admin').length,
    editors: members.filter(m => m.role === 'editor').length,
    viewers: members.filter(m => m.role === 'viewer').length,
  };

  return (
    <div className="space-y-6">
      {/* Team Header */}
      <div className="bg-gradient-to-r from-blue-600/90 to-purple-600/90 backdrop-blur-xl rounded-xl p-6 text-white border border-white/10 shadow-xl relative overflow-hidden transition-all duration-300 hover:shadow-2xl hover:scale-[1.01]">
        <div className="absolute inset-0 bg-white/5 bg-[radial-gradient(at_top_right,rgba(255,255,255,0.1),transparent_70%)]"></div>
        <div className="relative flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center">
            <div className="p-2 bg-white/10 rounded-lg mr-3">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Teams</h2>
              <p className="text-white/80 text-sm">Collaborate and manage your teams</p>
            </div>
          </div>
          <Button
            onClick={() => setShowCreateTeam(true)}
            className="bg-white/10 backdrop-blur-lg border border-white/20 text-white hover:bg-white/20 hover:scale-105 transform transition-all duration-200"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Team
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Team List */}
        <div className="lg:col-span-3 space-y-4">
          {teams.map(team => (
            <div              key={team.id}
              onClick={() => setCurrentTeam(team)}
              className={`bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all cursor-pointer ${
                currentTeam?.id === team.id ? 'ring-2 ring-blue-500' : ''
              }`}
            >
              <div className="flex items-center space-x-3">
                <Avatar
                  src={team.avatarUrl}
                  fallback={team.name.charAt(0)}
                  className="w-10 h-10"
                />
                <div>
                  <h3 className="font-medium dark:text-white">{team.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {team.members.length} members
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Team Details */}
        <div className="lg:col-span-9 space-y-6">
          {currentTeam ? (
            <>
              {/* Team Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-green-500/90 to-green-600/90 backdrop-blur-xl p-6 rounded-xl text-white border border-white/10 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] relative overflow-hidden group">
                  <div className="absolute inset-0 bg-[radial-gradient(at_top_right,rgba(255,255,255,0.1),transparent_70%)]"></div>
                  <div className="relative">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-sm text-white/80">Task Progress</p>
                        <h3 className="text-3xl font-bold mt-1">
                          {Math.round((teamStats.completedTasks / teamStats.totalTasks) * 100)}%
                        </h3>
                      </div>
                      <div className="p-3 bg-white/10 rounded-xl group-hover:scale-110 transition-transform duration-300">
                        <CheckCircle className="w-8 h-8" />
                      </div>
                    </div>
                    <div className="mt-4">
                      <div className="w-full bg-black/20 rounded-full h-2.5 mb-2">
                        <div
                          className="h-2.5 rounded-full bg-white/80 transition-all duration-500 ease-out"
                          style={{
                            width: `${(teamStats.completedTasks / teamStats.totalTasks) * 100}%`,
                          }}
                        />
                      </div>
                      <p className="text-sm text-white/80">
                        {teamStats.completedTasks} of {teamStats.totalTasks} tasks completed
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-blue-500/90 to-blue-600/90 backdrop-blur-xl p-6 rounded-xl text-white border border-white/10 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] relative overflow-hidden group">
                  <div className="absolute inset-0 bg-[radial-gradient(at_top_right,rgba(255,255,255,0.1),transparent_70%)]"></div>
                  <div className="relative">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-sm text-white/80">Active Members</p>
                        <h3 className="text-3xl font-bold mt-1">{teamStats.activeMembers}</h3>
                      </div>
                      <div className="p-3 bg-white/10 rounded-xl group-hover:scale-110 transition-transform duration-300">
                        <Users className="w-8 h-8" />
                      </div>
                    </div>
                    <div className="mt-4">
                      <div className="flex space-x-3">
                        <div className="flex-1 bg-white/10 rounded-lg p-2 text-center">
                          <p className="text-xl font-semibold">{memberStats.admins}</p>
                          <p className="text-xs text-white/80 mt-1">Admins</p>
                        </div>
                        <div className="flex-1 bg-white/10 rounded-lg p-2 text-center">
                          <p className="text-xl font-semibold">{memberStats.editors}</p>
                          <p className="text-xs text-white/80 mt-1">Editors</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-purple-500/90 to-purple-600/90 backdrop-blur-xl p-6 rounded-xl text-white border border-white/10 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] relative overflow-hidden group">
                  <div className="absolute inset-0 bg-[radial-gradient(at_top_right,rgba(255,255,255,0.1),transparent_70%)]"></div>
                  <div className="relative">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-sm text-white/80">Productivity</p>
                        <h3 className="text-3xl font-bold mt-1">92</h3>
                      </div>
                      <div className="p-3 bg-white/10 rounded-xl group-hover:scale-110 transition-transform duration-300">
                        <TrendingUp className="w-8 h-8" />
                      </div>
                    </div>
                    <div className="mt-4">
                      <div className="flex items-center space-x-2">
                        <div className="flex-1 h-1.5 bg-white/20 rounded-full overflow-hidden">
                          <div className="h-full w-[92%] bg-white/80 rounded-full" />
                        </div>
                        <span className="text-white/80 text-sm">92%</span>
                      </div>
                      <p className="text-sm text-white/80 mt-2">
                        <span className="text-green-300">↑ 15%</span> vs last week
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-amber-500/90 to-amber-600/90 backdrop-blur-xl p-6 rounded-xl text-white border border-white/10 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] relative overflow-hidden group">
                  <div className="absolute inset-0 bg-[radial-gradient(at_top_right,rgba(255,255,255,0.1),transparent_70%)]"></div>
                  <div className="relative">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-sm text-white/80">Upcoming</p>
                        <h3 className="text-3xl font-bold mt-1">{teamStats.upcomingDeadlines}</h3>
                      </div>
                      <div className="p-3 bg-white/10 rounded-xl group-hover:scale-110 transition-transform duration-300">
                        <Calendar className="w-8 h-8" />
                      </div>
                    </div>
                    <div className="mt-4 space-y-2">
                      <div className="text-sm text-white/80">Deadlines this week</div>
                      <div className="flex items-center space-x-1">
                        {Array.from({ length: 7 }).map((_, i) => (
                          <div
                            key={i}
                            className={`h-1 flex-1 rounded-full ${
                              i < 5 ? 'bg-white/80' : 'bg-white/20'
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-sm text-white/80">5 days remaining</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Team Members */}
              <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-xl rounded-xl shadow-lg overflow-hidden border border-gray-200/50 dark:border-gray-700/50">
                <div className="p-6 border-b border-gray-200/50 dark:border-gray-700/50 relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5"></div>
                  <div className="relative flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        Team Members
                      </h2>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Manage your team and roles
                      </p>
                    </div>
                    <Button
                      onClick={() => setShowInvite(true)}
                      className="bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 shadow-md hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Invite Member
                    </Button>
                  </div>

                  <div className="mt-6 flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                      <div className="relative group">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                          <input
                            type="text"
                            id="memberSearch"
                            placeholder="Search members..."
                            title="Search members"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300/50 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 dark:bg-gray-700/50 dark:border-gray-600/50 dark:text-white backdrop-blur-sm transition-all duration-300"
                          />
                        </div>
                      </div>
                    </div>
                    <select
                      id="roleFilter"
                      value={filterRole}
                      onChange={(e) => setFilterRole(e.target.value as any)}
                      className="rounded-lg border border-gray-300/50 px-4 py-2.5 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 dark:bg-gray-700/50 dark:border-gray-600/50 dark:text-white backdrop-blur-sm transition-all duration-300"
                      title="Filter by role"
                    >
                      <option value="all">All Roles</option>
                      <option value="admin">Admins</option>
                      <option value="editor">Editors</option>
                      <option value="viewer">Viewers</option>
                    </select>
                  </div>
                </div>

                <div className="divide-y divide-gray-200/50 dark:divide-gray-700/50">
                  {filteredMembers.map(member => (
                    <div key={member.id} className="p-4 sm:p-6 hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors duration-200 group relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-blue-500/5 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                      <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-center space-x-4">
                          <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full blur-md opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                            <Avatar
                              src={member.avatarUrl}
                              fallback={member.name.charAt(0)}
                              className="w-12 h-12 rounded-full ring-2 ring-white dark:ring-gray-800 group-hover:ring-blue-500/50 transition-all duration-300"
                            />
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900 dark:text-white group-hover:text-blue-500 transition-colors duration-200">
                              {member.name}
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                              {member.email}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-3">
                          <select
                            id={`memberRole-${member.id}`}
                            value={member.role}
                            onChange={e => updateMemberRole(member.id, e.target.value as any)}
                            className="rounded-lg border-gray-300/50 shadow-sm focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 dark:bg-gray-700/50 dark:border-gray-600/50 dark:text-white text-sm backdrop-blur-sm transition-all duration-300"
                            title={`Change role for ${member.name}`}
                          >
                            <option value="admin">Admin</option>
                            <option value="editor">Editor</option>
                            <option value="viewer">Viewer</option>
                          </select>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeMember(member.id)}
                            className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 border border-gray-300/50 hover:border-red-500/50 transition-colors duration-200"
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}

                  {filteredMembers.length === 0 && (
                    <div className="p-12 text-center">
                      <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full flex items-center justify-center">
                        <Users className="w-8 h-8 text-blue-500" />
                      </div>
                      <p className="text-gray-500 dark:text-gray-400">
                        No members found matching your filters
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Activity Feed */}
              <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-xl rounded-xl shadow-lg overflow-hidden border border-gray-200/50 dark:border-gray-700/50">
                <div className="p-6 border-b border-gray-200/50 dark:border-gray-700/50 relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-blue-500/5"></div>
                  <div className="relative">
                    <h2 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                      Recent Activity
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Track your team's latest actions and updates
                    </p>
                  </div>
                </div>
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {activities.map(activity => (
                    <div key={activity.id} className="p-4 sm:p-6">
                      <div className="flex items-start space-x-3">
                        <Avatar
                          src={activity.user.avatarUrl}
                          fallback={activity.user.name.charAt(0)}
                          className="w-8 h-8"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm dark:text-white">
                            <span className="font-medium">{activity.user.name}</span>{' '}
                            {activity.action}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {format(new Date(activity.createdAt), 'MMM d, yyyy HH:mm')}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}

                  {activities.length === 0 && (
                    <div className="p-8 text-center">
                      <Clock className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                      <p className="text-gray-500 dark:text-gray-400">
                        No recent activity
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                <Users className="w-8 h-8 text-gray-400 dark:text-gray-500" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                No team selected
              </h3>
              <p className="mt-2 text-gray-500 dark:text-gray-400">
                Select a team from the list or create a new one
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showCreateTeam && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-xl p-8 w-full max-w-md border border-gray-200/50 dark:border-gray-700/50 shadow-2xl transform transition-all duration-300 scale-100 opacity-100">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-blue-500/5"></div>
              <div className="relative">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-1">
                  Create New Team
                </h2>
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
                  Start collaborating with your team members
                </p>
                <form onSubmit={handleCreateTeam} className="space-y-6">
                  <div>
                    <label htmlFor="teamName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Team Name
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <input
                        id="teamName"
                        type="text"
                        value={newTeam.name}
                        onChange={e => setNewTeam({ ...newTeam, name: e.target.value })}
                        className="relative w-full rounded-lg border border-gray-300/50 bg-white/50 px-4 py-3 text-gray-900 placeholder-gray-500 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 dark:bg-gray-700/50 dark:border-gray-600/50 dark:text-white backdrop-blur-sm transition-all duration-300"
                        required
                        minLength={3}
                        placeholder="Enter team name (at least 3 characters)"
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="teamDescription" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Description
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <textarea
                        id="teamDescription"
                        value={newTeam.description}
                        onChange={e => setNewTeam({ ...newTeam, description: e.target.value })}
                        className="relative w-full rounded-lg border border-gray-300/50 bg-white/50 px-4 py-3 text-gray-900 placeholder-gray-500 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 dark:bg-gray-700/50 dark:border-gray-600/50 dark:text-white backdrop-blur-sm transition-all duration-300"
                        rows={3}
                        placeholder="Enter team description (optional)"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end space-x-3">
                    <Button
                      variant="outline"
                      onClick={() => setShowCreateTeam(false)}
                      className="border-gray-300/50 hover:bg-gray-50 dark:border-gray-600/50 dark:hover:bg-gray-800/50"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      className="bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 shadow-md hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
                    >
                      Create Team
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {showInvite && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-xl p-8 w-full max-w-md border border-gray-200/50 dark:border-gray-700/50 shadow-2xl transform transition-all duration-300 scale-100 opacity-100">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-blue-500/5"></div>
              <div className="relative">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-1">
                  Invite Team Member
                </h2>
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
                  Add new members to collaborate with your team
                </p>
                <form onSubmit={handleInvite} className="space-y-6">
                  <div>
                    <label htmlFor="memberEmail" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email Address
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <input
                        id="memberEmail"
                        type="email"
                        value={inviteEmail}
                        onChange={e => setInviteEmail(e.target.value)}
                        className="relative w-full rounded-lg border border-gray-300/50 bg-white/50 px-4 py-3 text-gray-900 placeholder-gray-500 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 dark:bg-gray-700/50 dark:border-gray-600/50 dark:text-white backdrop-blur-sm transition-all duration-300"
                        placeholder="Enter member's email"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="memberRole" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Role
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <select
                        id="memberRole"
                        value={selectedRole}
                        onChange={e => setSelectedRole(e.target.value as any)}
                        className="relative w-full rounded-lg border border-gray-300/50 bg-white/50 px-4 py-3 text-gray-900 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 dark:bg-gray-700/50 dark:border-gray-600/50 dark:text-white backdrop-blur-sm transition-all duration-300"
                      >
                        <option value="admin">Admin</option>
                        <option value="editor">Editor</option>
                        <option value="viewer">Viewer</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex justify-end space-x-3">
                    <Button
                      variant="outline"
                      onClick={() => setShowInvite(false)}
                      className="border-gray-300/50 hover:bg-gray-50 dark:border-gray-600/50 dark:hover:bg-gray-800/50"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      className="bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 shadow-md hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
                    >
                      Send Invite
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}