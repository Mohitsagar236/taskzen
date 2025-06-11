import * as React from 'react';
import {
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { useTaskStore } from '../../store/taskStore.fixed';
import { useProgressStore } from '../../store/progressStore';
import { Button } from '../ui/Button';
import {
  Download,
  TrendingUp,
  Target,
  Zap,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Task } from '../../types';

// Define and export the ProductivityAnalytics component
export const ProductivityAnalytics: React.FC = () => {
  const { tasks } = useTaskStore();
  const progress = useProgressStore(state => state.progress);
  
  // Calculate completed vs pending tasks
  const completedTasks = tasks.filter((task: Task) => 
    task.completed_at !== null && task.completed_at !== undefined
  ).length;
  const pendingTasks = tasks.length - completedTasks;

  // Sample data for the pie chart
  const data = [
    { name: 'Completed', value: completedTasks || 1 },
    { name: 'Pending', value: pendingTasks || 2 },
  ];
  
  // Safe access to streak value
  const streak = progress?.streak || 0;

  const COLORS = ['#0088FE', '#FFBB28'];
  
  // Calculate productivity score from actual data or use default
  const completionRate = tasks.length > 0 
    ? Math.round((completedTasks / tasks.length) * 100)
    : 0;
    
  const productivityScore = progress?.xp 
    ? Math.min(100, Math.round(progress.xp / 10))
    : 82; // Default score if no progress data

  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Productivity Overview</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
          <div className="flex items-center mb-2">
            <Target className="h-5 w-5 text-blue-500 mr-2" />
            <h3 className="font-medium">Task Completion</h3>
          </div>
          <p className="text-2xl font-bold">{completedTasks} / {tasks.length}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {tasks.length > 0 
              ? `${completionRate}% completion rate` 
              : 'No tasks recorded'}
          </p>
        </div>
        
        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
          <div className="flex items-center mb-2">
            <TrendingUp className="h-5 w-5 text-green-500 mr-2" />
            <h3 className="font-medium">Productivity Score</h3>
          </div>
          <p className="text-2xl font-bold">{productivityScore}/100</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {progress ? 'Based on your activity' : 'Default score'}
          </p>
        </div>
        
        <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
          <div className="flex items-center mb-2">
            <Zap className="h-5 w-5 text-purple-500 mr-2" />
            <h3 className="font-medium">Current Streak</h3>
          </div>
          <p className="text-2xl font-bold">{streak} days</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Keep it going!</p>
        </div>
      </div>

      {tasks.length > 0 ? (
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            >              
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      ) : (
        <p className="text-center text-gray-600 dark:text-gray-400 py-12">
          No task data available to display productivity analytics.
        </p>
      )}
      
      <div className="mt-4 flex justify-end">
        <Button 
          onClick={() => toast.success('Report generated!')}
          variant="primary"
          className="flex items-center gap-2"
        >
          <Download className="h-4 w-4" /> 
          Generate Report
        </Button>
      </div>
    </div>
  );
};