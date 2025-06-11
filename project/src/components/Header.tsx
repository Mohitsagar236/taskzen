import React from 'react';
import { useUserStore } from '../store/userStore';
import { LogOut, User, Moon, Sun, Menu } from 'lucide-react';
import Button from './ui/Button';

interface HeaderProps {
  toggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ toggleSidebar }) => {
  const { user, isAuthenticated, logout, isDarkMode, toggleDarkMode } = useUserStore();

  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 py-3 px-4 flex items-center justify-between">
      <div className="flex items-center">
        <button
          onClick={toggleSidebar}
          className="mr-4 p-1 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:bg-gray-800 lg:hidden"
        >
          <Menu className="h-6 w-6" />
        </button>
      </div>
      
      <div className="flex items-center space-x-3">
        <button
          onClick={toggleDarkMode}
          className="p-2 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:bg-gray-800"
          aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
        >
          {isDarkMode ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
        </button>
        
        {isAuthenticated ? (
          <div className="flex items-center">
            <div className="mr-3 text-right">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {user?.name}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {user?.isPremium ? 'Premium' : 'Free'}
              </p>
            </div>
            
            <div className="relative">
              <button className="flex items-center focus:outline-none">
                <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white">
                  <User className="h-4 w-4" />
                </div>
              </button>
              
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-900 rounded-md shadow-lg py-1 border border-gray-200 dark:border-gray-800 hidden">
                <button
                  onClick={logout}
                  className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign out
                </button>
              </div>
            </div>
          </div>
        ) : (
          <Button onClick={() => window.location.href = '/login'}>
            Sign In
          </Button>
        )}
      </div>
    </header>
  );
};

export default Header;