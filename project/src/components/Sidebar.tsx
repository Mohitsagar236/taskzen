import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTaskStore } from '../store/taskStore';
import { useUserStore } from '../store/userStore';
import { 
  Home, 
  ListTodo, 
  Calendar, 
  BarChart2, 
  Settings, 
  PlusCircle,
  Trash2,
  Moon,
  Sun
} from 'lucide-react';
import Button from './ui/Button';

const Sidebar: React.FC = () => {
  const location = useLocation();
  const { categories, addCategory, deleteCategory } = useTaskStore();
  const { isDarkMode, toggleDarkMode } = useUserStore();
  const [newCategory, setNewCategory] = React.useState('');
  const [isAddingCategory, setIsAddingCategory] = React.useState(false);

  const handleAddCategory = () => {
    if (newCategory.trim()) {
      addCategory(newCategory.trim());
      setNewCategory('');
      setIsAddingCategory(false);
    }
  };

  return (
    <aside className="w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 h-screen p-4 flex flex-col">
      <div className="flex items-center mb-6">
        <ListTodo className="h-6 w-6 text-blue-600 mr-2" />
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">TaskMaster</h1>
      </div>
      
      <nav className="flex-1 space-y-1">
        <Link
          to="/"
          className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
            location.pathname === '/'
              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200'
              : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
          }`}
        >
          <Home className="h-5 w-5 mr-2" />
          Dashboard
        </Link>
        
        <Link
          to="/tasks"
          className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
            location.pathname === '/tasks'
              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200'
              : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
          }`}
        >
          <ListTodo className="h-5 w-5 mr-2" />
          All Tasks
        </Link>
        
        <Link
          to="/calendar"
          className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
            location.pathname === '/calendar'
              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200'
              : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
          }`}
        >
          <Calendar className="h-5 w-5 mr-2" />
          Calendar
        </Link>
        
        <Link
          to="/analytics"
          className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
            location.pathname === '/analytics'
              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200'
              : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
          }`}
        >
          <BarChart2 className="h-5 w-5 mr-2" />
          Analytics
        </Link>
        
        <div className="pt-4">
          <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Categories
          </h3>
          <div className="mt-2 space-y-1">
            {categories.map((category) => (
              <div key={category} className="flex items-center justify-between group">
                <Link
                  to={`/category/${category}`}
                  className={`flex-1 flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                    location.pathname === `/category/${category}`
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200'
                      : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                  }`}
                >
                  {category}
                </Link>
                <button
                  onClick={() => deleteCategory(category)}
                  className="opacity-0 group-hover:opacity-100 p-1 text-gray-500 hover:text-red-500 focus:outline-none"
                  aria-label={`Delete ${category} category`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
          
          {isAddingCategory ? (
            <div className="mt-2 px-3">
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  placeholder="Category name"
                  className="flex-1 rounded-md border border-gray-300 px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  autoFocus
                />
                <button
                  onClick={handleAddCategory}
                  className="p-1 text-blue-600 hover:text-blue-700 focus:outline-none"
                >
                  ✓
                </button>
                <button
                  onClick={() => setIsAddingCategory(false)}
                  className="p-1 text-gray-500 hover:text-gray-700 focus:outline-none"
                >
                  ✕
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setIsAddingCategory(true)}
              className="mt-2 flex items-center px-3 py-2 w-full rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Category
            </button>
          )}
        </div>
      </nav>
      
      <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
        <Link
          to="/settings"
          className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
            location.pathname === '/settings'
              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200'
              : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
          }`}
        >
          <Settings className="h-5 w-5 mr-2" />
          Settings
        </Link>
        
        <button
          onClick={toggleDarkMode}
          className="mt-2 flex items-center px-3 py-2 w-full rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
        >
          {isDarkMode ? (
            <>
              <Sun className="h-5 w-5 mr-2" />
              Light Mode
            </>
          ) : (
            <>
              <Moon className="h-5 w-5 mr-2" />
              Dark Mode
            </>
          )}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;