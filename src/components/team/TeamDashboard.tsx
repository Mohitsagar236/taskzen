import React, { useState } from 'react';
import { useTeamStore } from '../../store/teamStore';
import { useTaskStore } from '../../store/taskStore';
import { Avatar } from '../ui/Avatar';
import { Button } from '../ui/Button';
import {
  BarChart,
  Calendar,
  CheckCircle,
  Clock,
  Download,
  FileText,
  Flag,
  Settings,
  Share2,
  Star,
  Users,
} from 'lucide-react';
import { format } from 'date-fns';

export function TeamDashboard() {
  const { currentTeam, members } = useTeamStore();
  const tasks = useTaskStore((state) => state.tasks);
  const [selectedView, setSelectedView] = useState<'overview' | 'tasks' | 'calendar' | 'files'>('overview');

  if (!currentTeam) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-gray-500 dark:text-gray-400">
          Select a team to view dashboard
        </p>
      </div>
    );
  }

  const teamTasks = tasks.filter((task) => task.teamId === currentTeam.id);
  const completedTasks = teamTasks.filter((task) => task.completed);
  const completionRate = teamTasks.length > 0
    ? (completedTasks.length / teamTasks.length) * 100
    : 0;

  const metrics = {
    tasks: {
      total: teamTasks.length,
      completed: completedTasks.length,
      inProgress: teamTasks.filter((t) => !t.completed && t.status === 'in_progress').length,
      overdue: teamTasks.filter(
        (t) => !t.completed && t.dueDate && new Date(t.dueDate) < new Date()
      ).length,
    },
    members: members.length,
    files: 12, // Example data
    meetings: 3, // Example data
  };

  const recentFiles = [
    { id: '1', name: 'Project Proposal.pdf', type: 'pdf', updatedAt: new Date(), size: '2.4 MB' },
    { id: '2', name: 'Meeting Notes.docx', type: 'doc', updatedAt: new Date(), size: '1.1 MB' },
    { id: '3', name: 'Design Assets.zip', type: 'zip', updatedAt: new Date(), size: '15.7 MB' },
  ];

  return (
    <div className="space-y-6">
      {/* Team Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center space-x-4">
            <Avatar
              src={currentTeam.avatarUrl}
              fallback={currentTeam.name.charAt(0)}
              className="w-12 h-12"
            />
            <div>
              <h2 className="text-2xl font-bold">{currentTeam.name}</h2>
              <p className="opacity-90">{members.length} members</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" className="text-white border-white/20 hover:bg-white/20">
              <Settings className="w-4 h-4 mr-1" />
              Settings
            </Button>
            <Button variant="outline" className="text-white border-white/20 hover:bg-white/20">
              <Share2 className="w-4 h-4 mr-1" />
              Share
            </Button>
          </div>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200/50 dark:border-gray-700/50">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Tasks</p>
              <h3 className="text-2xl font-bold">{metrics.tasks.total}</h3>
            </div>
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500 dark:text-gray-400">Completed</span>
              <span className="font-medium">{metrics.tasks.completed}</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full"
                style={{ width: `${completionRate}%` }}
              />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200/50 dark:border-gray-700/50">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Members</p>
              <h3 className="text-2xl font-bold">{metrics.members}</h3>
            </div>
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
              <Users className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <div className="flex -space-x-2">
            {members.slice(0, 5).map((member) => (
              <Avatar
                key={member.id}
                src={member.avatarUrl}
                fallback={member.name.charAt(0)}
                className="w-8 h-8 border-2 border-white dark:border-gray-800"
              />
            ))}
            {members.length > 5 && (
              <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 border-2 border-white dark:border-gray-800 flex items-center justify-center">
                <span className="text-xs font-medium">+{members.length - 5}</span>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200/50 dark:border-gray-700/50">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Files</p>
              <h3 className="text-2xl font-bold">{metrics.files}</h3>
            </div>
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
              <FileText className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          <div className="space-y-1">
            {recentFiles.slice(0, 2).map((file) => (
              <div key={file.id} className="flex items-center justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400 truncate">
                  {file.name}
                </span>
                <span className="text-gray-400 dark:text-gray-500">{file.size}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200/50 dark:border-gray-700/50">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Meetings</p>
              <h3 className="text-2xl font-bold">{metrics.meetings}</h3>
            </div>
            <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center">
              <Calendar className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Next meeting in 2 hours
          </p>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex space-x-2 border-b border-gray-200 dark:border-gray-700">
        <Button
          variant={selectedView === 'overview' ? 'default' : 'ghost'}
          onClick={() => setSelectedView('overview')}
        >
          <BarChart className="w-4 h-4 mr-1" />
          Overview
        </Button>
        <Button
          variant={selectedView === 'tasks' ? 'default' : 'ghost'}
          onClick={() => setSelectedView('tasks')}
        >
          <CheckCircle className="w-4 h-4 mr-1" />
          Tasks
        </Button>
        <Button
          variant={selectedView === 'calendar' ? 'default' : 'ghost'}
          onClick={() => setSelectedView('calendar')}
        >
          <Calendar className="w-4 h-4 mr-1" />
          Calendar
        </Button>
        <Button
          variant={selectedView === 'files' ? 'default' : 'ghost'}
          onClick={() => setSelectedView('files')}
        >
          <FileText className="w-4 h-4 mr-1" />
          Files
        </Button>
      </div>

      {/* Content based on selected view */}
      <div className="space-y-6">
        {selectedView === 'overview' && (
          <>
            {/* Recent Activity */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 p-6">
              <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
              <div className="space-y-4">
                {teamTasks.slice(0, 5).map((task) => {
                  const assignee = members.find((m) => m.id === task.assigneeId);
                  return (
                    <div
                      key={task.id}
                      className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50"
                    >
                      <Avatar
                        src={assignee?.avatarUrl}
                        fallback={assignee?.name.charAt(0) || '?'}
                        className="w-8 h-8"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">
                          {assignee?.name} {task.completed ? 'completed' : 'updated'}{' '}
                          <span className="font-normal text-gray-500 dark:text-gray-400">
                            {task.title}
                          </span>
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {format(new Date(task.updatedAt || task.createdAt), 'MMM d, yyyy HH:mm')}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Team Stats */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 p-6">
              <h3 className="text-lg font-semibold mb-4">Team Performance</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Task Completion Rate
                      </p>
                      <p className="text-2xl font-semibold mt-1">
                        {completionRate.toFixed(0)}%
                      </p>
                    </div>
                    <Star className="w-8 h-8 text-yellow-500" />
                  </div>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Average Response Time
                      </p>
                      <p className="text-2xl font-semibold mt-1">2.4h</p>
                    </div>
                    <Clock className="w-8 h-8 text-blue-500" />
                  </div>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Priority Tasks
                      </p>
                      <p className="text-2xl font-semibold mt-1">
                        {teamTasks.filter((t) => t.priority === 'high').length}
                      </p>
                    </div>
                    <Flag className="w-8 h-8 text-red-500" />
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {selectedView === 'tasks' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Team Tasks</h3>
              <Button>
                <Download className="w-4 h-4 mr-1" />
                Export
              </Button>
            </div>
            <div className="space-y-4">
              {teamTasks.map((task) => {
                const assignee = members.find((m) => m.id === task.assigneeId);
                return (
                  <div
                    key={task.id}
                    className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                  >
                    <div className="flex items-center space-x-4">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          task.completed
                            ? 'bg-green-500'
                            : task.status === 'in_progress'
                            ? 'bg-blue-500'
                            : 'bg-gray-500'
                        }`}
                      />
                      <div>
                        <p className="font-medium">{task.title}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Assigned to {assignee?.name}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      {task.dueDate && (
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          Due {format(new Date(task.dueDate), 'MMM d')}
                        </span>
                      )}
                      <Button variant="outline" size="sm">
                        View
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Implement calendar and files views similarly */}
      </div>
    </div>
  );
}
