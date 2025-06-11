import { supabase } from './supabase';
import { useUserStore } from '../store/userStore';

/**
 * Helper functions to deal with authentication state issues
 * These functions help address the blank screen issue after Google login
 */

/**
 * Ensures that a user is properly persisted in all required locations
 * This helps prevent the blank screen issue after login
 */
export const ensureUserIsPersisted = async (user: any): Promise<boolean> => {
  if (!user) return false;
  
  try {
    console.log('AuthUtils: Ensuring user is properly persisted');
    
    // Check if this is a guest user
    const isGuestUser = user.app_metadata?.provider === 'guest' || user.app_metadata?.isGuest === true;
    
    if (isGuestUser) {
      console.log('Guest user detected, setting guest state');
      // For guest users, we use a separate storage mechanism
      localStorage.setItem('guestUser', JSON.stringify({
        id: user.id,
        isGuest: true
      }));
      useUserStore.getState().signInAsGuest();
      return true;
    }
    
    // Normal user flow
    // 1. Save to localStorage directly
    localStorage.setItem('user', JSON.stringify(user));
    
    // 2. Use the store setter
    useUserStore.getState().setUser(user);
    
    // 3. Validate the session is active
    const { data: { session }, error } = await supabase.auth.getSession();
    
    // If the session is invalid but we have a user, try to refresh
    if (!session || error) {
      console.warn('Session invalid or error occurred, attempting refresh');
      const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
      
      if (refreshError || !refreshData.session) {
        console.error('Session refresh failed:', refreshError);
        return false;
      }
      
      // Update with refreshed user data
      useUserStore.getState().setUser(refreshData.session.user);
      localStorage.setItem('user', JSON.stringify(refreshData.session.user));
    }
    
    return true;
  } catch (err) {
    console.error('Error persisting user:', err);
    return false;
  }
};

/**
 * Fixes authentication state by reconciling Supabase session with local storage
 * This should be called when a blank screen is detected after authentication
 */
export const fixAuthState = async (): Promise<boolean> => {
  try {
    console.log('AuthUtils: Attempting to fix auth state');
    
    // Check for guest user first
    let guestUser = null;
    try {
      const guestUserStr = localStorage.getItem('guestUser');
      if (guestUserStr) {
        guestUser = JSON.parse(guestUserStr);
        if (guestUser && guestUser.isGuest) {
          console.log('Found guest user, restoring guest session');
          useUserStore.getState().signInAsGuest();
          return true;
        }
      }
    } catch (e) {
      console.error('Error parsing guest user:', e);
    }
    
    // Get current session from Supabase
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Error getting session:', error);
      return false;
    }
    
    // Get user from localStorage 
    let localUser = null;
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) localUser = JSON.parse(userStr);
    } catch (e) {
      console.error('Error parsing localStorage user:', e);
    }
    
    // Get user from store
    const storeUser = useUserStore.getState().user;
    const isGuestUser = useUserStore.getState().isGuestUser;
    
    console.log('Auth state check:', {
      hasSession: !!session,
      hasLocalUser: !!localUser,
      hasStoreUser: !!storeUser,
      isGuestUser
    });
    
    // Handle guest user case
    if (isGuestUser) {
      // If we're a guest user but somehow have a session, prioritize the session
      if (session) {
        console.log('Found session while in guest mode, switching to authenticated user');
        await ensureUserIsPersisted(session.user);
        return true;
      }
      
      // Otherwise maintain guest state
      return true;
    }
    
    // Case 1: We have a session but missing users in store/localStorage
    if (session && (!storeUser || !localUser)) {
      console.log('Found session but missing user in store/localStorage, fixing...');
      await ensureUserIsPersisted(session.user);
      return true;
    }
    
    // Case 2: We have user in store/localStorage but no session
    if (!session && (storeUser || localUser)) {
      console.log('Found user in store/localStorage but no session, clearing...');
      useUserStore.getState().setUser(null);
      localStorage.removeItem('user');
      return false;
    }
    
    // Case 3: We have all three, but need to ensure they're consistent
    if (session && storeUser && localUser) {
      // Ensure the IDs match
      if (session.user.id !== storeUser.id || 
          session.user.id !== localUser.id) {
        console.log('User ID mismatch, refreshing from session');
        await ensureUserIsPersisted(session.user);
      }
      return true;
    }
    
    return !!session;
  } catch (err) {
    console.error('Error fixing auth state:', err);
    return false;
  }
};

/**
 * Creates error handler for auth transitions
 * This helps with the debugging of blank screens
 */
export const monitorAuthTransition = (): void => {
  // Set a timeout to check if the transition completes
  const transitionTimeout = setTimeout(async () => {
    const isLoggedIn = !!useUserStore.getState().user;
    const isGuestUser = useUserStore.getState().isGuestUser;
    
    if (!isLoggedIn && !isGuestUser) {
      console.log('Auth transition may have failed, adding recovery UI');
      
      const recoveryDiv = document.createElement('div');
      recoveryDiv.className = 'fixed bottom-4 right-4 bg-red-100 border border-red-400 text-red-700 p-4 rounded shadow-lg';
      recoveryDiv.innerHTML = `
        <h3 class="font-bold mb-2">Authentication Issue Detected</h3>
        <p class="mb-3">We detected a problem with your login. Click a button below to recover:</p>
        <div class="flex gap-2">
          <button id="auth-fix" class="px-3 py-1 bg-blue-500 text-white rounded text-sm">Fix Auth</button>
          <button id="auth-clear" class="px-3 py-1 bg-red-500 text-white rounded text-sm">Clear & Login</button>
          <button id="auth-guest" class="px-3 py-1 bg-green-500 text-white rounded text-sm">Continue as Guest</button>
        </div>
      `;
      
      document.body.appendChild(recoveryDiv);
      
      document.getElementById('auth-fix')?.addEventListener('click', async () => {
        const fixed = await fixAuthState();
        if (fixed) {
          window.location.href = '/';
        } else {
          window.location.href = '/login';
        }
      });
      
      document.getElementById('auth-clear')?.addEventListener('click', () => {
        localStorage.clear();
        sessionStorage.clear();
        window.location.href = '/login';
      });
      
      document.getElementById('auth-guest')?.addEventListener('click', () => {
        useUserStore.getState().signInAsGuest();
        window.location.href = '/';
      });
    }
  }, 8000);
  
  // Clear the timeout if we detect a successful navigation
  window.addEventListener('beforeunload', () => {
    clearTimeout(transitionTimeout);
  });
};
