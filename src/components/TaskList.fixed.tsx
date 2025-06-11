import React, { useState, useEffect } from 'react';
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
  const [loading, setLoading] = useState<boolean>(true);
  
  // Safely access store
  const { tasks = [], toggleTask, deleteTask, fetchTasks } = useTaskStore();
  
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [sortBy, setSortBy] = useState<'dueDate' | 'priority' | 'created'>('dueDate');

  // Load tasks on component mount (with error handling)
  useEffect(() => {
    const loadTasks = async () => {
      setLoading(true);
      try {
        await fetchTasks();
        setError(null);
      } catch (err) {
        console.error('Failed to load tasks:', err);
        setError(err instanceof Error ? err : new Error('Unknown error loading tasks'));
      } finally {
        setLoading(false);
      }
    };
    
    loadTasks();
  }, [fetchTasks]);

  // Ensure tasks array exists before operating on it
  const validTasks = Array.isArray(tasks) ? tasks : [];
  
  // Guard against invalid task objects
  const safeTasks = validTasks.filter(task => 
    task && typeof task === 'object' && 'id' in task
  );
  
  const taskStats = {
    total: safeTasks.length,
    active: safeTasks.filter(t => !t.completed).length,
    completed: safeTasks.filter(t => t.completed).length
  };

  const filteredTasks = safeTasks
    .filter(task => {
      if (filter === 'completed') return Boolean(task.completed);
      if (filter === 'active') return !task.completed;
      return true;
    })
    .sort((a, b) => {
      try {
        switch (sortBy) {
          case 'dueDate':
            // Safe handling of possibly invalid date objects
            const aTime = a.dueDate instanceof Date && !isNaN(a.dueDate.getTime()) 
              ? a.dueDate.getTime() : 0;
            const bTime = b.dueDate instanceof Date && !isNaN(b.dueDate.getTime())
              ? b.dueDate.getTime() : 0;
            return aTime - bTime;
            
          case 'priority':
            // Default values for unknown priorities
            const priorityOrder = { high: 0, medium: 1, low: 2 };
            const aPriority = a.priority && priorityOrder[a.priority] !== undefined
              ? priorityOrder[a.priority] : 999;
            const bPriority = b.priority && priorityOrder[b.priority] !== undefined
              ? priorityOrder[b.priority] : 999;
            return aPriority - bPriority;
            
          case 'created':
            // Safe handling of createdAt dates
            const aCreated = a.createdAt instanceof Date && !isNaN(a.createdAt.getTime())
              ? a.createdAt.getTime() : 0;
            const bCreated = b.createdAt instanceof Date && !isNaN(b.createdAt.getTime())
              ? b.createdAt.getTime() : 0;
            return bCreated - aCreated;
            
          default:
            return 0;
        }
      } catch (error) {
        console.error('Error sorting tasks:', error);
        return 0; // Return equal if sorting fails
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

  // Show loading state
  if (loading) {
    return (
      <div className="py-12 flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-gray-600 dark:text-gray-300">Loading tasks...</p>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="py-12 flex flex-col items-center justify-center">
        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4">
          <span className="text-red-500 text-2xl">!</span>
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Error loading tasks
        </h3>
        <p className="text-gray-600 dark:text-gray-300 text-center max-w-md">
          {error.message || 'An unexpected error occurred while loading tasks.'}
        </p>
        <Button 
          onClick={() => fetchTasks()}
          className="mt-4"
          variant="primary"
        >
          Try Again
        </Button>
      </div>
    );
  }

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
              aria-label="Sort tasks by"
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
                  {task.title || 'Untitled Task'}
                </h3>
                
                {task.description && (
                  <p className="mt-1 text-gray-600 dark:text-gray-300 line-clamp-2">
                    {task.description}
                  </p>
                )}
                
                <div className="mt-3 flex flex-wrap gap-2">
                  {task.priority && (
                    <span className={`
                      px-2 py-1 rounded-full text-xs font-medium
                      ${task.priority === 'high' ? 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300' :
                        task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300' :
                        'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300'}
                    `}>
                      {typeof task.priority === 'string' ? 
                        task.priority.charAt(0).toUpperCase() + task.priority.slice(1) : 
                        'Unknown'}
                    </span>
                  )}
                  
                  {task.category && (
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                      {task.category}
                    </span>
                  )}
                  
                  {task.dueDate instanceof Date && !isNaN(task.dueDate.getTime()) && (
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
