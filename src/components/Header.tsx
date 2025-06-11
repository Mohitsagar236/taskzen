import { Sun, Moon, User, LogOut, UserPlus } from 'lucide-react';
import { useUserStore } from '../store/userStore';
import { Button } from './ui/Button';
import toast from 'react-hot-toast';
import NotificationCenter from './NotificationCenter';
import { useNavigate } from 'react-router-dom';

export default function Header() {
  const { darkMode, toggleDarkMode, user, signOut, isGuestUser } = useUserStore();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Signed out successfully');
    } catch (error) {
      toast.error('Failed to sign out');
    }
  };

  const handleCreateAccount = async () => {
    try {
      await signOut();
      navigate('/login');
      toast.success('Please create an account to save your data');
    } catch (error) {
      navigate('/login');
    }
  };

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-30">
      <div className="h-16 px-4 lg:px-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white lg:hidden">
          TaskMaster
        </h1>
        <div className="flex items-center space-x-2 lg:space-x-4">          <Button
            variant="outline"
            size="sm"
            onClick={toggleDarkMode}
            className="w-10"
          >
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </Button>
          {user && (
            <div className="flex items-center space-x-2 lg:space-x-4">
              <div className="hidden lg:flex items-center space-x-2">
                {isGuestUser ? (
                  <>
                    <User size={18} className="text-yellow-500" />
                    <span className="text-sm font-medium text-yellow-600 dark:text-yellow-400">
                      Guest User
                    </span>
                  </>
                ) : (
                  <>
                    <User size={18} className="text-gray-600 dark:text-gray-300" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                      {user.name || user.email || user.user_metadata?.full_name || 'User'}
                    </span>
                  </>
                )}
              </div>
              {!isGuestUser && <NotificationCenter />}
              {isGuestUser ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCreateAccount}
                  title="Create an account"
                  className="hidden md:flex items-center space-x-1 px-3"
                >
                  <UserPlus size={16} className="mr-1" />
                  <span>Create Account</span>
                </Button>
              ) : null}
              <Button
                variant="outline"
                size="sm"
                onClick={handleSignOut}
                className="w-10"
                title={isGuestUser ? "Exit Guest Mode" : "Sign Out"}
              >
                <LogOut size={18} />
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}