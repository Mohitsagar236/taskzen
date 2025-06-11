import React, { useState } from 'react';
import { format } from 'date-fns';
import { CheckCircle, Circle, Trash2, MessageSquare, Share2, UserPlus, Filter, SortAsc } from 'lucide-react';
import { useTaskStore } from '../store/taskStore';
import { Task } from '../types';
import { Button } from './ui/Button';
import { TaskDetails } from './TaskDetails';
import toast from 'react-hot-toast';

export function TaskList() {
  // Add error handling for store access
  const [error, setError] = useState<Error | null>(null);
  
  // Safely access store
  const { tasks = [], toggleTask, deleteTask } = useTaskStore();
  
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [sortBy, setSortBy] = useState<'dueDate' | 'priority' | 'created'>('dueDate');

  const taskStats = {
    total: tasks.length,
    active: tasks.filter(t => !t.completed).length,
    completed: tasks.filter(t => t.completed).length
  };

  const filteredTasks = tasks
    .filter(task => {
      if (filter === 'completed') return task.completed;
      if (filter === 'active') return !task.completed;
      return true;
    })      .sort((a, b) => {
      switch (sortBy) {
        case 'dueDate':
          return (a.dueDate?.getTime() || 0) - (b.dueDate?.getTime() || 0);
        case 'priority':
          const priorityOrder = { high: 0, medium: 1, low: 2 };
          // Handle case when priority might not be in the priorityOrder object
          const aPriority = priorityOrder[a.priority] ?? 3; // Fallback value
          const bPriority = priorityOrder[b.priority] ?? 3; // Fallback value
          return aPriority - bPriority;
        case 'created':
          // Safely handle missing createdAt properties
          const aTime = a.createdAt?.getTime() || 0;
          const bTime = b.createdAt?.getTime() || 0;
          return bTime - aTime;
        default:
          return 0;
      }
    });

  const handleToggleTask = async (id: string) => {
    try {
      await toggleTask(id);
    } catch (error) {
      toast.error('Failed to update task');
    }
  };

  const handleDeleteTask = async (id: string) => {
    try {
      await deleteTask(id);
      toast.success('Task deleted successfully');
    } catch (error) {
      toast.error('Failed to delete task');
    }
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <Filter className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            <div className="flex flex-wrap gap-2">
              <Button
                variant={filter === 'all' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setFilter('all')}
              >
                All ({taskStats.total})
              </Button>
              <Button
                variant={filter === 'active' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setFilter('active')}
              >
                Active ({taskStats.active})
              </Button>
              <Button
                variant={filter === 'completed' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setFilter('completed')}
              >
                Completed ({taskStats.completed})
              </Button>
            </div>
          </div>
          
          <div className="flex items-center gap-2 w-full sm:w-auto sm:ml-auto">
            <SortAsc className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full sm:w-auto rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
            >
              <option value="dueDate">Sort by Due Date</option>
              <option value="priority">Sort by Priority</option>
              <option value="created">Sort by Created</option>
            </select>
          </div>
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-4">
        {filteredTasks.map((task) => (
          <div
            key={task.id}
            className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
          >
            <div className="flex flex-col sm:flex-row items-start gap-4">
              <button
                onClick={() => handleToggleTask(task.id)}
                className="flex-shrink-0 mt-1"
              >
                {task.completed ? (
                  <CheckCircle className="w-6 h-6 text-green-500" />
                ) : (
                  <Circle className="w-6 h-6 text-gray-400" />
                )}
              </button>
              
              <div className="flex-grow min-w-0 w-full">
                <h3 className="text-lg font-medium dark:text-white truncate">
                  {task.title}
                </h3>
                
                {task.description && (
                  <p className="mt-1 text-gray-600 dark:text-gray-300 line-clamp-2">
                    {task.description}
                  </p>
                )}
                
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className={`
                    px-2 py-1 rounded-full text-xs font-medium
                    ${task.priority === 'high' ? 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300' :
                      task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300' :
                      'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300'}
                  `}>
                    {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                  </span>
                  
                  {task.category && (
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                      {task.category}
                    </span>
                  )}
                  
                  {task.dueDate && (
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300">
                      Due: {format(task.dueDate, 'MMM d, yyyy')}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mt-3 sm:mt-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedTask(task)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                >
                  <MessageSquare className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedTask(task)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                >
                  <Share2 className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedTask(task)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                >
                  <UserPlus className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDeleteTask(task.id)}
                  className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}

        {filteredTasks.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-gray-400 dark:text-gray-500" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              {filter === 'completed' ? 'No completed tasks yet' :
               filter === 'active' ? 'No active tasks' :
               'No tasks found'}
            </h3>
            <p className="mt-2 text-gray-500 dark:text-gray-400">
              {filter === 'completed' ? 'Complete some tasks to see them here' :
               filter === 'active' ? 'All tasks are completed!' :
               'Add some tasks to get started'}
            </p>
          </div>
        )}
      </div>

      {selectedTask && (
        <TaskDetails task={selectedTask} onClose={() => setSelectedTask(null)} />
      )}
    </div>
  );
}