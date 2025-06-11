import { useState } from 'react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

interface GoogleButtonProps {
  redirectTo?: string;
}

export default function GoogleButton({ redirectTo }: GoogleButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Clear any previous authentication data to prevent conflicts
      try {
        console.log('Clearing any existing authentication data');
        
        // Clear localStorage auth data
        localStorage.removeItem('user');
        
        // Clear session storage data that might interfere
        sessionStorage.removeItem('supabase.auth.token');
        sessionStorage.removeItem('googleAuthStart');
        sessionStorage.removeItem('googleAuthSuccess');
        
        // Track the start of auth flow
        sessionStorage.setItem('googleAuthStart', Date.now().toString());
      } catch (clearErr) {
        console.error('Error clearing auth data:', clearErr);
      }
      
      // Use the configured Google client ID
      const clientId = '57530209960-dlluia3a50mmjetm3tutkf2na6k1au7f.apps.googleusercontent.com';
      console.log('Using Google client ID:', clientId);
      console.log('Redirect URL:', redirectTo || `${window.location.origin}/auth/callback`);
      
      // First check Supabase configuration
      console.log('Checking Supabase configuration...');
      
      try {
        const { data: { session } } = await supabase.auth.getSession();
        console.log('Current session:', session ? 'exists' : 'none');
      } catch (sessionErr) {
        console.error('Error checking session:', sessionErr);
      }
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectTo || `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent'
          }
        }
      });
      
      if (error) {
        console.error('Google login error:', error);
        console.error('Error details:', JSON.stringify(error, null, 2));
        setError(`${error.message} (${error.status || 'unknown status'})`);
        toast.error(`Google login failed: ${error.message}`, { duration: 5000 });
      } else {
        console.log('Google login initiated:', data);
        
        // Enhanced redirect handling with better logging and fallbacks
        if (data?.url) {
          console.log('Redirect URL provided by Supabase:', data.url);
          toast.success('Redirecting to Google authentication...', { duration: 3000 });
          
          try {
            // First clear any existing auth data to prevent conflicts
            localStorage.removeItem('user');
            
            // Also clear any other auth-related data that might interfere
            sessionStorage.removeItem('supabase.auth.token');
            sessionStorage.removeItem('googleAuthSuccess');
            
            // Track that we're starting Google auth to help with debugging
            const timestamp = Date.now().toString();
            sessionStorage.setItem('googleAuthStart', timestamp);
            console.log('Setting auth start timestamp:', timestamp);
            
            // Set a cookie to track auth flow across page loads
            document.cookie = `googleAuthInProgress=true;path=/;max-age=300`; // 5 minutes max
            
            // CRITICAL: Use direct window.location.href assignment rather than setTimeout
            // This ensures the redirect happens immediately without any race conditions
            console.log('Performing immediate redirect to:', data.url);
            window.location.href = data.url;
          } catch (redirectErr) {
            console.error('Error during redirect:', redirectErr);
            toast.error('Redirect failed. Please try again.');
          }
        } else {
          console.warn('No redirect URL provided by Supabase');
          toast.error('Authentication failed: No redirect URL provided', { 
            icon: '⚠️',
            duration: 4000 
          });
          
          // Fallback - try to navigate directly to Google OAuth
          try {
            // Use a safe way to construct the fallback URL without accessing protected properties
            const fallbackUrl = new URL('/auth/v1/authorize', window.location.origin);
            fallbackUrl.searchParams.append('provider', 'google');
            
            console.log('Attempting fallback authentication URL:', fallbackUrl.toString());
            toast('Attempting alternative authentication method...', { duration: 3000 });
            setTimeout(() => {
              window.location.href = fallbackUrl.toString();
            }, 1000);
          } catch (fallbackErr) {
            console.error('Fallback redirect failed:', fallbackErr);
          }
        }
      }
    } catch (err) {
      console.error('Unexpected error during Google login:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      toast.error(`Login error: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <button
        onClick={handleGoogleSignIn}
        disabled={loading}
        className="w-full flex items-center justify-center gap-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md py-2 px-4 text-gray-800 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 relative"
      >
        {loading ? (
          <span className="w-5 h-5 border-2 border-t-transparent border-blue-500 rounded-full animate-spin"></span>
        ) : (
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
        )}
        <span>{loading ? 'Connecting...' : 'Continue with Google'}</span>
      </button>

      {error && (
        <div className="mt-2 text-sm text-red-600 dark:text-red-400">
          {error}
        </div>
      )}
    </div>
  );
}
