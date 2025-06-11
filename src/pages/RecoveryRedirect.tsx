import React, { useEffect } from 'react';

/**
 * RecoveryRedirect - A simple component that serves as an entry point
 * to redirect users to the more stable parts of the application when direct loading fails
 */
export default function RecoveryRedirect() {
  useEffect(() => {
    // Wait a moment to allow browser to render something
    const timer = setTimeout(() => {
      // Add recovery flag to URL
      window.location.href = '/?mode=transition';
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center',
      height: '100vh',
      backgroundColor: '#f3f4f6',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '0.5rem',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        maxWidth: '600px',
        textAlign: 'center'
      }}>
        <h1 style={{ color: '#3b82f6', marginBottom: '1rem' }}>TaskZen Recovery</h1>
        <p style={{ marginBottom: '1.5rem', fontSize: '1.125rem', color: '#4b5563' }}>
          Redirecting you to the safe application mode...
        </p>
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ 
            width: '60px', 
            height: '60px', 
            border: '5px solid #dbeafe', 
            borderTopColor: '#3b82f6', 
            borderRadius: '50%',
            margin: '0 auto',
            animation: 'spin 1s linear infinite'
          }}></div>
        </div>
        <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
          If you're not redirected automatically, 
          <a 
            href="/?mode=transition" 
            style={{ color: '#3b82f6', textDecoration: 'none', marginLeft: '0.25rem' }}
          >
            click here
          </a>.
        </p>
      </div>
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
