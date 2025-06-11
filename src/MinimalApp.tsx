import React, { useState, useEffect } from 'react';

export default function MinimalApp() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('MinimalApp mounting');
    
    // Simple loading simulation
    const timer = setTimeout(() => {
      console.log('Loading complete in MinimalApp');
      setIsLoading(false);
    }, 1000);
    
    // Error handling
    window.addEventListener('error', (event) => {
      console.error('Global error caught:', event.error);
      setError(`Error: ${event.error?.message || 'Unknown error'}`);
    });
    
    return () => {
      clearTimeout(timer);
    };
  }, []);

  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        flexDirection: 'column',
        fontFamily: 'Arial, sans-serif'
      }}>
        <h1>Loading TaskZen...</h1>
        <div style={{
          width: '50px',
          height: '50px',
          border: '5px solid #e0e0e0',
          borderTopColor: '#3498db',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        padding: '20px', 
        maxWidth: '600px', 
        margin: '0 auto', 
        fontFamily: 'Arial, sans-serif'
      }}>
        <h1 style={{ color: '#e74c3c' }}>Something went wrong</h1>
        <pre style={{ 
          background: '#f8f8f8', 
          padding: '15px', 
          borderRadius: '4px', 
          overflowX: 'auto' 
        }}>
          {error}
        </pre>
        <button 
          onClick={() => window.location.reload()} 
          style={{
            background: '#3498db',
            color: 'white',
            border: 'none',
            padding: '10px 15px',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Reload Application
        </button>
      </div>
    );
  }

  return (
    <div style={{ 
      padding: '20px', 
      maxWidth: '800px', 
      margin: '0 auto',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1>TaskZen App</h1>
      <p>The minimal app is working correctly! This means there's likely an issue with:</p>
      <ul style={{ lineHeight: 1.6 }}>
        <li>The store initialization (Zustand)</li>
        <li>Component rendering in the main dashboard</li>
        <li>React Router configuration</li>
      </ul>      <div style={{ marginTop: '20px' }}>
        <h2>Debug Information</h2>
        <p>Please check your browser console (F12) for detailed error messages.</p>
        <button 
          onClick={() => window.location.href = '/'}
          style={{
            background: '#2ecc71',
            color: 'white',
            border: 'none',
            padding: '10px 15px',
            borderRadius: '4px',
            marginRight: '10px',
            cursor: 'pointer'
          }}
        >
          Try Main App Again
        </button>
        <button 
          onClick={() => {
            window.location.href = '/?mode=transition';
          }}
          style={{
            background: '#3498db',
            color: 'white',
            border: 'none',
            padding: '10px 15px',
            borderRadius: '4px',
            marginRight: '10px',
            cursor: 'pointer'
          }}
        >
          Go to Safe Dashboard
        </button>
        <button 
          onClick={() => {
            localStorage.clear();
            window.location.reload();
          }}
          style={{
            background: '#e74c3c',
            color: 'white',
            border: 'none',
            padding: '10px 15px',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Clear Storage & Reload
        </button>
      </div>
    </div>
  );
}
