 Download the React DevTools for a better development experience: https://reactjs.org/link/react-devtools
 [DEPRECATED] Default export is deprecated. Instead use `import { create } from 'zustand'`.
react @ zustand.js?v=a324e09a:161
 Multiple GoTrueClient instances detected in the same browser context. It is not an error, but this should be avoided as it may produce undefined behavior when used concurrently under the same storage key.
_GoTrueClient @ @supabase_supabase-js.js?v=a324e09a:5040
 [DEPRECATED] Default export is deprecated. Instead use `import { create } from 'zustand'`.
react @ zustand.js?v=a324e09a:161
 Application initializing...
 localStorage state: Object
 App component initializing
 State values: Object
 App component initializing
 State values: Object
 App component rendered (count: 0)
 App.tsx: Checking and validating Supabase session...
 Starting store rehydration...
 Dark mode: false
 User state: exists
 Stores ready: false
 ⚠️ React Router Future Flag Warning: React Router will begin wrapping state updates in `React.startTransition` in v7. You can use the `v7_startTransition` future flag to opt-in early. For more information, see https://reactrouter.com/v6/upgrading/future#v7_starttransition.
warnOnce @ react-router-dom.js?v=a324e09a:4394
 ⚠️ React Router Future Flag Warning: Relative route resolution within Splat routes is changing in v7. You can use the `v7_relativeSplatPath` future flag to opt-in early. For more information, see https://reactrouter.com/v6/upgrading/future#v7_relativesplatpath.
warnOnce @ react-router-dom.js?v=a324e09a:4394
 App component rendered (count: 0)
 App.tsx: Checking and validating Supabase session...
 Starting store rehydration...
 Dark mode: false
App.tsx:272 User state: exists
App.tsx:273 Stores ready: false
App.tsx:36 App component initializing
App.tsx:199 State values: Object
App.tsx:36 App component initializing
App.tsx:199 State values: Object
App.tsx:272 User state: exists
App.tsx:273 Stores ready: false
App.tsx:244 Store rehydration successful.
App.tsx:244 Store rehydration successful.
App.tsx:36 App component initializing
App.tsx:199 State values: Object
App.tsx:36 App component initializing
App.tsx:199 State values: Object
App.tsx:272 User state: exists
App.tsx:273 Stores ready: true
App.tsx:276 Fetching application data for user: 4327fc88-c5e1-44dc-ba50-b9b723ca82c8
App.tsx:36 App component initializing
App.tsx:199 State values: Object
App.tsx:36 App component initializing
App.tsx:199 State values: Object
App.tsx:272 User state: exists
App.tsx:273 Stores ready: true
App.tsx:248 Loading complete.
App.tsx:248 Loading complete.
App.tsx:36 App component initializing
App.tsx:199 State values: Object
chunk-6W5FFVKH.js?v=a324e09a:521 Warning: React has detected a change in the order of Hooks called by App. This will lead to bugs and errors if not fixed. For more information, read the Rules of Hooks: https://reactjs.org/link/rules-of-hooks

   Previous render            Next render
   ------------------------------------------------------
