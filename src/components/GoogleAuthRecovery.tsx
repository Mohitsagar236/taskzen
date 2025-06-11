import * as React from 'react';
import { supabase } from '../lib/supabase';
import { useUserStore } from '../store/userStore';

/**
 * GoogleAuthRecovery - A component that automatically detects and recovers from
 * blank screen issues after Google authentication
 */
export default function GoogleAuthRecovery() {
  React.useEffect(() => {
    // Only run the recovery process if we detect a completed Google auth
    // but the user isn't properly set in the application
    const checkAndRecover = async () => {
      // Check for signs of a recently completed Google auth
      const authComplete = document.cookie
        .split('; ')
        .find(row => row.startsWith('authComplete='));
      
      const googleAuthSuccess = sessionStorage.getItem('googleAuthSuccess');
      const googleAuthComplete = sessionStorage.getItem('googleAuthComplete');
      
      // Check if we have evidence of completed auth but no user in the store
      const user = useUserStore.getState().user;
      
      if ((authComplete || googleAuthSuccess || googleAuthComplete) && !user) {
        console.log('Detected blank screen after Google auth, attempting recovery...');
        
        try {
          // First check if we can get the session directly
          const { data: { session }, error } = await supabase.auth.getSession();
          
          if (error) {
            console.error('Error retrieving session during recovery:', error);
            return;
          }
          
          if (session) {
            console.log('Found valid session during recovery, restoring user state');
            
            // Set user in store
            useUserStore.getState().setUser(session.user);
            
            // Also ensure localStorage is updated
            localStorage.setItem('user', JSON.stringify(session.user));
            
            console.log('User state restored successfully');
            
            // Force a refresh after a short delay to ensure the app re-renders
            // with the restored state
            setTimeout(() => {
              window.location.reload();
            }, 500);
          } else {
            console.log('No valid session found during recovery');
            
            // Try to get user from localStorage as fallback
            try {
              const storedUserStr = localStorage.getItem('user');
              if (storedUserStr) {
                const storedUser = JSON.parse(storedUserStr);
                console.log('Found user in localStorage, attempting to restore');
                
                // Set user in store
                useUserStore.getState().setUser(storedUser);
                
                // Try to refresh the session
                await supabase.auth.refreshSession();
                
                setTimeout(() => {
                  window.location.reload();
                }, 500);
              }
            } catch (e) {
              console.error('Error restoring from localStorage:', e);
            }
          }
        } catch (err) {
          console.error('Error during auth recovery:', err);
        }
      }
    };
    
    // Run recovery check after a short delay to allow normal auth flow to complete
    const timeoutId = setTimeout(checkAndRecover, 2000);
    
    return () => clearTimeout(timeoutId);
  }, []);
  
  // This is a utility component that doesn't render anything
  return null;
}
