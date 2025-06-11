import React, { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { useTeamStore } from '../../store/teamStore';
import { useTaskStore } from '../../store/taskStore';
import { Button } from '../ui/Button';
import {
  Users,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Download,
  Calendar,
} from 'lucide-react';
import { format, startOfWeek, subWeeks, isWithinInterval } from 'date-fns';
import toast from 'react-hot-toast';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

export function TeamAnalytics() {
  const { teams, members, activities } = useTeamStore();
  const tasks = useTaskStore((state) => state.tasks);
  const [selectedTeam, setSelectedTeam] = React.useState(teams[0]?.id);
  const [dateRange, setDateRange] = React.useState('week');

  const teamMetrics = useMemo(() => {
    if (!selectedTeam) return null;

    const now = new Date();
    const startDate = dateRange === 'week' ? startOfWeek(now) : subWeeks(now, 4);
    const teamTasks = tasks.filter((t) => t.teamId === selectedTeam);
    const teamMembers = members.filter((m) => m.teamId === selectedTeam);

    // Task completion metrics
    const completedTasks = teamTasks.filter((t) => t.completed).length;
    const totalTasks = teamTasks.length;
    const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    // Member productivity
    const memberProductivity = teamMembers.map((member) => {
      const memberTasks = teamTasks.filter((t) => t.assigneeId === member.id);
      const completed = memberTasks.filter((t) => t.completed).length;
      return {
        name: member.name,
        completed,
        total: memberTasks.length,
        productivity: memberTasks.length > 0 ? (completed / memberTasks.length) * 100 : 0,
      };
    });

    // Time tracking
    const timeByMember = teamMembers.map((member) => {
      const timeSpent = teamTasks
        .filter((t) => t.assigneeId === member.id)
        .reduce((total, task) => {
          return (
            total +
            (task.timeEntries?.reduce((t, entry) => t + (parseFloat(entry.duration) || 0), 0) || 0)
          );
        }, 0);

      return {
        name: member.name,
        value: timeSpent,
      };
    });

    // Task distribution
    const taskDistribution = {
      pending: teamTasks.filter((t) => !t.completed).length,
      inProgress: teamTasks.filter((t) => t.status === 'in_progress').length,
      completed: completedTasks,
      overdue: teamTasks.filter(
        (t) => !t.completed && t.dueDate && new Date(t.dueDate) < new Date()
      ).length,
    };

    // Activity timeline
    const recentActivities = activities
      .filter((a) => a.teamId === selectedTeam)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10);

    return {
      completionRate,
      memberProductivity,
      timeByMember,
      taskDistribution,
      recentActivities,
    };
  }, [selectedTeam, tasks, members, activities, dateRange]);

  const handleExport = async () => {
    if (!teamMetrics) return;

    try {
      const data = {
        team: teams.find((t) => t.id === selectedTeam)?.name,
        dateRange,
        metrics: teamMetrics,
        exportedAt: new Date().toISOString(),
      };

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `team-analytics-${format(new Date(), 'yyyy-MM-dd')}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success('Team report exported successfully!');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export team report');
    }
  };

  if (!teams.length) {
    return (
      <div className="text-center py-12">
        <Users className="w-12 h-12 mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">No Teams Available</h3>
        <p className="mt-2 text-gray-500 dark:text-gray-400">
          Create a team to start tracking team analytics
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <select
          value={selectedTeam}
          onChange={(e) => setSelectedTeam(e.target.value)}
          className="rounded-lg border border-gray-300 bg-white px-4 py-2 dark:border-gray-700 dark:bg-gray-800"
          aria-label="Select team"
          title="Select team"
        >
          {teams.map((team) => (
            <option key={team.id} value={team.id}>
              {team.name}
            </option>
          ))}
        </select>

        <div className="flex items-center gap-2">
          <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1 dark:bg-gray-800">
            <Button
              variant={dateRange === 'week' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setDateRange('week')}
            >
              Week
            </Button>
            <Button
              variant={dateRange === 'month' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setDateRange('month')}
            >
              Month
            </Button>
          </div>
          <Button variant="outline" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {teamMetrics ? (
        <>
          {/* Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-xl text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Task Completion</p>
                  <h3 className="text-2xl font-bold mt-1">
                    {teamMetrics.completionRate.toFixed(1)}%
                  </h3>
                </div>
                <CheckCircle className="w-8 h-8 text-white/80" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-xl text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Active Members</p>
                  <h3 className="text-2xl font-bold mt-1">
                    {teamMetrics.memberProductivity.length}
                  </h3>
                </div>
                <Users className="w-8 h-8 text-white/80" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 p-6 rounded-xl text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Avg. Productivity</p>
                  <h3 className="text-2xl font-bold mt-1">
                    {(
                      teamMetrics.memberProductivity.reduce((acc, m) => acc + m.productivity, 0) /
                      teamMetrics.memberProductivity.length
                    ).toFixed(1)}
                    %
                  </h3>
                </div>
                <TrendingUp className="w-8 h-8 text-white/80" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-xl text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Time Tracked</p>
                  <h3 className="text-2xl font-bold mt-1">
                    {Math.round(
                      teamMetrics.timeByMember.reduce((acc, m) => acc + m.value, 0) / 3600
                    )}
                    h
                  </h3>
                </div>
                <Clock className="w-8 h-8 text-white/80" />
              </div>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
              <h3 className="text-lg font-semibold mb-4 dark:text-white">Member Productivity</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={teamMetrics.memberProductivity}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar
                      dataKey="productivity"
                      fill="#3B82F6"
                      radius={[4, 4, 0, 0]}
                      name="Productivity %"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
              <h3 className="text-lg font-semibold mb-4 dark:text-white">Time Distribution</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={teamMetrics.timeByMember}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={(entry) => entry.name}
                    >
                      {teamMetrics.timeByMember.map((entry, index) => (
                        <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg col-span-1 lg:col-span-2">
              <h3 className="text-lg font-semibold mb-4 dark:text-white">Task Status Distribution</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-blue-600 dark:text-blue-400">Pending</span>
                    <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {teamMetrics.taskDistribution.pending}
                    </span>
                  </div>
                </div>

                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-yellow-600 dark:text-yellow-400">In Progress</span>
                    <span className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                      {teamMetrics.taskDistribution.inProgress}
                    </span>
                  </div>
                </div>

                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-green-600 dark:text-green-400">Completed</span>
                    <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {teamMetrics.taskDistribution.completed}
                    </span>
                  </div>
                </div>

                <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-red-600 dark:text-red-400">Overdue</span>
                    <span className="text-2xl font-bold text-red-600 dark:text-red-400">
                      {teamMetrics.taskDistribution.overdue}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
            <h3 className="text-lg font-semibold mb-4 dark:text-white">Recent Activity</h3>
            <div className="space-y-4">
              {teamMetrics.recentActivities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
                      <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      <span className="font-medium text-gray-900 dark:text-white">
                        {activity.user.name}
                      </span>{' '}
                      {activity.action}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {format(new Date(activity.createdAt), 'MMM d, yyyy HH:mm')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <div className="text-center py-12">
          <AlertCircle className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">No Data Available</h3>
          <p className="mt-2 text-gray-500 dark:text-gray-400">
            Select a team and date range to view analytics
          </p>
        </div>
      )}
    </div>
  );
}
