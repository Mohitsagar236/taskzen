import React, { useState, useEffect } from 'react';
import { useUserStore } from '../store/userStore';
import { useTaskStore } from '../store/taskStore';
import toast from 'react-hot-toast';
import { clearAllStores, clearStore } from '../lib/clearStores';

// Simple version of Dashboard to isolate issues
export default function SafeDashboard() {
  console.log('SafeDashboard component rendering');
  const [error, setError] = useState<string | null>(null);
  
  // Try to safely access store data
  let userData = "Not available";
  let tasks = "Not available";
  
  try {
    const user = useUserStore((state) => state.user);
    userData = user ? `User: ${user.email}` : "No user found";
  } catch (err) {
    console.error('Error accessing user store:', err);
    setError(`User store error: ${err instanceof Error ? err.message : String(err)}`);
  }
  
  try {
    const allTasks = useTaskStore((state) => state.tasks);
    tasks = `${allTasks?.length || 0} tasks found`;
  } catch (err) {
    console.error('Error accessing task store:', err);
    setError(`Task store error: ${err instanceof Error ? err.message : String(err)}`);
  }
  
  // Create a simple task for testing
  const handleAddTestTask = () => {
    try {
      const addTask = useTaskStore((state) => state.addTask);
      
      if (!addTask) {
        toast.error("addTask function not available");
        return;
      }
      
      addTask({
        title: "Test Task " + new Date().toLocaleTimeString(),
        description: "This is a test task",
        priority: "medium",
        status: "todo",
        category: "test",
        completed: false
      }).then(() => {
        toast.success("Test task added successfully!");
      }).catch((err) => {
        toast.error(`Failed to add task: ${err.message}`);
      });
    } catch (err) {
      console.error('Error in handleAddTestTask:', err);
      toast.error(`Error: ${err instanceof Error ? err.message : String(err)}`);
    }
  };
  
  return (
    <div style={{ padding: '20px' }}>
      <h1>Safe Dashboard</h1>
      
      {error ? (
        <div style={{ 
          padding: '10px', 
          backgroundColor: '#ffecec', 
          border: '1px solid #f5aca6',
          borderRadius: '5px',
          marginBottom: '20px'
        }}>
          <h3>Error Detected:</h3>
          <p>{error}</p>
        </div>
      ) : null}
      
      <div style={{ 
        backgroundColor: '#f8f9fa', 
        padding: '15px', 
        borderRadius: '5px',
        marginBottom: '20px'
      }}>
        <h2>Store Information</h2>
        <div>
          <strong>User: </strong> {userData}
        </div>
        <div>
          <strong>Tasks: </strong> {tasks}
        </div>
      </div>        <div>
        <h2>Actions</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '10px', marginBottom: '20px' }}>
          <button 
            onClick={handleAddTestTask}
            style={{
              backgroundColor: '#4CAF50',
              border: 'none',
              color: 'white',
              padding: '10px 15px',
              textAlign: 'center',
              textDecoration: 'none',
              display: 'inline-block',
              fontSize: '16px',
              cursor: 'pointer',
              borderRadius: '4px'
            }}
          >
            Add Test Task
          </button>
          
          <button 
            onClick={() => {
              clearAllStores();
              toast.success("All stores cleared");
              setTimeout(() => window.location.reload(), 1000);
            }}
            style={{
              backgroundColor: '#e74c3c',
              border: 'none',
              color: 'white',
              padding: '10px 15px',
              textAlign: 'center',
              textDecoration: 'none',
              display: 'inline-block',
              fontSize: '16px',
              cursor: 'pointer',
              borderRadius: '4px'
            }}
          >
            Reset All Stores
          </button>
          
          <button 
            onClick={() => {
              clearStore('userStore');
              toast.success("User store cleared");
            }}
            style={{
              backgroundColor: '#3498db',
              border: 'none',
              color: 'white',
              padding: '10px 15px',
              textAlign: 'center',
              textDecoration: 'none',
              display: 'inline-block',
              fontSize: '16px',
              cursor: 'pointer',
              borderRadius: '4px'
            }}
          >
            Clear User Store
          </button>
          
          <button 
            onClick={() => {
              clearStore('taskStore');
              toast.success("Task store cleared");
            }}
            style={{
              backgroundColor: '#f39c12',
              border: 'none',
              color: 'white',
              padding: '10px 15px',
              textAlign: 'center',
              textDecoration: 'none',
              display: 'inline-block',
              fontSize: '16px',
              cursor: 'pointer',
              borderRadius: '4px'
            }}
          >
            Clear Task Store
          </button>
          
          <button 
            onClick={() => {
              localStorage.setItem('useOriginalApp', 'true');
              toast.success("Switching to original app...");
              setTimeout(() => window.location.href = '/', 1000);
            }}
            style={{
              backgroundColor: '#9b59b6',
              border: 'none',
              color: 'white',
              padding: '10px 15px',
              textAlign: 'center',
              textDecoration: 'none',
              display: 'inline-block',
              fontSize: '16px',
              cursor: 'pointer',
              borderRadius: '4px'
            }}
          >
            Try Original App
          </button>
        </div>
      </div>
    </div>
  );
}
