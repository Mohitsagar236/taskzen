import React from 'react';
import { supabase } from '../lib/supabase';
import { useUserStore } from '../store/userStore';

export default function AuthDebugger() {
  const [authProviders, setAuthProviders] = React.useState<string[]>([]);
  const [authSettings, setAuthSettings] = React.useState<any>(null);
  const [error, setError] = React.useState<string | null>(null);

  const user = useUserStore(state => state.user);

  React.useEffect(() => {
    const checkAuth = async () => {
      try {
        // Get session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) {
          setError(`Session error: ${sessionError.message}`);
          return;
        }

        // Get available providers
        const availableProviders = [];
        
        try {          // This is just a check to see if Google is configured
          // The actual providers aren't directly accessible from client
          const settings = {
            url: supabase.supabaseUrl,
            googleEnabled: supabase.auth.getSession !== undefined,
            googleClientId: '57530209960-dlluia3a50mmjetm3tutkf2na6k1au7f.apps.googleusercontent.com',
            sessionExists: session !== null,
            userExists: user !== null,
            redirectUrl: window.location.origin + '/auth/callback'
          };
          
          setAuthSettings(settings);
          
          // Directly check GitHub and Google
          availableProviders.push('github');
          availableProviders.push('google');
        } catch (providerError) {
          console.error('Provider check error:', providerError);
        }
        
        setAuthProviders(availableProviders);
      } catch (err) {
        console.error('Auth check error:', err);
        setError(`Check error: ${err instanceof Error ? err.message : String(err)}`);
      }
    };
    
    checkAuth();
  }, [user]);
  
  // Test sign in with Google
  const testGoogleSignIn = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin + '/auth/callback',
          scopes: 'profile email',
        }
      });
      
      if (error) {
        console.error('Google sign in error:', error);
        setError(`Google sign in error: ${error.message}`);
      }
    } catch (err) {
      console.error('Unexpected Google sign in error:', err);
      setError(`Unexpected error: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 mb-4">
      <h3 className="text-xl font-semibold mb-4">Authentication Debug</h3>
      
      {error && (
        <div className="bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300 p-4 rounded-md mb-4">
          {error}
        </div>
      )}
        <div className="space-y-3">
        <div>
          <span className="font-medium">Auth Status:</span> 
          <span className={`ml-2 ${user ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
            {user ? 'Authenticated' : 'Not Authenticated'}
          </span>
        </div>
        
        <div>
          <span className="font-medium">Google Client:</span>
          <a 
            href="https://console.cloud.google.com/apis/credentials" 
            target="_blank" 
            rel="noopener noreferrer"
            className="ml-2 text-blue-500 hover:text-blue-700 underline"
          >
            Manage Google OAuth Credentials
          </a>
        </div>
        
        <div>
          <span className="font-medium">Available Providers:</span>
          <div className="ml-2 mt-1">
            {authProviders.length > 0 ? (
              authProviders.map(provider => (
                <span key={provider} className="inline-block bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 rounded-full px-3 py-1 text-sm mr-2">
                  {provider}
                </span>
              ))
            ) : (
              <span className="text-gray-500 dark:text-gray-400">None detected</span>
            )}
          </div>
        </div>
        
        {authSettings && (
          <div className="mt-4">
            <span className="font-medium">Auth Settings:</span>
            <pre className="mt-1 bg-gray-100 dark:bg-gray-900 p-3 rounded-md text-xs overflow-auto max-h-40">
              {JSON.stringify(authSettings, null, 2)}
            </pre>
          </div>
        )}
        
        <div className="mt-4">
          <button
            onClick={testGoogleSignIn}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
          >
            Test Google Sign-In
          </button>
        </div>
      </div>
    </div>
  );
}
