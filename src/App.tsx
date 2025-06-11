// filepath: e:\Downloads\to do\TO-do-1\src\App.tsx
import { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useUserStore } from './store/userStore';
import { useTaskStore } from './store/taskStore';
import { useOfflineStore } from './store/offlineStore';
import { useNotificationStore } from './store/notificationStore';
import { supabase } from './lib/supabase';

// Import components
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import { OfflineIndicator } from './components/OfflineIndicator';
import { SubscriptionBanner } from './components/SubscriptionBanner';
import BlankScreenRecovery from './components/BlankScreenRecovery';
import GoogleAuthRecovery from './components/GoogleAuthRecovery';
import AppControlPanel from './components/AppControlPanel';
import GuestBanner from './components/GuestBanner';

// Import pages
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Pricing from './pages/Pricing';
import Settings from './pages/Settings';
import Team from './pages/Team';
import Analytics from './pages/Analytics';
import AuthCallback from './pages/AuthCallback';
// Import the correct `Tasks` component
import Tasks from './pages/Tasks';

// Constants
const LOADING_TIMEOUT = 1000;

export default function App() {
  console.log('App component initializing');
  const [isLoading, setIsLoading] = useState(true);
  const [isStoresReady, setStoresReady] = useState(false);
  const [isFetchingTasks, setIsFetchingTasks] = useState(false);
  
  // Add debug info about render cycle
  const [renderCount, setRenderCount] = useState(0);
  
  // Fixed by adding dependency array to prevent infinite rendering
  useEffect(() => {
    setRenderCount(count => count + 1);
    console.log(`App component rendered (count: ${renderCount})`);
  }, []); // Empty dependency array means this runs only once on mount    // Critical auth session check to prevent blank screen issues
  // This runs as soon as the app loads to ensure auth state is valid
  useEffect(() => {
    const checkAuthSession = async () => {
      try {
        console.log('App.tsx: Checking and validating Supabase session...');
        
        // Check if there are any pending auth operations
        const authInProgress = sessionStorage.getItem('googleAuthStart');
        const authSuccess = sessionStorage.getItem('googleAuthSuccess');
        
        if (authInProgress && !authSuccess) {
          console.log('Detected ongoing auth flow, waiting for completion...');
          // We're in the middle of auth - this could contribute to blank screen
        }
        
        // Check if we're coming from an authentication callback
        const authComplete = document.cookie
          .split('; ')
          .find(row => row.startsWith('authComplete='));
        
        if (authComplete) {
          console.log('Detected return from auth flow, clearing authComplete cookie');
          document.cookie = 'authComplete=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        }
        
        // First try to get session from Supabase
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error checking session:', error);
          // Clear any potentially invalid state
          localStorage.removeItem('user');
          useUserStore.getState().setUser(null);
          return;
        }
        
        if (session) {
          console.log('Valid session found, ID:', session.user.id);
          console.log('Auth provider:', session.user.app_metadata.provider);
          
          const isGoogleAuth = session.user.app_metadata.provider === 'google';
          if (isGoogleAuth) {
            console.log('Google authentication detected');
          }
          
          // Always ensure both store AND localStorage have the user
          useUserStore.getState().setUser(session.user);
          localStorage.setItem('user', JSON.stringify(session.user));
          
          // Double-check user was set correctly in store
          const storeUser = useUserStore.getState().user;
          if (!storeUser) {
            console.warn('User missing from store after setting, retrying...');
            useUserStore.getState().setUser(session.user);
          }
        } else {
          console.log('No active session found');
          
          // Check if we have a user in localStorage but no active session
          const storedUserStr = localStorage.getItem('user');
          if (storedUserStr) {
            try {
              console.warn('User found in localStorage but no active session - auth mismatch');
              
              // Try to refresh the session
              const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
              
              if (refreshError || !refreshData.session) {
                console.log('Session refresh failed, clearing inconsistent user data');
                localStorage.removeItem('user');
                useUserStore.getState().setUser(null);
              } else {
                console.log('Session refreshed successfully');
                useUserStore.getState().setUser(refreshData.session.user);
                localStorage.setItem('user', JSON.stringify(refreshData.session.user));
              }
            } catch (parseError) {
              console.error('Error parsing stored user:', parseError);
              localStorage.removeItem('user');
            }
          }
          
          // Check if we have a guest user
          const guestUserStr = localStorage.getItem('guestUser');
          if (guestUserStr) {
            try {
              const guestUser = JSON.parse(guestUserStr);
              if (guestUser && guestUser.isGuest) {
                console.log('Found guest user, restoring guest session');
                useUserStore.getState().signInAsGuest();
              }
            } catch (parseError) {
              console.error('Error parsing guest user:', parseError);
              localStorage.removeItem('guestUser');
            }
          }
        }
      } catch (err) {
        console.error('Unexpected error checking session:', err);
      }
    };
    
    checkAuthSession();
  }, []);
  
  // Setup online/offline detection
  useEffect(() => {
    const handleOnline = () => {
      try {
        useOfflineStore.getState().setOnlineStatus(true);
      } catch (err) {
        console.error('Error setting online status:', err);
      }
    };
    
    const handleOffline = () => {
      try {
        useOfflineStore.getState().setOnlineStatus(false);
      } catch (err) {
        console.error('Error setting offline status:', err);
      }
    };
    
    // Set initial status
    if (typeof window !== 'undefined') {
      try {
        useOfflineStore.getState().setOnlineStatus(navigator.onLine);
      } catch (err) {
        console.error('Error setting initial online status:', err);
      }
      
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);
    }
    
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      }
    };
  }, []);
    // Use try/catch for safer store access
  let user = null;
  let isOffline = false;
  let darkMode = false;
  let storeError = null;
  let isGuestUser = false;
  
  try {
    user = useUserStore((state) => state.user);
    darkMode = useUserStore((state) => state.darkMode);
    isGuestUser = useUserStore((state) => state.isGuestUser);
    // We don't need setUser functionality here
  } catch (err) {
    console.error('Error accessing userStore:', err);
    storeError = `UserStore error: ${err instanceof Error ? err.message : String(err)}`;
  }
  
  try {
    const onlineState = useOfflineStore((state) => state.isOnline);
    isOffline = !onlineState;
  } catch (err) {
    console.error('Error accessing offlineStore:', err);
    storeError = `OfflineStore error: ${err instanceof Error ? err.message : String(err)}`;
  }
  
  console.log('State values:', { 
    isLoading, 
    isStoresReady, 
    user: user ? 'exists' : 'null',
    isOffline,
    darkMode,
    isGuestUser,
    storeError: storeError ? 'error' : 'none'
  });
    // Handle store rehydration
  useEffect(() => {
    console.log('Starting store rehydration...');
    
    // Also check session on rehydration
    const validateSession = async () => {
      try {
        // Check if we have a current session
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Session validation error in rehydration:', error);
          return;
        }
        
        if (session && session.user) {
          console.log('Valid session found during rehydration, updating user state');
          useUserStore.getState().setUser(session.user);
        }
      } catch (err) {
        console.error('Unexpected error during session validation:', err);
      }
    };
    
    validateSession();
    
    // Safety timeout to prevent infinite loading
    const safetyTimeout = setTimeout(() => {
      console.log('Safety timeout triggered - forcing app to render');
      setStoresReady(true);
      setIsLoading(false);
    }, 5000);
    
    Promise.all([
      useUserStore.persist.rehydrate(),
      useTaskStore.persist.rehydrate(),
      useOfflineStore.persist.rehydrate()
    ]).then(() => {
      console.log('Store rehydration successful.');
      setStoresReady(true);
      // Only stop loading after a minimum time to prevent flash
      setTimeout(() => {
        console.log('Loading complete.');
        setIsLoading(false);
        clearTimeout(safetyTimeout);
      }, LOADING_TIMEOUT);
    }).catch((error) => {
      console.error('Store rehydration failed:', error);
      setIsLoading(false);
      setStoresReady(true); // Force ready even on error
      clearTimeout(safetyTimeout);
    });
    
    return () => clearTimeout(safetyTimeout);
  }, []);

  // Update dark mode class on body
  useEffect(() => {
    console.log('Dark mode:', darkMode);
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);  // Fetch all application data for all sections after stores are ready
  useEffect(() => {
    console.log('User state:', user ? 'exists' : 'null');
    console.log('Stores ready:', isStoresReady);
    
    if (user && isStoresReady && !isFetchingTasks) {
      console.log('Fetching application data for user:', user.id);
      
      // Set flag to prevent multiple fetches
      setIsFetchingTasks(true);
      
      // Skip certain operations for guest users
      if (!isGuestUser) {
        // Initialize notifications first
        useNotificationStore.getState().fetchNotifications()
          .then(() => {
            console.log('Notifications fetched, setting up real-time subscription');
            useNotificationStore.getState().subscribeToNotifications();
          })
          .catch(err => {
            console.error('Error initializing notifications:', err);
          });
      }
      
      // Import and use the helper function to load all data at once
      import('./lib/fixDataDisplayErrors')
        .then(({ loadAllApplicationData }) => {
          return loadAllApplicationData();
        })
        .then((result) => {
          console.log('Application data loaded:', result.success ? 'successfully' : 'with errors');
          
          // Get diagnostic info
          import('./lib/fixDataDisplayErrors').then(({ diagnoseStoreData }) => {
            const diagnostics = diagnoseStoreData();
            console.log('Store diagnostics:', diagnostics);
          });
        })
        .catch(err => {
          console.error('Error loading application data:', err);
        })
        .finally(() => {
          setIsFetchingTasks(false);
        });
    }
    
    // Cleanup function to unsubscribe from notifications when component unmounts
    return () => {
      if (user && !isGuestUser) {
        useNotificationStore.getState().unsubscribeFromNotifications();
      }
    };
  }, [user, isStoresReady, isFetchingTasks, isGuestUser]);// Add isFetchingTasks to prevent duplicate calls

  // Insert auth transition hooks here to ensure consistent hook order
  const [isAuthTransition, setIsAuthTransition] = useState(false);

  // Setup auth transition monitoring
  useEffect(() => {
    import('./lib/authFix')
      .then(({ setupAuthMonitoring, fixAuthState }) => {
        const cleanup = setupAuthMonitoring();
        fixAuthState();
        return cleanup;
      })
      .catch(console.error);
  }, []);

  // Periodic auth state synchronization
  useEffect(() => {
    const initialSync = setTimeout(() => {
      useUserStore.getState().synchronizeAuthState();
    }, 3000);
    const intervalId = setInterval(() => {
      const currentUser = useUserStore.getState().user;
      const hasLocalStorageUser = !!localStorage.getItem('user');
      if (!!currentUser !== hasLocalStorageUser) {
        useUserStore.getState().synchronizeAuthState();
      }
    }, 10000);
    return () => { clearTimeout(initialSync); clearInterval(intervalId); };
  }, []);

  // Enhanced listener for Supabase auth state changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        setIsAuthTransition(true);
        useUserStore.getState().setUser(session.user);
        localStorage.setItem('user', JSON.stringify(session.user));
        import('./lib/authFix').then(({ fixAuthState }) => {
          fixAuthState().then(() => setTimeout(() => setIsAuthTransition(false), 2000));
        }).catch(console.error);
      } else if (event === 'SIGNED_OUT') {
        useUserStore.getState().setUser(null);
        localStorage.removeItem('user');
      } else if (event === 'TOKEN_REFRESHED' && session?.user) {
        useUserStore.getState().setUser(session.user);
        localStorage.setItem('user', JSON.stringify(session.user));
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  if (isLoading || !isStoresReady) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-gray-600 dark:text-gray-300">Loading application...</p>
      </div>
    );
  }
  
  // Show any store initialization errors
  if (storeError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
        <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-xl max-w-2xl w-full">
          <h1 className="text-2xl font-bold text-red-700 dark:text-red-400 mb-4">Application Error</h1>
          <p className="text-red-600 dark:text-red-300 mb-4">{storeError}</p>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-xl mb-6">
            <h2 className="font-bold mb-2">Troubleshooting Steps:</h2>
            <ol className="list-decimal pl-5 space-y-2">
              <li>Check browser console for error details</li>
              <li>Clear your browser storage and reload</li>
              <li>Verify network connection is stable</li>
            </ol>
          </div>
          <div className="flex space-x-4">
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Reload Page
            </button>
            <button
              onClick={() => {
                localStorage.clear(); 
                sessionStorage.clear();
                window.location.reload();
              }}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
            >
              Clear Storage & Reload
            </button>
          </div>
        </div>
      </div>
    );
  }  return (    
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {!isOffline && <OfflineIndicator />}
      <BlankScreenRecovery />
      <GoogleAuthRecovery />
      <AppControlPanel />
      <Toaster
        position="top-right"
        toastOptions={{
          className: 'dark:bg-gray-800 dark:text-white',
          duration: 3000,
        }}
      />
        {isAuthTransition ? (
        <div className="min-h-screen flex flex-col items-center justify-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300 mb-2">Finalizing authentication...</p>
          
          <div className="mt-8 max-w-md">
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-4">
              If you're stuck on this screen for more than a few seconds, try these options:
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center mt-4">
              <button 
                onClick={async () => {
                  try {
                    // Force session validation
                    const isValid = await useUserStore.getState().validateSession();
                    if (isValid) {
                      window.location.href = '/';
                    } else {
                      window.location.href = '/login';
                    }
                  } catch (e) {
                    window.location.href = '/login';
                  }
                }}
                className="px-4 py-2 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors"
              >
                Continue to App
              </button>
              
              <button
                onClick={() => {
                  localStorage.clear();
                  sessionStorage.clear();
                  window.location.href = '/login';
                }}
                className="px-4 py-2 bg-gray-500 text-white text-sm rounded hover:bg-gray-600 transition-colors"
              >
                Return to Login
              </button>
            </div>
          </div>
        </div>
      ) : user ? (
        <div className="flex h-screen overflow-hidden">
          <Sidebar />
          <div className="flex-1 flex flex-col overflow-hidden">
            <Header />
            {isGuestUser && <GuestBanner />}
            <main className="flex-1 overflow-auto">              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/tasks" element={<Tasks />} />
                <Route path="/team" element={<Team />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/pricing" element={<Pricing />} />
                <Route path="*" element={<Dashboard />} />
              </Routes>
              <SubscriptionBanner />
            </main>
          </div>
        </div>      ) : (
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="*" element={<Login />} />
        </Routes>
      )}
    </div>
  );
}
