import React, { useState, useEffect } from 'react';
import { useTaskStore } from '../store/taskStore';

export const TasksComponent: React.FC = () => {
  const { tasks } = useTaskStore();
  const fetchTasks = useTaskStore(state => state.fetchTasks);
  const [isLoading, setIsLoading] = useState(false);
  
  // This will fetch tasks only once when the component mounts
  useEffect(() => {
    const loadTasks = async () => {
      setIsLoading(true);
      
      // Our improved fetchTasks function handles error toasts internally
      await fetchTasks();
      
      setIsLoading(false);
    };
    
    loadTasks();
  }, [fetchTasks]); // Dependency will trigger only once due to stable reference

  // Manual refresh function if needed
  const handleRefresh = async () => {
    setIsLoading(true);
    await fetchTasks();
    setIsLoading(false);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Tasks</h2>
        <button 
          disabled={isLoading} 
          onClick={handleRefresh}
          className="px-3 py-1 bg-blue-500 text-white rounded"
        >
          {isLoading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>
      
      {tasks.length === 0 ? (
        <p>No tasks available</p>
      ) : (
        <ul>
          {tasks.map(task => (
            <li key={task.id} className="mb-2 p-3 border rounded">
              <h3 className="font-medium">{task.title}</h3>
              <p className="text-sm text-gray-600">{task.description || 'No description'}</p>
              <div className="flex justify-between mt-2 text-xs">
                <span>Status: {task.status}</span>
                <span>Priority: {task.priority}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
