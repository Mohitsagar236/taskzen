import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { storage } from '../lib/storage';
import { supabase } from '../lib/supabase';

interface UserStore {  
  user: any | null;
  isGuestUser: boolean;
  darkMode: boolean;
  preferences: any;
  setUser: (user: any | null) => void;
  validateSession: () => Promise<boolean>;
  synchronizeAuthState: () => Promise<boolean>;
  toggleDarkMode: () => void;
  updatePreferences: (preferences: any) => void;
  resetPreferences: () => void;
  signOut: () => Promise<void>;
  signInAsGuest: () => void;
}

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      user: storage.getUser(),
      isGuestUser: false,
      darkMode: false,
      preferences: {
        defaultView: 'list',
        showCompletedTasks: true,
        enableNotifications: true,
        enableSounds: true,
        emailNotifications: 'important',
        taskSortOrder: 'dueDate',
        defaultPriority: 'medium',
        timeFormat: '12h',
        dateFormat: 'MM/DD/YYYY',
        language: 'en',
        colorTheme: 'blue',
        enableEncryption: false,
        enableTracking: true,
      },      validateSession: async () => {
        try {
          console.log('UserStore: Validating session...');
          
          // Check if user is a guest - skip validation for guests
          const isGuest = useUserStore.getState().isGuestUser;
          if (isGuest) {
            console.log('Guest user detected, skipping session validation');
            return true;
          }
          
          const { data: { session }, error } = await supabase.auth.getSession();
          
          if (error) {
            console.error('Session validation error:', error);
            storage.clearUser();
            set({ user: null });
            return false;
          }
          
          if (!session) {
            console.log('No active session found during validation');
            
            // Check if we need to refresh the token
            try {
              console.log('Attempting to refresh session...');
              const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
              
              if (refreshError) {
                console.error('Session refresh failed:', refreshError);
                storage.clearUser();
                set({ user: null });
                return false;
              }
              
              if (refreshData.session) {
                console.log('Session refreshed successfully');
                storage.saveUser(refreshData.session.user);
                set({ user: refreshData.session.user });
                return true;
              }
            } catch (refreshErr) {
              console.error('Error during session refresh:', refreshErr);
            }
            
            // If we reach here, both session validation and refresh failed
            storage.clearUser();
            set({ user: null });
            return false;
          }
          
          console.log('Valid session found for user:', session.user.id);
          
          // Update stored user data with latest session data
          storage.saveUser(session.user);
          set({ user: session.user });
          return true;
        } catch (error) {
          console.error('Session validation error:', error);
          storage.clearUser();
          set({ user: null });
          return false;
        }
      },      synchronizeAuthState: async () => {
        try {
          console.log('UserStore: Synchronizing auth state...');
          
          // Check if user is a guest - skip synchronization for guests
          const isGuest = useUserStore.getState().isGuestUser;
          if (isGuest) {
            console.log('Guest user detected, skipping auth state sync');
            return true;
          }
          
          // Check current state
          const storeUser = useUserStore.getState().user;
          let localStorageUser = null;
          
          try {
            const userStr = localStorage.getItem('user');
            if (userStr) {
              localStorageUser = JSON.parse(userStr);
            }
          } catch (e) {
            console.error('Error parsing localStorage user:', e);
          }
          
          // Get current session from Supabase
          const { data: { session }, error } = await supabase.auth.getSession();
          
          if (error) {
            console.error('Error getting session during sync:', error);
            return false;
          }
          
          // Case 1: We have a valid session - use it as source of truth
          if (session) {
            console.log('Valid session found during sync, updating state');
            
            // Update store and localStorage
            storage.saveUser(session.user);
            set({ user: session.user });
            return true;
          }
          
          // Case 2: No session but we have user data - try to refresh
          if (!session && (storeUser || localStorageUser)) {
            console.log('No session but found user data, attempting refresh');
            
            const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
            
            if (refreshError || !refreshData.session) {
              console.error('Session refresh failed during sync:', refreshError);
              
              // Clear inconsistent state
              storage.clearUser();
              set({ user: null });
              return false;
            }
            
            // Refresh worked, update with refreshed user
            storage.saveUser(refreshData.session.user);
            set({ user: refreshData.session.user });
            return true;
          }
          
          // Case 3: No session and no user data
          console.log('No authentication data found during sync');
          storage.clearUser();
          set({ user: null });
          return false;
        } catch (err) {
          console.error('Error during auth state sync:', err);
          return false;
        }
      },
      
      setUser: (user) => {
        if (user) {
          storage.saveUser(user);
        } else {
          storage.clearUser();
        }
        set({ user });
      },

      toggleDarkMode: () => {
        set((state) => {
          const newDarkMode = !state.darkMode;
          if (newDarkMode) {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
          return { darkMode: newDarkMode };
        });
      },

      updatePreferences: (newPreferences) => {
        set((state) => ({
          preferences: {
            ...state.preferences,
            ...newPreferences,
          }
        }));
      },

      resetPreferences: () => {
        set({
          preferences: {
            defaultView: 'list',
            showCompletedTasks: true,
            enableNotifications: true,
            enableSounds: true,
            emailNotifications: 'important',
            taskSortOrder: 'dueDate',
            defaultPriority: 'medium',
            timeFormat: '12h',
            dateFormat: 'MM/DD/YYYY',
            language: 'en',
            colorTheme: 'blue',
            enableEncryption: false,
            enableTracking: true,
          }
        });
      },

      signOut: async () => {
        try {
          // If it's a guest user, just clear the guest state
          if (useUserStore.getState().isGuestUser) {
            storage.clearUser();
            set({ user: null, isGuestUser: false });
            return;
          }
          
          // Otherwise do the normal sign out
          await supabase.auth.signOut();
          storage.clearUser();
          set({ user: null, isGuestUser: false });
        } catch (error) {
          console.error('Error signing out:', error);
          throw error;
        }
      },
      
      signInAsGuest: () => {
        // Create a guest user object with basic properties
        const guestUser = {
          id: 'guest-' + Date.now(),
          email: 'guest@taskzen.app',
          user_metadata: {
            full_name: 'Guest User',
          },
          app_metadata: {
            provider: 'guest',
            isGuest: true,
          },
          aud: 'guest',
          created_at: new Date().toISOString(),
        };
        
        // Save guest user to store (not to permanent storage)
        set({ user: guestUser, isGuestUser: true });
        
        // Save minimal data to localStorage 
        // but don't use the main storage mechanism to avoid conflicts
        localStorage.setItem('guestUser', JSON.stringify({
          id: guestUser.id,
          isGuest: true
        }));
        
        console.log('User signed in as guest:', guestUser);
      }
    }),
    {
      name: 'user-store',
      // Only persist non-sensitive data
      partialize: (state) => ({
        darkMode: state.darkMode,
        preferences: state.preferences,
        // Don't persist guest user state between sessions
        // This ensures guest mode is temporary
      }),
    }
  )
);