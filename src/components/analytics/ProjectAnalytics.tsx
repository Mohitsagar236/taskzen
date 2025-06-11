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
  Area,
  AreaChart,
} from 'recharts';
import { useTaskStore } from '../../store/taskStore';
import { Button } from '../ui/Button';
import {
  Folder,
  TrendingUp,
  Clock,
  Calendar,
  AlertCircle,
  Download,
  Target,
} from 'lucide-react';
import { format, subDays, isWithinInterval, startOfDay, endOfDay } from 'date-fns';
import toast from 'react-hot-toast';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

export function ProjectAnalytics() {
  const tasks = useTaskStore((state) => state.tasks);
  const [dateRange, setDateRange] = React.useState(30); // days
  const [selectedProject, setSelectedProject] = React.useState('all');

  const projects = useMemo(() => {
    const projectSet = new Set(['all']);
    tasks.forEach((task) => {
      if (task.projectId) projectSet.add(task.projectId);
    });
    return Array.from(projectSet);
  }, [tasks]);

  const projectMetrics = useMemo(() => {
    const now = new Date();
    const startDate = subDays(now, dateRange);
    
    const filteredTasks = tasks.filter((task) => {
      const isInProject = selectedProject === 'all' || task.projectId === selectedProject;
      const isInDateRange = task.createdAt && 
        isWithinInterval(new Date(task.createdAt), {
          start: startDate,
          end: now,
        });
      return isInProject && isInDateRange;
    });

    // Progress metrics
    const completed = filteredTasks.filter((t) => t.completed).length;
    const total = filteredTasks.length;
    const completionRate = total > 0 ? (completed / total) * 100 : 0;

    // Time tracking
    const totalTime = filteredTasks.reduce((acc, task) => {
      const taskTime = task.timeEntries?.reduce((t, entry) => t + (parseFloat(entry.duration) || 0), 0) || 0;
      return acc + taskTime;
    }, 0);

    // Priority distribution
    const priorities = ['low', 'medium', 'high', 'urgent'];
    const priorityDistribution = priorities.map((priority) => ({
      name: priority.charAt(0).toUpperCase() + priority.slice(1),
      value: filteredTasks.filter((t) => t.priority === priority).length,
    }));

    // Daily completion trend
    const dailyTrend = Array.from({ length: dateRange }).map((_, i) => {
      const date = subDays(now, i);
      const dayTasks = filteredTasks.filter((task) => {
        const taskDate = task.completedAt ? new Date(task.completedAt) : null;
        return taskDate && 
          isWithinInterval(taskDate, {
            start: startOfDay(date),
            end: endOfDay(date),
          });
      });

      return {
        date: format(date, 'MMM dd'),
        completed: dayTasks.length,
      };
    }).reverse();

    // Due date distribution
    const dueDistribution = {
      overdue: filteredTasks.filter(
        (t) => !t.completed && t.dueDate && new Date(t.dueDate) < now
      ).length,
      dueToday: filteredTasks.filter(
        (t) => !t.completed && t.dueDate && 
          isWithinInterval(new Date(t.dueDate), {
            start: startOfDay(now),
            end: endOfDay(now),
          })
      ).length,
      dueThisWeek: filteredTasks.filter(
        (t) => !t.completed && t.dueDate &&
          isWithinInterval(new Date(t.dueDate), {
            start: now,
            end: subDays(now, 7),
          })
      ).length,
    };

    return {
      completionRate,
      totalTime,
      priorityDistribution,
      dailyTrend,
      dueDistribution,
      taskCount: total,
      completedCount: completed,
    };
  }, [tasks, dateRange, selectedProject]);

  const handleExport = async () => {
    try {
      const data = {
        project: selectedProject,
        dateRange,
        metrics: projectMetrics,
        exportedAt: new Date().toISOString(),
      };

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `project-analytics-${format(new Date(), 'yyyy-MM-dd')}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success('Project report exported successfully!');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export project report');
    }
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <select
          value={selectedProject}
          onChange={(e) => setSelectedProject(e.target.value)}
          className="rounded-lg border border-gray-300 bg-white px-4 py-2 dark:border-gray-700 dark:bg-gray-800"
          aria-label="Select project"
          title="Select project"
        >
          {projects.map((project) => (
            <option key={project} value={project}>
              {project === 'all' ? 'All Projects' : `Project ${project}`}
            </option>
          ))}
        </select>

        <div className="flex items-center gap-2">
          <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1 dark:bg-gray-800">
            <Button
              variant={dateRange === 7 ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setDateRange(7)}
            >
              Week
            </Button>
            <Button
              variant={dateRange === 30 ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setDateRange(30)}
            >
              Month
            </Button>
            <Button
              variant={dateRange === 90 ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setDateRange(90)}
            >
              Quarter
            </Button>
          </div>
          <Button variant="outline" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-xl text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Completion Rate</p>
              <h3 className="text-2xl font-bold mt-1">{projectMetrics.completionRate.toFixed(1)}%</h3>
            </div>
            <Target className="w-8 h-8 text-white/80" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-xl text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Total Tasks</p>
              <h3 className="text-2xl font-bold mt-1">{projectMetrics.taskCount}</h3>
            </div>
            <Folder className="w-8 h-8 text-white/80" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 p-6 rounded-xl text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Time Tracked</p>
              <h3 className="text-2xl font-bold mt-1">
                {Math.round(projectMetrics.totalTime / 3600)}h
              </h3>
            </div>
            <Clock className="w-8 h-8 text-white/80" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-xl text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Overdue Tasks</p>
              <h3 className="text-2xl font-bold mt-1">{projectMetrics.dueDistribution.overdue}</h3>
            </div>
            <AlertCircle className="w-8 h-8 text-white/80" />
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
          <h3 className="text-lg font-semibold mb-4 dark:text-white">Completion Trend</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={projectMetrics.dailyTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="completed"
                  fill="#3B82F6"
                  stroke="#3B82F6"
                  name="Completed Tasks"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
          <h3 className="text-lg font-semibold mb-4 dark:text-white">Priority Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={projectMetrics.priorityDistribution}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label
                >
                  {projectMetrics.priorityDistribution.map((entry, index) => (
                    <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg col-span-1 lg:col-span-2">
          <h3 className="text-lg font-semibold mb-4 dark:text-white">Due Date Status</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-red-600 dark:text-red-400">Overdue</span>
                <span className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {projectMetrics.dueDistribution.overdue}
                </span>
              </div>
            </div>

            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-yellow-600 dark:text-yellow-400">Due Today</span>
                <span className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                  {projectMetrics.dueDistribution.dueToday}
                </span>
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-blue-600 dark:text-blue-400">Due This Week</span>
                <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {projectMetrics.dueDistribution.dueThisWeek}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
