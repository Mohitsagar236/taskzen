import { useUserStore } from '../store/userStore';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function GuestBanner() {
  const { isGuestUser, signOut } = useUserStore();
  const navigate = useNavigate();

  if (!isGuestUser) return null;

  const handleCreateAccount = () => {
    // Sign out from guest mode and redirect to login page
    signOut()
      .then(() => {
        navigate('/login');
        toast.success('Please create an account to save your data', {
          duration: 5000
        });
      })
      .catch(error => {
        console.error('Error signing out from guest mode:', error);
        // Just navigate anyway
        navigate('/login');
      });
  };

  return (
    <div className="bg-yellow-50 dark:bg-yellow-900/40 border-t border-yellow-200 dark:border-yellow-800 py-2 px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center flex-1 min-w-0">
          <span className="flex p-2 rounded-lg bg-yellow-100 dark:bg-yellow-800">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-600 dark:text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
          </span>
          <p className="ml-3 font-medium text-yellow-800 dark:text-yellow-300 truncate">
            <span className="md:hidden">You're in guest mode.</span>
            <span className="hidden md:inline">You're using TaskZen in guest mode. Your data won't be saved between sessions.</span>
          </p>
        </div>
        <div className="flex-shrink-0 order-2 sm:order-3 sm:ml-3">
          <button
            type="button"
            onClick={handleCreateAccount}
            className="flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Create Account
          </button>
        </div>
      </div>
    </div>
  );
}
