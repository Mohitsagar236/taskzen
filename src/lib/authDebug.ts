import { supabase } from './supabase';
import { useUserStore } from '../store/userStore';

/**
 * AuthDebug - A collection of utilities to debug authentication issues
 * These functions help identify and fix the blank screen issue after Google login
 */

// Tracks key events in the auth flow
export interface AuthDebugEntry {
  timestamp: number;
  event: string;
  data?: any;
  error?: any;
}

// Store debug entries in session storage
const AUTH_DEBUG_KEY = 'auth_debug_entries';
const MAX_ENTRIES = 50;

/**
 * Log an authentication-related event for debugging
 */
export function logAuthEvent(event: string, data?: any, error?: any): void {
  try {
    const entry: AuthDebugEntry = {
      timestamp: Date.now(),
      event,
      data,
      error
    };
    
    // Get existing entries
    let entries: AuthDebugEntry[] = [];
    const entriesJson = sessionStorage.getItem(AUTH_DEBUG_KEY);
    
    if (entriesJson) {
      try {
        entries = JSON.parse(entriesJson);
      } catch (e) {
        console.error('Error parsing auth debug entries', e);
        entries = [];
      }
    }
    
    // Add new entry and limit size
    entries.push(entry);
    if (entries.length > MAX_ENTRIES) {
      entries = entries.slice(entries.length - MAX_ENTRIES);
    }
    
    // Save entries
    sessionStorage.setItem(AUTH_DEBUG_KEY, JSON.stringify(entries));
    
    // Also log to console
    if (error) {
      console.error(`AUTH DEBUG [${event}]`, data || '', error);
    } else {
      console.log(`AUTH DEBUG [${event}]`, data || '');
    }
  } catch (e) {
    console.error('Error logging auth event', e);
  }
}

/**
 * Get all debug entries
 */
export function getAuthDebugEntries(): AuthDebugEntry[] {
  try {
    const entriesJson = sessionStorage.getItem(AUTH_DEBUG_KEY);
    if (entriesJson) {
      return JSON.parse(entriesJson);
    }
  } catch (e) {
    console.error('Error getting auth debug entries', e);
  }
  return [];
}

/**
 * Clear auth debug entries
 */
export function clearAuthDebugEntries(): void {
  sessionStorage.removeItem(AUTH_DEBUG_KEY);
}

/**
 * Check authentication state consistency
 */
export async function checkAuthConsistency(): Promise<{
  isConsistent: boolean;
  details: {
    hasSupabaseSession: boolean;
    hasLocalStorageUser: boolean;
    hasStoreUser: boolean;
    userMatches: boolean;
  }
}> {
  try {
    // Check Supabase session
    const { data: { session }, error } = await supabase.auth.getSession();
    const hasSupabaseSession = !error && !!session;
    
    // Check localStorage user
    let localStorageUser = null;
    let localStorageUserStr = localStorage.getItem('user');
    const hasLocalStorageUser = !!localStorageUserStr;
    
    if (hasLocalStorageUser) {
      try {
        localStorageUser = JSON.parse(localStorageUserStr);
      } catch (e) {
        logAuthEvent('parse_local_storage_error', null, e);
      }
    }
    
    // Check store user
    const storeUser = useUserStore.getState().user;
    const hasStoreUser = !!storeUser;
    
    // Check user consistency
    let userMatches = false;
    if (hasSupabaseSession && hasLocalStorageUser && hasStoreUser) {
      userMatches = session.user.id === localStorageUser.id &&
                   session.user.id === storeUser.id;
    }
    
    const isConsistent = hasSupabaseSession && hasLocalStorageUser && hasStoreUser && userMatches;
    
    const details = {
      hasSupabaseSession,
      hasLocalStorageUser,
      hasStoreUser,
      userMatches
    };
    
    logAuthEvent('auth_consistency_check', details);
    
    return {
      isConsistent,
      details
    };
  } catch (e) {
    logAuthEvent('auth_consistency_error', null, e);
    return {
      isConsistent: false,
      details: {
        hasSupabaseSession: false,
        hasLocalStorageUser: false,
        hasStoreUser: false,
        userMatches: false
      }
    };
  }
}

/**
 * Fix authentication state if inconsistent
 */
export async function fixAuthState(): Promise<boolean> {
  try {
    logAuthEvent('fix_auth_state_start');
    
    // Get current auth state
    const { isConsistent, details } = await checkAuthConsistency();
    
    if (isConsistent) {
      logAuthEvent('auth_state_already_consistent');
      return true;
    }
    
    // If we have a valid Supabase session, use that as source of truth
    if (details.hasSupabaseSession) {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        logAuthEvent('fixing_auth_from_session', { userId: session.user.id });
        localStorage.setItem('user', JSON.stringify(session.user));
        useUserStore.getState().setUser(session.user);
        return true;
      }
    }
    
    // If we have a user in localStorage but not in session, try to refresh
    if (details.hasLocalStorageUser && !details.hasSupabaseSession) {
      logAuthEvent('fixing_auth_from_localstorage');
      
      const { data, error } = await supabase.auth.refreshSession();
      
      if (error || !data.session) {
        // If refresh fails, localStorage user is invalid
        logAuthEvent('refresh_failed_clearing_localStorage', null, error);
        localStorage.removeItem('user');
        useUserStore.getState().setUser(null);
        return false;
      }
      
      // Refresh succeeded, update everything
      logAuthEvent('refresh_succeeded', { userId: data.session.user.id });
      localStorage.setItem('user', JSON.stringify(data.session.user));
      useUserStore.getState().setUser(data.session.user);
      return true;
    }
    
    // If we only have a user in the store, set it in localStorage
    if (details.hasStoreUser && !details.hasLocalStorageUser) {
      const storeUser = useUserStore.getState().user;
      logAuthEvent('fixing_auth_from_store', { userId: storeUser.id });
      localStorage.setItem('user', JSON.stringify(storeUser));
      
      // Still try to validate with Supabase
      await useUserStore.getState().validateSession();
      return true;
    }
    
    // If nothing worked, clear everything
    logAuthEvent('auth_fix_failed_clearing_all');
    localStorage.removeItem('user');
    useUserStore.getState().setUser(null);
    return false;
  } catch (e) {
    logAuthEvent('fix_auth_state_error', null, e);
    return false;
  }
}

/**
 * Register event listeners for authentication debugging
 * This should be called once when the app starts
 */
export function setupAuthDebugMonitoring(): void {
  logAuthEvent('auth_debug_monitoring_setup');
  
  // Check for authentication issues after page load
  window.addEventListener('load', async () => {
    logAuthEvent('window_loaded');
    
    // Wait a bit to allow authentication to settle
    setTimeout(async () => {
      const { isConsistent } = await checkAuthConsistency();
      if (!isConsistent) {
        logAuthEvent('auth_inconsistency_detected_after_load');
        await fixAuthState();
      }
    }, 1000);
  });
  
  // Monitor for authentication state changes
  const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
    logAuthEvent('auth_state_change', { event, hasSession: !!session });
    
    if (event === 'SIGNED_IN' && session) {
      // Make sure user is properly set in localStorage
      localStorage.setItem('user', JSON.stringify(session.user));
      
      // Make sure user is properly set in store
      useUserStore.getState().setUser(session.user);
    }
    
    if (event === 'SIGNED_OUT') {
      localStorage.removeItem('user');
      useUserStore.getState().setUser(null);
    }
  });
  
  // Return unsubscribe function for cleanup
  return () => {
    subscription.unsubscribe();
    logAuthEvent('auth_debug_monitoring_cleanup');
  };
}
