import { supabase } from './supabase';
import { useUserStore } from '../store/userStore';

/**
 * Specialized helper functions for Google authentication flow
 * These help prevent and fix the blank screen issue after Google login
 */

/**
 * Initialize a Google authentication flow by cleaning up any previous auth state
 * @returns Success status of initialization
 */
export function initGoogleAuth(): boolean {
  try {
    console.log('Initializing Google authentication flow');
    
    // Clear localStorage auth data that might cause conflicts
    localStorage.removeItem('user');
    
    // Clear session storage data that might interfere
    sessionStorage.removeItem('supabase.auth.token');
    sessionStorage.removeItem('googleAuthSuccess');
    
    // Create a timestamp to track the auth flow
    const timestamp = Date.now().toString();
    sessionStorage.setItem('googleAuthStart', timestamp);
    console.log('Setting auth start timestamp:', timestamp);
    
    return true;
  } catch (error) {
    console.error('Error initializing Google auth:', error);
    return false;
  }
}

/**
 * Check if we're in the middle of a Google auth flow
 * This helps detect and potentially recover from a blank screen
 */
export function detectPendingGoogleAuth(): {
  inProgress: boolean;
  startTime: number | null;
  duration: number | null;
} {
  try {
    const authStartStr = sessionStorage.getItem('googleAuthStart');
    const authCompleteStr = sessionStorage.getItem('googleAuthSuccess');
    
    if (!authStartStr) {
      return { inProgress: false, startTime: null, duration: null };
    }
    
    const startTime = parseInt(authStartStr);
    const now = Date.now();
    const duration = now - startTime;
    
    // If auth started but never completed, and it's been less than 5 minutes,
    // we're probably in a broken auth flow
    const inProgress = !authCompleteStr && duration < 5 * 60 * 1000;
    
    return {
      inProgress,
      startTime,
      duration
    };
  } catch (error) {
    console.error('Error detecting pending Google auth:', error);
    return { inProgress: false, startTime: null, duration: null };
  }
}

/**
 * Attempt to recover from a broken Google auth flow
 */
export async function recoverFromGoogleAuth(): Promise<boolean> {
  try {
    console.log('Attempting to recover from broken Google auth flow');
    
    // First check if we have a valid session
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Error getting session during recovery:', error);
      return false;
    }
    
    if (session) {
      console.log('Found valid session during recovery, restoring user state');
      
      // Update the user store
      useUserStore.getState().setUser(session.user);
      
      // Update localStorage
      localStorage.setItem('user', JSON.stringify(session.user));
      
      // Clear pending auth flags
      sessionStorage.removeItem('googleAuthStart');
      sessionStorage.setItem('googleAuthSuccess', Date.now().toString());
      
      return true;
    }
    
    console.log('No valid session found during recovery');
    return false;
  } catch (error) {
    console.error('Error recovering from Google auth:', error);
    return false;
  }
}

/**
 * Track successful completion of Google auth flow
 * @param userId User ID from successful auth
 */
export function completeGoogleAuth(userId: string): void {
  try {
    console.log('Marking Google auth as complete for user:', userId);
    
    // Record successful auth completion
    sessionStorage.setItem('googleAuthSuccess', Date.now().toString());
    
    // Calculate and log duration
    const startTimeStr = sessionStorage.getItem('googleAuthStart');
    if (startTimeStr) {
      const startTime = parseInt(startTimeStr);
      const duration = Date.now() - startTime;
      console.log(`Google auth completed in ${duration}ms`);
    }
  } catch (error) {
    console.error('Error completing Google auth:', error);
  }
}