1. useState                   useState
2. useState                   useState
3. useState                   useState
4. useState                   useState
5. useEffect                  useEffect
6. useEffect                  useEffect
7. useEffect                  useEffect
8. useRef                     useRef
9. useMemo                    useMemo
10. useSyncExternalStore      useSyncExternalStore
11. useEffect                 useEffect
12. useDebugValue             useDebugValue
13. useDebugValue             useDebugValue
14. useRef                    useRef
15. useMemo                   useMemo
16. useSyncExternalStore      useSyncExternalStore
17. useEffect                 useEffect
18. useDebugValue             useDebugValue
19. useDebugValue             useDebugValue
20. useRef                    useRef
21. useMemo                   useMemo
22. useSyncExternalStore      useSyncExternalStore
23. useEffect                 useEffect
24. useDebugValue             useDebugValue
25. useDebugValue             useDebugValue
26. useEffect                 useEffect
27. useEffect                 useEffect
28. useEffect                 useEffect
29. undefined                 useState
   ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

    at App (http://localhost:5173/src/App.tsx:46:37)
    at Router (http://localhost:5173/node_modules/.vite/deps/react-router-dom.js?v=a324e09a:4502:15)
    at BrowserRouter (http://localhost:5173/node_modules/.vite/deps/react-router-dom.js?v=a324e09a:5248:5)
printWarning @ chunk-6W5FFVKH.js?v=a324e09a:521
App.tsx:36 App component initializing
App.tsx:199 State values: Object
main.tsx:10 Global error caught in main.tsx: Error: Rendered more hooks than during the previous render.
    at updateWorkInProgressHook (chunk-6W5FFVKH.js?v=a324e09a:11678:21)
    at updateReducer (chunk-6W5FFVKH.js?v=a324e09a:11727:22)
    at updateState (chunk-6W5FFVKH.js?v=a324e09a:12021:18)
    at Object.useState (chunk-6W5FFVKH.js?v=a324e09a:12753:24)
    at useState (chunk-NKBGLYTV.js?v=a324e09a:1066:29)
    at App (App.tsx:367:51)
    at renderWithHooks (chunk-6W5FFVKH.js?v=a324e09a:11548:26)
    at updateFunctionComponent (chunk-6W5FFVKH.js?v=a324e09a:14582:28)
    at beginWork (chunk-6W5FFVKH.js?v=a324e09a:15924:22)
    at HTMLUnknownElement.callCallback2 (chunk-6W5FFVKH.js?v=a324e09a:3674:22)
(anonymous) @ main.tsx:10
chunk-6W5FFVKH.js?v=a324e09a:11678 Uncaught Error: Rendered more hooks than during the previous render.
    at updateWorkInProgressHook (chunk-6W5FFVKH.js?v=a324e09a:11678:21)
    at updateReducer (chunk-6W5FFVKH.js?v=a324e09a:11727:22)
    at updateState (chunk-6W5FFVKH.js?v=a324e09a:12021:18)
    at Object.useState (chunk-6W5FFVKH.js?v=a324e09a:12753:24)
    at useState (chunk-NKBGLYTV.js?v=a324e09a:1066:29)
    at App (App.tsx:367:51)
    at renderWithHooks (chunk-6W5FFVKH.js?v=a324e09a:11548:26)
    at updateFunctionComponent (chunk-6W5FFVKH.js?v=a324e09a:14582:28)
    at beginWork (chunk-6W5FFVKH.js?v=a324e09a:15924:22)
    at HTMLUnknownElement.callCallback2 (chunk-6W5FFVKH.js?v=a324e09a:3674:22)
App.tsx:36 App component initializing
App.tsx:199 State values: Object
App.tsx:36 App component initializing
App.tsx:199 State values: Object
main.tsx:10 Global error caught in main.tsx: Error: Rendered more hooks than during the previous render.
    at updateWorkInProgressHook (chunk-6W5FFVKH.js?v=a324e09a:11678:21)
    at updateReducer (chunk-6W5FFVKH.js?v=a324e09a:11727:22)
    at updateState (chunk-6W5FFVKH.js?v=a324e09a:12021:18)
    at Object.useState (chunk-6W5FFVKH.js?v=a324e09a:12753:24)
    at useState (chunk-NKBGLYTV.js?v=a324e09a:1066:29)
    at App (App.tsx:367:51)
    at renderWithHooks (chunk-6W5FFVKH.js?v=a324e09a:11548:26)
    at updateFunctionComponent (chunk-6W5FFVKH.js?v=a324e09a:14582:28)
    at beginWork (chunk-6W5FFVKH.js?v=a324e09a:15924:22)
    at HTMLUnknownElement.callCallback2 (chunk-6W5FFVKH.js?v=a324e09a:3674:22)
(anonymous) @ main.tsx:10
chunk-6W5FFVKH.js?v=a324e09a:11678 Uncaught Error: Rendered more hooks than during the previous render.
    at updateWorkInProgressHook (chunk-6W5FFVKH.js?v=a324e09a:11678:21)
    at updateReducer (chunk-6W5FFVKH.js?v=a324e09a:11727:22)
    at updateState (chunk-6W5FFVKH.js?v=a324e09a:12021:18)
    at Object.useState (chunk-6W5FFVKH.js?v=a324e09a:12753:24)
    at useState (chunk-NKBGLYTV.js?v=a324e09a:1066:29)
    at App (App.tsx:367:51)
    at renderWithHooks (chunk-6W5FFVKH.js?v=a324e09a:11548:26)
    at updateFunctionComponent (chunk-6W5FFVKH.js?v=a324e09a:14582:28)
    at beginWork (chunk-6W5FFVKH.js?v=a324e09a:15924:22)
    at HTMLUnknownElement.callCallback2 (chunk-6W5FFVKH.js?v=a324e09a:3674:22)
chunk-6W5FFVKH.js?v=a324e09a:14032 The above error occurred in the <App> component:

    at App (http://localhost:5173/src/App.tsx:46:37)
    at Router (http://localhost:5173/node_modules/.vite/deps/react-router-dom.js?v=a324e09a:4502:15)
    at BrowserRouter (http://localhost:5173/node_modules/.vite/deps/react-router-dom.js?v=a324e09a:5248:5)

Consider adding an error boundary to your tree to customize error handling behavior.
Visit https://reactjs.org/link/error-boundaries to learn more about error boundaries.
logCapturedError @ chunk-6W5FFVKH.js?v=a324e09a:14032
main.tsx:10 Global error caught in main.tsx: Error: Rendered more hooks than during the previous render.
    at updateWorkInProgressHook (chunk-6W5FFVKH.js?v=a324e09a:11678:21)
    at updateReducer (chunk-6W5FFVKH.js?v=a324e09a:11727:22)
    at updateState (chunk-6W5FFVKH.js?v=a324e09a:12021:18)
    at Object.useState (chunk-6W5FFVKH.js?v=a324e09a:12753:24)
    at useState (chunk-NKBGLYTV.js?v=a324e09a:1066:29)
    at App (App.tsx:367:51)
    at renderWithHooks (chunk-6W5FFVKH.js?v=a324e09a:11548:26)
    at updateFunctionComponent (chunk-6W5FFVKH.js?v=a324e09a:14582:28)
    at beginWork (chunk-6W5FFVKH.js?v=a324e09a:15924:22)
    at beginWork$1 (chunk-6W5FFVKH.js?v=a324e09a:19753:22)
(anonymous) @ main.tsx:10
chunk-6W5FFVKH.js?v=a324e09a:19413 Uncaught Error: Rendered more hooks than during the previous render.
    at updateWorkInProgressHook (chunk-6W5FFVKH.js?v=a324e09a:11678:21)
    at updateReducer (chunk-6W5FFVKH.js?v=a324e09a:11727:22)
    at updateState (chunk-6W5FFVKH.js?v=a324e09a:12021:18)
    at Object.useState (chunk-6W5FFVKH.js?v=a324e09a:12753:24)
    at useState (chunk-NKBGLYTV.js?v=a324e09a:1066:29)
    at App (App.tsx:367:51)
    at renderWithHooks (chunk-6W5FFVKH.js?v=a324e09a:11548:26)
    at updateFunctionComponent (chunk-6W5FFVKH.js?v=a324e09a:14582:28)
    at beginWork (chunk-6W5FFVKH.js?v=a324e09a:15924:22)
    at beginWork$1 (chunk-6W5FFVKH.js?v=a324e09a:19753:22)
userStore.ts:39 UserStore: Validating session...
App.tsx:86 Valid session found, ID: 4327fc88-c5e1-44dc-ba50-b9b723ca82c8
App.tsx:87 Auth provider: email
localhost/:1 Unchecked runtime.lastError: Could not establish connection. Receiving end does not exist.
App.tsx:222 Valid session found during rehydration, updating user state
multi-tabs.js:3616 Injected CSS loaded successfully
App.tsx:86 Valid session found, ID: 4327fc88-c5e1-44dc-ba50-b9b723ca82c8
App.tsx:87 Auth provider: email
App.tsx:222 Valid session found during rehydration, updating user state
userStore.ts:80 Valid session found for user: 4327fc88-c5e1-44dc-ba50-b9b723ca82c8
hvvmfadfxwighfoebyjr.supabase.co/rest/v1/tasks?select=*%2Cteam_member_users%21tasks_team_id_fkey%28team_id%2Crole%29&or=%28created_by.eq.4327fc88-c5e1-44dc-ba50-b9b723ca82c8%2Cassigned_to.eq.4327fc88-c5e1-44dc-ba50-b9b723ca82c8%2Cteam_id.not.is.null%29:1 
            
            
           Failed to load resource: the server responded with a status of 400 ()
taskStore.fixed.ts:72 Supabase query error: Object
fetchTasks @ taskStore.fixed.ts:72
taskStore.fixed.ts:125 Error fetching tasks: Object
fetchTasks @ taskStore.fixed.ts:125
hvvmfadfxwighfoebyjr.supabase.co/rest/v1/teams?select=*%2Cteam_members%28id%2Cuser_id%2Crole%2Cjoined_at%2Cteam_member_users%21team_members_user_id_fkey%21inner%28id%2Cemail%2Cname%2Cavatar_url%29%29&order=created_at.desc:1 
            
            
           Failed to load resource: the server responded with a status of 500 ()
hvvmfadfxwighfoebyjr.supabase.co/rest/v1/notifications?select=*&user_id=eq.4327fc88-c5e1-44dc-ba50-b9b723ca82c8&order=created_at.desc:1 
            
            
           Failed to load resource: the server responded with a status of 404 ()
teamStore.fixed.ts:133 Error fetching teams: Object
fetchTeams @ teamStore.fixed.ts:133
notificationStore.ts:129 Error fetching notifications: Object
fetchNotifications @ notificationStore.ts:129
App.tsx:284 Notifications fetched, setting up real-time subscription
App.tsx:288 Error initializing notifications: TypeError: Converting circular structure to JSON
    --> starting at object with constructor '_RealtimeChannel'
    |     property 'socket' -> object with constructor 'RealtimeClient'
    |     property 'channels' -> object with constructor 'Array'
    --- index 0 closes the circle
    at JSON.stringify (<anonymous>)
    at Object.setItem (zustand_middleware.js?v=a324e09a:271:12)
    at setItem (zustand_middleware.js?v=a324e09a:466:20)
    at zustand_middleware.js?v=a324e09a:479:12
    at Object.subscribeToNotifications (notificationStore.ts:187:9)
    at App.tsx:285:43
(anonymous) @ App.tsx:288
hvvmfadfxwighfoebyjr.supabase.co/rest/v1/user_progress_with_users?select=*&user_id=eq.4327fc88-c5e1-44dc-ba50-b9b723ca82c8:1 
            
            
           Failed to load resource: the server responded with a status of 406 ()
App.tsx:297 Application data loaded: successfully
App.tsx:302 Store diagnostics: Object
import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import SafeDashboard from './pages/SafeDashboard';
import RecoveryRedirect from './pages/RecoveryRedirect';
import { Toaster } from 'react-hot-toast';
import { clearAllStores, clearStore } from './lib/clearStores';

export default function TransitionApp() {
  // If the user wants the original app, redirect immediately
  useEffect(() => {
    if (localStorage.getItem('useOriginalApp') === 'true') {
      window.location.href = '/';
    }
  }, []);

  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  
  useEffect(() => {
    console.log('TransitionApp mounting');
    // Simple loading simulation
    const timer = setTimeout(() => {
      console.log('Loading complete in TransitionApp');
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column' }}>
        <h1>Loading TransitionApp...</h1>
        <div style={{ width: '50px', height: '50px', border: '5px solid #e0e0e0', borderTopColor: '#3498db', borderRadius: '50%' }}></div>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
          div {
            animation: spin 1s linear infinite;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      <Toaster position="top-right" />
      
      <div style={{ 
        backgroundColor: '#2c3e50', 
        color: 'white', 
        padding: '15px', 
        borderRadius: '5px', 
        marginBottom: '20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h1 style={{ margin: 0 }}>TaskZen Debug Mode</h1>
        <nav>
          <Link to="/" style={{ color: 'white', marginRight: '15px', textDecoration: 'none' }}>Home</Link>
          <Link to="/safe-dashboard" style={{ color: 'white', marginRight: '15px', textDecoration: 'none' }}>Safe Dashboard</Link>
          <Link to="/try-original" style={{ color: 'white', textDecoration: 'none' }}>Try Original App</Link>
        </nav>
      </div>      <Routes>
        <Route path="/safe-dashboard" element={<SafeDashboard />} />
        <Route path="/recovery" element={<RecoveryRedirect />} />
        <Route path="/try-original" element={
          <div style={{ padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '5px' }}>
            <h2>Attempting to load original app...</h2>
            <p>If this doesn't work, you'll be redirected back here.</p>
            <button 
              onClick={() => {
                window.localStorage.setItem('useOriginalApp', 'true');
                window.location.href = '/';
              }}
              style={{
                backgroundColor: '#e74c3c',
                border: 'none',
                color: 'white',
                padding: '10px 15px',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Load Original App
            </button>
          </div>
        } />
        <Route path="/" element={
          <div style={{ padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '5px' }}>
            <h1>TaskZen Troubleshooter</h1>
            <p>The minimal app is working correctly! This means there's likely an issue with:</p>
            <ul style={{ lineHeight: 1.6 }}>
              <li>The store initialization (Zustand)</li>
              <li>Component rendering in the main dashboard</li>
              <li>React Router configuration</li>
            </ul>
            
            <div style={{ marginTop: '20px' }}>
              <h2>Next Steps</h2>
              <p>Choose an option to continue troubleshooting:</p>
              
              <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                <button 
                  onClick={() => navigate('/safe-dashboard')}
                  style={{
                    backgroundColor: '#3498db',
                    border: 'none',
                    color: 'white',
                    padding: '10px 15px',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Go to Safe Dashboard
                </button>
                  <button 
                  onClick={() => {
                    clearAllStores();
                    window.location.reload();
                  }}
                  style={{
                    backgroundColor: '#e74c3c',
                    border: 'none',
                    color: 'white',
                    padding: '10px 15px',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Clear Storage & Reload
                </button>
                {/* Added option to directly try loading the original app */}
                <button 
                  onClick={() => {
                    localStorage.setItem('useOriginalApp', 'true');
                    window.location.href = '/';
                  }}
                  style={{
                    backgroundColor: '#2ecc71',
                    border: 'none',
                    color: 'white',
                    padding: '10px 15px',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Try Original App
                </button>
              </div>
            </div>
          </div>
        } />
      </Routes>
    </div>
  );
}
