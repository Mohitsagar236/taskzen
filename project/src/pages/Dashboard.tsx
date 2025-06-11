import React, { useState } from 'react';
import { useTaskStore } from '../store/taskStore';
import { useUserStore } from '../store/userStore';
import TaskList from '../components/TaskList';
import { format } from 'date-fns';
import { CheckCircle, Clock, AlertTriangle } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { tasks } = useTaskStore();
  const { user } = useUserStore();
  
  const completedTasks = tasks.filter(task => task.completed);
  const pendingTasks = tasks.filter(task => !task.completed);
  const dueSoonTasks = pendingTasks.filter(task => 
    task.dueDate && new Date(task.dueDate).getTime() - new Date().getTime() < 86400000 * 3
  );
  
  const completionRate = tasks.length > 0 
    ? Math.round((completedTasks.length / tasks.length) * 100) 
    : 0;
  
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Welcome back, {user?.name || 'User'}!
      </h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-800">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 dark:bg-green-900 mr-4">
              <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Completed Tasks</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">{completedTasks.length}</p>
            </div>
          </div>
          <div className="mt-4">
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
              <div 
                className="bg-green-600 h-2.5 rounded-full" 
                style={{ width: `${completionRate}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {completionRate}% completion rate
            </p>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-800">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900 mr-4">
              <Clock className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending Tasks</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">{pendingTasks.length}</p>
            </div>
          </div>
          <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
            {pendingTasks.length === 0 
              ? "You're all caught up!" 
              : `You have ${pendingTasks.length} task${pendingTasks.length !== 1 ? 's' : ''} to complete.`}
          </p>
        </div>
        
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-800">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100 dark:bg-yellow-900 mr-4">
              <AlertTriangle className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Due Soon</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">{dueSoonTasks.length}</p>
            </div>
          </div>
          <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
            {dueSoonTasks.length === 0 
              ? "No urgent tasks!" 
              : `${dueSoonTasks.length} task${dueSoonTasks.length !== 1 ? 's' : ''} due in the next 3 days.`}
          </p>
        </div>
      </div>
      
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-800">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Today's Tasks
        </h2>
        <TaskList />
      </div>
    </div>
  );
};

export default Dashboard;