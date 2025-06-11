import { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';

export const FetchWithErrorHandling = () => {
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const retryCountRef = useRef(0);
  const hasShownErrorToastRef = useRef(false);
  
  useEffect(() => {
    fetchTasks();
  }, []);
  
  const fetchTasks = async () => {
    // If we've already tried 3 times, don't try again
    if (retryCountRef.current >= 3) {
      if (!hasShownErrorToastRef.current) {
        toast.error("Failed to fetch tasks after multiple attempts");
        hasShownErrorToastRef.current = true;
      }
      return;
    }
    
    try {
      setIsLoading(true);
      const response = await fetch("/api/tasks");
      
      if (!response.ok) throw new Error("Fetch failed");
      
      const data = await response.json();
      setTasks(data);
      
      // Reset error state on successful fetch
      setError(null);
      retryCountRef.current = 0;
      hasShownErrorToastRef.current = false;
    } catch (error) {
      // Increment retry counter
      retryCountRef.current += 1;
      
      setError(error);
      
      // Only show toast once
      if (!hasShownErrorToastRef.current) {
        toast.error(`Failed to fetch tasks (attempt ${retryCountRef.current}/3)`);
        hasShownErrorToastRef.current = true;
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      {isLoading && <p>Loading tasks...</p>}
      {error && <p>Error loading tasks. <button onClick={fetchTasks}>Retry</button></p>}
      <ul>
        {tasks.map(task => (
          <li key={task.id}>{task.title}</li>
        ))}
      </ul>
    </div>
  );
};
