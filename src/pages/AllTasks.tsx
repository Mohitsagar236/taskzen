import React, { useState } from 'react';
import { TaskList } from '../components/TaskList.fixed';
import { useTaskStore } from '../store/taskStore';
import { Button } from '../components/ui/Button';
import { ErrorBoundary } from '../components/ErrorBoundary';

function AllTasks() {
  const tasks = useTaskStore((state) => state.tasks);
  const [filter, setFilter] = useState<'all' | 'completed' | 'active'>('all');
  
  const filteredTasks = tasks.filter((task) => {
    if (filter === 'completed') return task.completed;
    if (filter === 'active') return !task.completed;
    return true;
  });
  return (
    <div className="container mx-auto max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold dark:text-white">All Tasks</h1>
        <div className="flex space-x-2">
          <Button
            variant={filter === 'all' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setFilter('all')}
          >
            All
          </Button>
          <Button
            variant={filter === 'active' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setFilter('active')}
          >
            Active
          </Button>
          <Button
            variant={filter === 'completed' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setFilter('completed')}
          >
            Completed
          </Button>
        </div>
      </div>
      
      <ErrorBoundary name="TaskList" onError={(error) => console.error('TaskList error:', error)}>
        <TaskList />
      </ErrorBoundary>
    </div>
  );
}

export default AllTasks;