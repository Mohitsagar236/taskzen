import React from 'react';
import { format } from 'date-fns';
import { CheckCircle, Circle, Pencil, Trash2, Clock } from 'lucide-react';
import { Task } from '../types';
import { useTaskStore } from '../store/taskStore';
import { getPriorityColor } from '../lib/utils';
import Button from './ui/Button';

interface TaskItemProps {
  task: Task;
  onEdit: (task: Task) => void;
}

const TaskItem: React.FC<TaskItemProps> = ({ task, onEdit }) => {
  const { toggleTaskCompletion, deleteTask } = useTaskStore();

  return (
    <div className={`p-4 mb-3 rounded-lg border ${task.completed ? 'bg-gray-50 dark:bg-gray-800' : 'bg-white dark:bg-gray-900'} shadow-sm transition-all`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3 flex-1">
          <button
            onClick={() => toggleTaskCompletion(task.id)}
            className="mt-1 focus:outline-none"
            aria-label={task.completed ? "Mark as incomplete" : "Mark as complete"}
          >
            {task.completed ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : (
              <Circle className="h-5 w-5 text-gray-400" />
            )}
          </button>
          
          <div className="flex-1">
            <h3 className={`font-medium ${task.completed ? 'line-through text-gray-500' : 'text-gray-900 dark:text-white'}`}>
              {task.title}
            </h3>
            
            {task.description && (
              <p className={`mt-1 text-sm ${task.completed ? 'text-gray-400' : 'text-gray-600 dark:text-gray-400'}`}>
                {task.description}
              </p>
            )}
            
            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
              <span className="px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300">
                {task.category}
              </span>
              
              <span className={`px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700 ${getPriorityColor(task.priority)}`}>
                {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
              </span>
              
              {task.dueDate && (
                <span className="flex items-center px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300">
                  <Clock className="h-3 w-3 mr-1" />
                  {format(new Date(task.dueDate), 'MMM d, yyyy')}
                </span>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex space-x-1">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => onEdit(task)}
            aria-label="Edit task"
          >
            <Pencil className="h-4 w-4 text-gray-500" />
          </Button>
          
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => deleteTask(task.id)}
            aria-label="Delete task"
          >
            <Trash2 className="h-4 w-4 text-red-500" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TaskItem;