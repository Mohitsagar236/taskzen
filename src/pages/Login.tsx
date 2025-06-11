import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '../lib/supabase';
import { useUserStore } from '../store/userStore';
import toast from 'react-hot-toast';
import { AuthChangeEvent } from '@supabase/supabase-js';
import AuthDebugger from '../components/AuthDebugger';
import GoogleButton from '../components/GoogleButton';

export default function Login() {
  const navigate = useNavigate();
  const { user, setUser, signInAsGuest } = useUserStore();
  const [authError, setAuthError] = React.useState<string | null>(null);
  const [showDebugger, setShowDebugger] = React.useState<boolean>(false);

  // Redirect if already logged in
  React.useEffect(() => {
    if (user) {
      navigate('/', { replace: true });
    }
  }, [user, navigate]);
  // Check initial session with better error handling
  React.useEffect(() => {
    console.log('Checking initial session...');
    
    // Check for any URL parameters related to auth errors
    const queryParams = new URLSearchParams(window.location.search);
    const error = queryParams.get('error');
    const errorDescription = queryParams.get('error_description');
    
    if (error || errorDescription) {
      console.error('Auth error from URL parameters:', error, errorDescription);
      setAuthError(`Authentication error: ${errorDescription || error}`);
    }
    
    supabase.auth.getSession()
      .then(({ data: { session }, error }) => {
        if (error) {
          console.error('Session retrieval error:', error);
          setAuthError(`Failed to retrieve session: ${error.message}`);
          return;
        }
        
        console.log('Session check result:', session ? 'Session found' : 'No session');
        
        if (session?.user) {
          console.log('User found in session:', session.user);
          console.log('User provider:', session.user.app_metadata?.provider);
          setUser(session.user);
          navigate('/', { replace: true });
        }
      })
      .catch(err => {
        console.error('Unexpected error during session check:', err);
        setAuthError(`Unexpected error: ${err instanceof Error ? err.message : String(err)}`);
      });
  }, [navigate, setUser]);
    // Handle auth state changes with improved logging
  React.useEffect(() => {
    console.log('Setting up auth state change listener...');
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event: AuthChangeEvent, session) => {
      console.log('Auth state change detected:', event, session ? 'session exists' : 'no session');
      
      if (event === 'SIGNED_IN' as AuthChangeEvent) {
        console.log('Sign in event received, user data:', session?.user);
        setUser(session?.user ?? null);
        
        // Get the provider that was used to sign in
        const provider = session?.user?.app_metadata?.provider;
        console.log('User signed in with provider:', provider);
        
        // Report success with provider info
        toast.success(`Logged in successfully with ${provider || 'email'}!`);
        
        // If the user signed in with Google, create a success toast
        if (provider === 'google') {
          toast.success('Google authentication successful!', { 
            icon: '🎉',
            duration: 4000
          });
        }
        
        navigate('/', { replace: true });
      } else if (event === 'SIGNED_OUT' as AuthChangeEvent) {
        console.log('Sign out event received');
        setUser(null);
        navigate('/login', { replace: true });
      } else if (event === 'SIGNED_UP' as AuthChangeEvent) {
        console.log('Sign up event received');
        if (session?.user?.identities?.[0]?.provider === 'email') {
          toast.success(
            'Please check your email for the verification link. Check your spam folder if you don\'t see it!',
            { duration: 6000 }
          );
        }
      } else if (event === 'USER_UPDATED' as AuthChangeEvent) {
        console.log('User updated event received');
        if (session?.user) {
          setUser(session.user);
        }
      } else if (event === 'TOKEN_REFRESHED' as AuthChangeEvent) {
        console.log('Token refreshed event received');
      }
    });

    return () => {
      console.log('Unsubscribing from auth state changes');
      subscription.unsubscribe();
    };
  }, [navigate, setUser]);

  // Test Supabase connection
  React.useEffect(() => {
    console.log('Testing Supabase connection...');
    supabase.from('tasks').select('count', { count: 'exact', head: true })
      .then(({ error }) => {
        if (error) {
          console.error('Supabase connection test failed:', error);
          setAuthError(`Database connection error: ${error.message}`);
        } else {
          console.log('Supabase connection test successful');
        }
      });
  }, []);

  // Handle guest login
  const handleGuestLogin = () => {
    // Sign in as guest
    signInAsGuest();
    toast.success('Welcome! You are now using TaskZen as a guest.', {
      icon: '👋',
      duration: 4000
    });
    navigate('/', { replace: true });
  };

  return (
    <div className="min-h-full flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            Sign in to TaskMaster
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Choose your preferred sign-in method
          </p>
        </div>
          {authError && (
          <div className="bg-red-50 dark:bg-red-900/30 p-4 rounded-md">
            <p className="text-sm text-red-700 dark:text-red-300">{authError}</p>
            <button 
              className="mt-2 text-xs text-red-600 dark:text-red-400 underline"
              onClick={() => window.location.reload()}
            >
              Reload page
            </button>
          </div>
        )}
        
        {/* Guest Access Button */}
        <div className="mb-4">
          <button
            onClick={handleGuestLogin}
            className="group w-full py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors flex items-center justify-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
            Continue as Guest
          </button>
          <p className="mt-2 text-xs text-center text-gray-500 dark:text-gray-400">
            Try TaskZen without creating an account. Your data won't be saved between sessions.
          </p>
        </div>
          <div className="mb-4">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 text-center">
            Sign in with Google:
          </p>
          <GoogleButton redirectTo={`${window.location.origin}/auth/callback`} />
        </div>
          <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300 dark:border-gray-700"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">Or sign in with GitHub or Email</span>
          </div>
        </div>
        
        <Auth
          supabaseClient={supabase}
          appearance={{ 
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: '#2563eb',
                  brandAccent: '#1d4ed8',
                  messageText: '#1f2937',
                  messageTextDanger: '#991b1b',
                  inputBorder: '#e5e7eb',
                  inputBorderFocus: '#2563eb',
                  inputBorderHover: '#94a3b8'
                },
                borderWidths: {
                  buttonBorderWidth: '1px',
                  inputBorderWidth: '1px'
                },
                radii: {
                  borderRadiusButton: '0.375rem',
                  buttonBorderRadius: '0.375rem',
                  inputBorderRadius: '0.375rem'
                }
              }
            },
            style: {
              container: { gap: '1rem' },
              button: { 
                height: '2.75rem',
                borderRadius: '0.375rem',
                textTransform: 'none',
                fontSize: '0.875rem',
                fontWeight: '500'
              },
              divider: { margin: '1.5rem 0' },
              input: { backgroundColor: 'transparent' },
              message: { padding: '0.75rem' }            }
          }}          
          providers={['github']} 
          providerScopes={{
            github: 'read:user user:email'
          }}
          onlyThirdPartyProviders={false}
          theme={useUserStore.getState().darkMode ? 'dark' : 'light'}
          redirectTo={`${window.location.origin}/auth/callback`}
          magicLink={false}
          localization={{
            variables: {
              sign_up: {
                email_label: 'Email address',
                password_label: 'Create a Password',
                button_label: 'Sign up',
                loading_button_label: 'Signing up ...',
                social_provider_text: 'Continue with {{provider}}',
                confirmation_text: 'Check your email for the confirmation link'
              },
              sign_in: {
                email_label: 'Email address',
                password_label: 'Your password',
                button_label: 'Sign in',
                loading_button_label: 'Signing in ...',
                social_provider_text: 'Continue with {{provider}}'
              }
            }
          }}
        />
          <div className="mt-4 text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
            Having trouble signing in? Please make sure cookies are enabled in your browser.
          </p>
          <button
            onClick={() => setShowDebugger(!showDebugger)}
            className="text-xs text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 underline"
          >
            {showDebugger ? 'Hide' : 'Show'} Authentication Troubleshooter
          </button>
        </div>
        
        {showDebugger && <AuthDebugger />}
      </div>
    </div>
  );
}