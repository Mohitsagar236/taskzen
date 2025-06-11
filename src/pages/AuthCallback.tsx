import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useUserStore } from '../store/userStore';
import toast from 'react-hot-toast';
import { ensureUserIsPersisted } from '../lib/authUtils';

export default function AuthCallback() {
  const navigate = useNavigate();
  const setUser = useUserStore(state => state.setUser);
  const [error, setError] = useState<string | null>(null);
  const [processingAuth, setProcessingAuth] = useState(true);
  useEffect(() => {
    console.log('AuthCallback: Processing authentication callback...');
    console.log('URL:', window.location.href);
    
    // Check for error parameters in the URL
    const params = new URLSearchParams(window.location.search);
    const urlError = params.get('error');
    const urlErrorDescription = params.get('error_description');
    
    if (urlError || urlErrorDescription) {
      console.error('Error in URL parameters:', urlError, urlErrorDescription);
      setError(`Auth error: ${urlErrorDescription || urlError}`);
      setProcessingAuth(false);
      toast.error(`Authentication failed: ${urlErrorDescription || urlError}`);
      setTimeout(() => navigate('/login', { replace: true }), 5000);
      return;
    }
    
    const handleAuthCallback = async () => {
      try {
        console.log('AuthCallback: Processing OAuth redirect...');
        
        // First attempt to exchange the code for a session
        // This is handled automatically by Supabase auth
        console.log('Getting session from Supabase...');
        const { data: authData, error: authError } = await supabase.auth.getSession();
        
        if (authError) {
          console.error('AuthCallback: Error exchanging code for session:', authError);
          setError(`Authentication error: ${authError.message}`);
          setProcessingAuth(false);
          toast.error('Failed to complete authentication');
          setTimeout(() => navigate('/login', { replace: true }), 3000);
          return;
        }
        
        const { session } = authData;
        
        if (session) {
          console.log('AuthCallback: Session found, user authenticated');
          console.log('User provider:', session.user?.app_metadata?.provider);
          
          // Helper function to ensure user is properly set up across the application
          const ensureUserIsSetup = async (user: any) => {
            console.log('Ensuring user is properly set up in all storage locations');
            
            try {
              // 1. First set in localStorage directly (fallback)
              localStorage.setItem('user', JSON.stringify(user));
              
              // 2. Use the store setter function
              setUser(user);
              
              // 3. Double-check our session is valid
              const validateResult = await useUserStore.getState().validateSession();
              console.log('Session validation result:', validateResult);
              
              // 4. Check if user was properly set in store
              const storeUser = useUserStore.getState().user;
              if (!storeUser) {
                console.warn('User not set in store after validation, retrying...');
                setUser(user);
              }
              
              return true;
            } catch (err) {
              console.error('Error ensuring user setup:', err);
              return false;
            }
          };
          
          // Show success message with provider info
          const provider = session.user?.app_metadata?.provider || 'email';
          toast.success(`Authentication successful with ${provider}!`);
          
          // Special message for Google
          if (provider === 'google') {
            toast.success('Google login successful!', { 
              icon: '🎉',
              duration: 4000
            });
            
            // Track successful Google auth
            sessionStorage.setItem('googleAuthSuccess', Date.now().toString());
          }
          
          // Make sure user is fully initialized before redirecting
          console.log('Setting up navigation after successful authentication');
            // Record successful Google auth completion
          const authStartTime = sessionStorage.getItem('googleAuthStart');
          if (authStartTime) {
            const startTime = parseInt(authStartTime);
            const duration = Date.now() - startTime;
            console.log(`Auth completed in ${duration}ms`);
            sessionStorage.setItem('googleAuthSuccess', Date.now().toString());
          }
            // Setup the user and validate the session
          console.log('Setting up user...');
          await ensureUserIsSetup(session.user);
          console.log('User setup complete');
          
          // Ensure the user data is in localStorage
          localStorage.setItem('user', JSON.stringify(session.user));
          
          // CRITICAL: Force a synchronous update to the user store
          setUser(session.user);
          
          // Force a cross-check to make sure everything is consistent
          const currentUser = useUserStore.getState().user;
          console.log('User in store after setup:', currentUser ? 'exists' : 'missing');
          
          if (!currentUser) {
            console.warn('User missing from store after setup, forcing direct update');
            useUserStore.getState().setUser(session.user);
            
            // Check again after direct update
            const recheckUser = useUserStore.getState().user;
            if (!recheckUser) {
              console.error('Critical: User still missing after forced update');
              // Last resort - try a different approach by setting in localStorage and reloading
              localStorage.setItem('sb-recovery-user', JSON.stringify(session.user));
            }
          }
          
          // Set auth cookies to help track the state through page transitions
          document.cookie = `authComplete=true;path=/;max-age=60`;
          document.cookie = `authUserId=${session.user.id};path=/;max-age=60`;
          
          console.log('Auth completed successfully, navigating to home page');
          
          // Clear any previous auth error flags
          sessionStorage.removeItem('authError');
          
          // Add auth success flag
          sessionStorage.setItem('googleAuthComplete', JSON.stringify({
            timestamp: Date.now(),
            userId: session.user.id,
            provider: session.user.app_metadata?.provider || 'unknown'
          }));
            // Do a hard redirect instead of using React Router
          // This ensures a fresh page load with the updated auth state
          
          // Add a final safety check - if we've gotten this far, we should have a valid user
          // in both localStorage and the store. If not, try one more time.
          const finalCheckUser = useUserStore.getState().user;
          const finalCheckLocalStorage = localStorage.getItem('user');
          
          if (!finalCheckUser || !finalCheckLocalStorage) {
            console.warn('Final safety check: User data still inconsistent');
            
            // Make one more attempt to set the user
            if (session && session.user) {
              localStorage.setItem('user', JSON.stringify(session.user));
              useUserStore.getState().setUser(session.user);
            }
          }
          
          // Now redirect with query parameter to signal successful auth
          window.location.href = '/?auth=success';
        } else {
          console.error('AuthCallback: No session found after authentication callback');
          setError('No session was found after authentication. Please check your Supabase configuration.');
          setProcessingAuth(false);
          toast.error('Authentication incomplete. Please try again.');
          setTimeout(() => navigate('/login', { replace: true }), 3000);
        }
      } catch (err) {
        console.error('AuthCallback: Unexpected error during authentication:', err);
        setError(`Unexpected error: ${err instanceof Error ? err.message : 'Unknown error'}`);
        setProcessingAuth(false);
        toast.error('Authentication failed unexpectedly');
        setTimeout(() => navigate('/login', { replace: true }), 3000);
      }
    };

    // Execute the authentication handling
    handleAuthCallback();
  }, [navigate, setUser]);  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-lg w-full bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">Authentication Error</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">{error}</p>
            
            <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg mb-6 text-left">
              <h3 className="font-semibold text-lg mb-2">Troubleshooting Steps:</h3>
              <ol className="list-decimal list-inside space-y-2 text-sm">
                <li>Make sure Google authentication is enabled in your Supabase dashboard</li>
                <li>Verify that the Google OAuth client credentials are configured correctly</li>
                <li>Check that the redirect URLs are properly set up in both Google Cloud Console and Supabase</li>
                <li>Clear browser cookies and cache, then try again</li>
                <li>Check browser console for more specific error messages</li>
              </ol>
              
              <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300 rounded text-xs">
                <strong>Your Client ID:</strong> <code>57530209960-dlluia3a50mmjetm3tutkf2na6k1au7f.apps.googleusercontent.com</code>
              </div>
              
              <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 rounded text-xs">
                <strong>Redirect URL:</strong> <code>{window.location.origin}/auth/callback</code>
              </div>
              
              <div className="mt-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300 rounded text-xs">
                <strong>Need help?</strong> Please refer to the <code>google-auth-setup-guide.md</code> file for detailed configuration instructions.
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row justify-center gap-3">
              <button 
                onClick={() => navigate('/login', { replace: true })}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                Return to Login
              </button>
              <button
                onClick={() => {
                  localStorage.clear();
                  sessionStorage.clear();
                  navigate('/login', { replace: true });
                }}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
              >
                Clear Storage & Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-4">Completing authentication...</h2>
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">Please wait while we verify your credentials.</p>
      </div>
    </div>
  );
}
