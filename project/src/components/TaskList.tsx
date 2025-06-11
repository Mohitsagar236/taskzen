import React, { useState } from 'react';
import { Task } from '../types';
import TaskItem from './TaskItem';
import TaskForm from './TaskForm';
import Modal from './ui/Modal';
import { useTaskStore } from '../store/taskStore';
import { Plus, Filter } from 'lucide-react';
import Button from './ui/Button';

interface TaskListProps {
  category?: string;
}

const TaskList: React.FC<TaskListProps> = ({ category }) => {
  const { tasks } = useTaskStore();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentTask, setCurrentTask] = useState<Task | null>(null);
  const [filter, setFilter] = useState<'all' | 'completed' | 'pending'>('all');
  const [sortBy, setSortBy] = useState<'dueDate' | 'priority' | 'createdAt'>('dueDate');
  const [showFilters, setShowFilters] = useState(false);

  const filteredTasks = tasks
    .filter((task) => {
      if (category && task.category !== category) return false;
      
      if (filter === 'completed') return task.completed;
      if (filter === 'pending') return !task.completed;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'dueDate') {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }
      
      if (sortBy === 'priority') {
        const priorityValue = { high: 3, medium: 2, low: 1 };
        return priorityValue[b.priority] - priorityValue[a.priority];
      }
      
      // Default: createdAt
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  const handleEditTask = (task: Task) => {
    setCurrentTask(task);
    setIsEditModalOpen(true);
  };

  const handleAddTask = () => {
    setIsAddModalOpen(true);
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
          {category ? `${category} Tasks` : 'All Tasks'}
        </h2>
        
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4 mr-1" />
            Filter
          </Button>
          
          <Button onClick={handleAddTask}>
            <Plus className="h-4 w-4 mr-1" />
            Add Task
          </Button>
        </div>
      </div>
      
      {showFilters && (
        <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Status
              </label>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as any)}
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              >
                <option value="all">All</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Sort By
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              >
                <option value="dueDate">Due Date</option>
                <option value="priority">Priority</option>
                <option value="createdAt">Created Date</option>
              </select>
            </div>
          </div>
        </div>
      )}
      
      {filteredTasks.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400">No tasks found</p>
        </div>
      ) : (
        <div>
          {filteredTasks.map((task) => (
            <TaskItem key={task.id} task={task} onEdit={handleEditTask} />
          ))}
        </div>
      )}
      
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Task"
      >
        <TaskForm onClose={() => setIsAddModalOpen(false)} />
      </Modal>
      
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Task"
      >
        {currentTask && (
          <TaskForm
            task={currentTask}
            onClose={() => setIsEditModalOpen(false)}
          />
        )}
      </Modal>
    </div>
  );
};

export default TaskList;