import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useUserStore } from '../store/userStore';

/**
 * This component helps users recover from the blank screen issue
 * It appears automatically if it detects that authentication might have failed
 * 
 * Enhanced version with better detection and debugging options
 */
const BlankScreenRecovery: React.FC = () => {
  const [visible, setVisible] = useState(false);
  const [diagnosing, setDiagnosing] = useState(false);
  const [diagnosis, setDiagnosis] = useState<Record<string, any> | null>(null);

  // Check for potential blank screen issues after a delay
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const user = useUserStore.getState().user;
      
      // If we don't have a user but we have auth data in localStorage or storage,
      // we might be experiencing the blank screen issue
      const hasLocalUser = localStorage.getItem('user') !== null;
      const hasAuthStart = sessionStorage.getItem('googleAuthStart') !== null;
      
      // For debugging - force show recovery UI in blank screen situations
      const urlParams = new URLSearchParams(window.location.search);
      const forceRecovery = urlParams.get('recovery') === 'show';
      
      // Show recovery UI if we might have an auth issue
      if (!user && (hasLocalUser || hasAuthStart || forceRecovery)) {
        console.log('BlankScreenRecovery: Showing recovery UI');
        setVisible(true);
      }
    }, 3000); // Reduced timeout for faster recovery
    
    return () => clearTimeout(timeoutId);
  }, []);

  // Diagnose the issue
  const runDiagnosis = async () => {
    setDiagnosing(true);
    
    try {
      // Check Supabase session
      const { data: { session }, error } = await supabase.auth.getSession();
      
      // Check localStorage
      let localUser = null;
      try {
        const userStr = localStorage.getItem('user');
        if (userStr) {
          localUser = JSON.parse(userStr);
        }
      } catch (e) {
        console.error('Error parsing localStorage user', e);
      }
      
      // Check if we have auth timing data
      const authStartTime = sessionStorage.getItem('googleAuthStart');
      const authCompleteTime = sessionStorage.getItem('googleAuthSuccess');
      
      // Get store user
      const storeUser = useUserStore.getState().user;
      
      // Set diagnosis result
      setDiagnosis({
        hasSession: !!session,
        hasLocalUser: !!localUser,
        hasStoreUser: !!storeUser,
        authStartTime: authStartTime || 'none',
        authCompleteTime: authCompleteTime || 'none',
        sessionError: error ? error.message : null,
        storageKeys: Object.keys(localStorage),
        sessionStorageKeys: Object.keys(sessionStorage)
      });
    } catch (e) {
      console.error('Error running diagnosis', e);
      setDiagnosis({ error: String(e) });
    } finally {
      setDiagnosing(false);
    }
  };
  
  // Fix auth state
  const fixAuth = async () => {
    setDiagnosing(true);
    
    try {
      // Clear local storage auth data
      const userBackup = localStorage.getItem('user');
      localStorage.removeItem('user');
      
      // Try to get session
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Session error when fixing auth', error);
        
        // Try to use minimal app
        localStorage.setItem('useOriginalApp', 'false');
        localStorage.setItem('appCrashed', 'true');
        
        // Reload the page
        window.location.reload();
        return;
      }
      
      if (session) {
        console.log('Found valid session, restoring user state');
        // Use session to fix auth state
        useUserStore.getState().setUser(session.user);
        localStorage.setItem('user', JSON.stringify(session.user));
        
        // Force reload to apply changes
        window.location.reload();
      } else {
        console.log('No valid session, trying to refresh');
        // Try to refresh session
        const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
        
        if (refreshError || !refreshData.session) {
          console.error('Failed to refresh session', refreshError);
          
          // If we had a user backup, try to restore it
          if (userBackup) {
            try {
              console.log('Trying to restore from backup');
              const user = JSON.parse(userBackup);
              localStorage.setItem('user', userBackup);
              useUserStore.getState().setUser(user);
              
              // Try minimal app mode
              localStorage.setItem('useOriginalApp', 'false');
              window.location.reload();
            } catch (e) {
              console.error('Error restoring user from backup', e);
              // Clear all auth data and go to login
              localStorage.removeItem('user');
              window.location.href = '/login';
            }
          } else {
            // No backup, go to login
            localStorage.removeItem('user');
            window.location.href = '/login';
          }
        } else {
          // Session refreshed, update user
          console.log('Session refreshed successfully');
          useUserStore.getState().setUser(refreshData.session.user);
          localStorage.setItem('user', JSON.stringify(refreshData.session.user));
          
          // Force reload to apply changes
          window.location.reload();
        }
      }
    } catch (e) {
      console.error('Error fixing auth', e);
      // Try to reset the app to minimal mode
      localStorage.setItem('useOriginalApp', 'false');
      localStorage.setItem('appCrashed', 'true');
      window.location.reload();
    } finally {
      setDiagnosing(false);
    }
  };
  
  // Return to login
  const returnToLogin = () => {
    localStorage.removeItem('user');
    sessionStorage.removeItem('googleAuthStart');
    sessionStorage.removeItem('googleAuthSuccess');
    window.location.href = '/login';
  };
  
  if (!visible) {
    return null;
  }
  
  return (
    <div 
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        backgroundColor: 'white',
        border: '1px solid #ccc',
        borderRadius: '8px',
        padding: '16px',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
        zIndex: 9999,
        maxWidth: '400px'
      }}
    >
      <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '8px' }}>
        Authentication Issue Detected
      </h3>
      
      <p style={{ fontSize: '14px', marginBottom: '12px' }}>
        We detected an issue with the Google login. You may be experiencing a blank screen.
      </p>
      
      {diagnosis && (
        <div style={{ 
          backgroundColor: '#f8f9fa',
          padding: '8px',
          borderRadius: '4px',
          marginBottom: '12px',
          fontSize: '12px'
        }}>
          <h4 style={{ fontSize: '13px', fontWeight: 'bold', marginBottom: '4px' }}>Diagnosis:</h4>
          <pre style={{ 
            overflow: 'auto',
            maxHeight: '150px',
            whiteSpace: 'pre-wrap',
            fontSize: '11px' 
          }}>
            {JSON.stringify(diagnosis, null, 2)}
          </pre>
        </div>
      )}
      
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        <button
          onClick={diagnosing ? undefined : runDiagnosis}
          disabled={diagnosing}
          style={{
            padding: '8px 12px',
            backgroundColor: '#edf2f7',
            border: 'none',
            borderRadius: '4px',
            cursor: diagnosing ? 'default' : 'pointer',
            fontSize: '14px'
          }}
        >
          {diagnosing ? 'Working...' : 'Diagnose'}
        </button>
      </div>
    </div>
  );
};

export default BlankScreenRecovery;
