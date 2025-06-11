import React from 'react';
import { Link, useLocation } from 'react-router-dom';

interface SimpleLayoutProps {
  children: React.ReactNode;
}

export default function SimpleLayout({ children }: SimpleLayoutProps) {
  const location = useLocation();
  
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-900">TaskZen</h1>
          <div>
            <span className="text-sm text-gray-500 mr-4">User: Test User</span>
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white px-4 py-2 rounded"
              onClick={() => console.log('Logout clicked')}
            >
              Logout
            </button>
          </div>
        </div>
      </header>
      
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row">
          <aside className="w-full sm:w-64 mb-4 sm:mb-0 sm:mr-8">
            <nav className="bg-white shadow rounded-lg">
              <ul className="p-2">
                <li className="mb-1">
                  <Link 
                    to="/" 
                    className={`block px-4 py-2 rounded hover:bg-blue-50 ${location.pathname === '/' ? 'bg-blue-100 text-blue-700' : ''}`}
                  >
                    Dashboard
                  </Link>
                </li>
                <li className="mb-1">
                  <Link 
                    to="/tasks" 
                    className={`block px-4 py-2 rounded hover:bg-blue-50 ${location.pathname === '/tasks' ? 'bg-blue-100 text-blue-700' : ''}`}
                  >
                    Tasks
                  </Link>
                </li>
                <li className="mb-1">
                  <Link 
                    to="/settings" 
                    className={`block px-4 py-2 rounded hover:bg-blue-50 ${location.pathname === '/settings' ? 'bg-blue-100 text-blue-700' : ''}`}
                  >
                    Settings
                  </Link>
                </li>
              </ul>
            </nav>
          </aside>
          
          <main className="flex-1 bg-white shadow rounded-lg">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}