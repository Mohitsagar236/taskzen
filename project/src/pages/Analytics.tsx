import React, { useMemo } from 'react';
import { useTaskStore } from '../store/taskStore';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isWithinInterval } from 'date-fns';
import { BarChart, CheckCircle, Clock, Calendar } from 'lucide-react';

const Analytics: React.FC = () => {
  const { tasks } = useTaskStore();
  
  const today = new Date();
  const startOfCurrentWeek = startOfWeek(today);
  const endOfCurrentWeek = endOfWeek(today);
  const daysOfWeek = eachDayOfInterval({ start: startOfCurrentWeek, end: endOfCurrentWeek });
  
  const completedTasks = tasks.filter(task => task.completed);
  const pendingTasks = tasks.filter(task => !task.completed);
  
  const completionRate = tasks.length > 0 
    ? Math.round((completedTasks.length / tasks.length) * 100) 
    : 0;
  
  const tasksByCategory = useMemo(() => {
    const result: Record<string, number> = {};
    
    tasks.forEach(task => {
      if (result[task.category]) {
        result[task.category]++;
      } else {
        result[task.category] = 1;
      }
    });
    
    return Object.entries(result).sort((a, b) => b[1] - a[1]);
  }, [tasks]);
  
  const tasksByPriority = useMemo(() => {
    const result: Record<string, number> = {
      high: 0,
      medium: 0,
      low: 0,
    };
    
    tasks.forEach(task => {
      result[task.priority]++;
    });
    
    return result;
  }, [tasks]);
  
  const tasksCompletedByDay = useMemo(() => {
    const result: Record<string, number> = {};
    
    daysOfWeek.forEach(day => {
      const dayStr = format(day, 'EEE');
      result[dayStr] = 0;
    });
    
    completedTasks.forEach(task => {
      const completedDate = new Date(task.createdAt);
      
      if (isWithinInterval(completedDate, { start: startOfCurrentWeek, end: endOfCurrentWeek })) {
        const dayStr = format(completedDate, 'EEE');
        result[dayStr]++;
      }
    });
    
    return result;
  }, [completedTasks, daysOfWeek, startOfCurrentWeek, endOfCurrentWeek]);
  
  const getMaxValue = (obj: Record<string, number>): number => {
    return Math.max(...Object.values(obj), 1);
  };
  
  const maxDayValue = getMaxValue(tasksCompletedByDay);
  
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Productivity Analytics
      </h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-800">
          <div className="flex items-center mb-4">
            <BarChart className="h-5 w-5 text-blue-600 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Task Completion
            </h2>
          </div>
          
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Completion Rate</span>
            <span className="text-sm font-medium text-gray-900 dark:text-white">{completionRate}%</span>
          </div>
          
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mb-4">
            <div 
              className="bg-blue-600 h-2.5 rounded-full" 
              style={{ width: `${completionRate}%` }}
            ></div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mt-6">
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
              <div className="flex items-center mb-2">
                <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400 mr-2" />
                <span className="text-sm font-medium text-gray-900 dark:text-white">Completed</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{completedTasks.length}</p>
            </div>
            
            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
              <div className="flex items-center mb-2">
                <Clock className="h-4 w-4 text-yellow-600 dark:text-yellow-400 mr-2" />
                <span className="text-sm font-medium text-gray-900 dark:text-white">Pending</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{pendingTasks.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-800">
          <div className="flex items-center mb-4">
            <Calendar className="h-5 w-5 text-blue-600 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Weekly Activity
            </h2>
          </div>
          
          <div className="flex items-end justify-between h-40 mt-4">
            {Object.entries(tasksCompletedByDay).map(([day, count]) => (
              <div key={day} className="flex flex-col items-center">
                <div 
                  className="w-8 bg-blue-500 rounded-t"
                  style={{ 
                    height: `${(count / maxDayValue) * 100}%`,
                    minHeight: count > 0 ? '8px' : '0'
                  }}
                ></div>
                <span className="text-xs mt-2 text-gray-600 dark:text-gray-400">{day}</span>
                <span className="text-xs font-medium text-gray-900 dark:text-white">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-800">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Tasks by Category
          </h2>
          
          <div className="space-y-4">
            {tasksByCategory.map(([category, count]) => (
              <div key={category}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-600 dark:text-gray-400">{category}</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{count}</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${(count / tasks.length) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-800">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Tasks by Priority
          </h2>
          
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg text-center">
              <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">High</p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">{tasksByPriority.high}</p>
            </div>
            
            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg text-center">
              <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">Medium</p>
              <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{tasksByPriority.medium}</p>
            </div>
            
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg text-center">
              <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">Low</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">{tasksByPriority.low}</p>
            </div>
          </div>
          
          <div className="mt-6">
            <div className="flex h-4 rounded-full overflow-hidden">
              <div 
                className="bg-red-500" 
                style={{ width: `${(tasksByPriority.high / tasks.length) * 100}%` }}
              ></div>
              <div 
                className="bg-yellow-500" 
                style={{ width: `${(tasksByPriority.medium / tasks.length) * 100}%` }}
              ></div>
              <div 
                className="bg-green-500" 
                style={{ width: `${(tasksByPriority.low / tasks.length) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;