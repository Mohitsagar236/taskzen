import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useUserStore } from '../store/userStore';
import { useTaskStore } from '../store/taskStore';

interface GuestToAccountConversionProps {
  show: boolean;
  onClose: () => void;
}

export default function GuestToAccountConversion({ show, onClose }: GuestToAccountConversionProps) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { signOut } = useUserStore();
  const { tasks } = useTaskStore();

  // Store guest tasks for later conversion
  const storeGuestTasks = () => {
    if (tasks && tasks.length > 0) {
      try {
        // Store tasks in session storage temporarily
        sessionStorage.setItem('guestTasks', JSON.stringify(tasks));
        return true;
      } catch (error) {
        console.error('Error saving guest tasks:', error);
        return false;
      }
    }
    return false;
  };

  const handleCreateAccount = async () => {
    setLoading(true);
    try {
      // Store any tasks created during guest session
      const tasksStored = storeGuestTasks();
      
      // Sign out from guest mode
      await signOut();
      
      // Redirect to login with special query parameter
      if (tasksStored) {
        toast.success('Your guest data has been saved temporarily. Create an account to keep it permanently!', {
          duration: 5000
        });
        // Add a query param to indicate there's guest data to migrate
        navigate('/login?guestData=true');
      } else {
        navigate('/login');
        toast.success('Create an account to save your progress!');
      }
    } catch (error) {
      console.error('Error during transition to account:', error);
      navigate('/login');
    } finally {
      setLoading(false);
      onClose();
    }
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
        <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">
          Save Your Progress
        </h2>
        
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          You're currently using TaskZen as a guest. Create an account to save your data permanently.
        </p>
        
        {tasks && tasks.length > 0 && (
          <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-md mb-4">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              You have <strong>{tasks.length} tasks</strong> that will be transferred to your new account.
            </p>
          </div>
        )}
        
        <div className="flex gap-3 justify-end mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            Continue as Guest
          </button>
          
          <button
            onClick={handleCreateAccount}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </span>
            ) : (
              'Create Account'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
