import { supabase } from './supabase';
import { useUserStore } from '../store/userStore';

/**
 * Ensure user data is properly persisted across all storage mechanisms
 * @param user The user object to persist
 * @returns Whether the operation was successful
 */
export async function ensureUserIsPersisted(user: any): Promise<boolean> {
  try {
    console.log('AuthFix: Ensuring user persistence...');
    
    // 1. Update the store
    useUserStore.getState().setUser(user);
    
    // 2. Update localStorage
    localStorage.setItem('user', JSON.stringify(user));
    
    // 3. Validate the session
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Session validation error:', error);
      return false;
    }
    
    if (!session) {
      console.log('No active session found, attempting refresh');
      
      // Try to refresh the session
      const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
      
      if (refreshError) {
        console.error('Session refresh failed:', refreshError);
        return false;
      }
      
      if (!refreshData.session) {
        console.error('No session after refresh');
        return false;
      }
    }
    
    // 4. Verify the user is properly set in the store
    const storeUser = useUserStore.getState().user;
    if (!storeUser) {
      console.warn('User still missing from store, forcing update');
      useUserStore.getState().setUser(user);
    }
    
    return true;
  } catch (err) {
    console.error('Error persisting user:', err);
    return false;
  }
}

/**
 * Fix authentication state issues that might cause blank screens
 */
export async function fixAuthState(): Promise<boolean> {
  console.log('Running auth state fix...');
  
  try {
    // 1. Check for session in Supabase
    const { data: { session }, error } = await supabase.auth.getSession();
    
    // 2. Check for user in localStorage
    let localStorageUser = null;
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        localStorageUser = JSON.parse(userStr);
      }
    } catch (e) {
      console.error('Error parsing localStorage user:', e);
    }
    
    // 3. Check for user in store
    const storeUser = useUserStore.getState().user;
    
    console.log('Auth state check:', {
      hasSession: !!session,
      hasLocalStorageUser: !!localStorageUser,
      hasStoreUser: !!storeUser,
    });
    
    // Case 1: We have a valid session
    if (session) {
      console.log('Valid session found, ensuring user data consistency');
      await ensureUserIsPersisted(session.user);
      return true;
    }
    
    // Case 2: No session but we have user in localStorage or store
    if (!session && (localStorageUser || storeUser)) {
      console.log('No active session but found stored user data, attempting session refresh');
      
      const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
      
      if (refreshError || !refreshData.session) {
        console.error('Session refresh failed, clearing inconsistent data');
        localStorage.removeItem('user');
        useUserStore.getState().setUser(null);
        return false;
      }
      
      // Refresh worked, update everything with the refreshed user
      await ensureUserIsPersisted(refreshData.session.user);
      return true;
    }
    
    // Case 3: No session and no stored user data
    console.log('No authentication data found');
    return false;
  } catch (err) {
    console.error('Error fixing auth state:', err);
    return false;
  }
}

/**
 * Monitor for auth transitions and fix blank screens
 */
export function setupAuthMonitoring(): () => void {
  console.log('Setting up auth state monitoring');
  
  // Check for authentication issues after a delay
  const timeoutId = setTimeout(() => {
    const hasUser = !!useUserStore.getState().user;
    
    if (!hasUser) {
      console.log('Potential auth issue detected, attempting fix');
      fixAuthState();
    }
  }, 3000);
  
  // Create a recovery UI if stuck
  const recoveryTimeoutId = setTimeout(() => {
    const hasUser = !!useUserStore.getState().user;
    
    if (!hasUser && document.body) {
      console.log('Creating recovery UI for potential blank screen');
      
      const recoveryDiv = document.createElement('div');
      recoveryDiv.style.position = 'fixed';
      recoveryDiv.style.bottom = '20px';
      recoveryDiv.style.right = '20px';
      recoveryDiv.style.padding = '15px';
      recoveryDiv.style.backgroundColor = '#f8d7da';
      recoveryDiv.style.color = '#721c24';
      recoveryDiv.style.borderRadius = '4px';
      recoveryDiv.style.zIndex = '9999';
      recoveryDiv.style.boxShadow = '0 0 10px rgba(0,0,0,0.2)';
      
      recoveryDiv.innerHTML = `
        <h3 style="font-weight:bold;margin-bottom:8px">Authentication Issue</h3>
        <p style="margin-bottom:10px">We detected a problem with your login</p>
        <div style="display:flex;gap:8px">
          <button id="auth-fix" style="padding:5px 10px;background:#007bff;color:white;border:none;border-radius:3px;cursor:pointer">Fix Auth</button>
          <button id="auth-clear" style="padding:5px 10px;background:#dc3545;color:white;border:none;border-radius:3px;cursor:pointer">Clear & Login</button>
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
    }
  }, 10000);
  
  // Return cleanup function
  return () => {
    clearTimeout(timeoutId);
    clearTimeout(recoveryTimeoutId);
  };
}
