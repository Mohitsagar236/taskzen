import { useState, useEffect } from 'react';
import { TaskForm } from '../components/ui/TaskForm';
import { TaskList } from '../components/TaskList.fixed';
import { KanbanBoard } from '../components/KanbanBoard';
import { Calendar } from '../components/Calendar';
import { PomodoroTimer } from '../components/PomodoroTimer';
import { TimeTracker } from '../components/TimeTracker';
import { DashboardSummary } from '../components/DashboardSummary';
import { HabitTracker } from '../components/HabitTracker';
import { FocusMode } from '../components/FocusMode';
import { MindMap } from '../components/MindMap';
import { AgendaView } from '../components/AgendaView';
import { RoutineManager } from '../components/RoutineManager';
import { ProgressDisplay } from '../components/ProgressDisplay';
import { AnalyticsDashboard } from '../components/analytics/AnalyticsDashboard';
import { Button } from '../components/ui/Button';
import { ErrorBoundary } from '../components/ErrorBoundary';
import GuestToAccountConversion from '../components/GuestToAccountConversion';
import { useUserStore } from '../store/userStore';
import { useRoutineStore } from '../store/routineStore';
import { useProgressStore } from '../store/progressStore';
import { useTaskStore } from '../store/taskStore';
import { 
  LayoutGrid, 
  Calendar as CalendarIcon, 
  ListTodo, 
  GitBranch, 
  Activity, 
  Clock, 
  Star, 
  ChevronRight, 
  ChevronLeft, 
  Zap, 
  Crown, 
  PieChart,
  X 
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Task } from '../types';

// Define TaskFormData type locally since we can't import it
interface TaskFormData {
  title: string;
  description?: string;
  dueDate?: string;
  priority?: 'low' | 'medium' | 'high';
  category?: string;
  status?: 'todo' | 'in-progress' | 'done';
}

function Dashboard() {
  console.log('Dashboard component initializing');
  
  // Add error handling for store access
  const [storeError, setStoreError] = useState<string | null>(null);
  const [showGuestConversion, setShowGuestConversion] = useState(false);
  
  // Safe store access with try/catch
  let preferencesValue = { defaultView: 'list' as 'list' | 'kanban' | 'calendar' | 'habits' | 'mindmap' | 'agenda' | 'analytics' };
  let subscriptionValue = { plan: null };
  let isGuestUser = false;
    try {
    const preferences = useUserStore((state) => state.preferences);
    const subscription = { plan: 'free' }; // Default to free as subscription isn't defined in UserStore
    isGuestUser = useUserStore((state) => state.isGuestUser);
    
    if (preferences) {
      preferencesValue = { 
        ...preferencesValue,
        ...preferences,
        // Ensure defaultView is typed correctly
        defaultView: (preferences.defaultView || 'list') as 'list' | 'kanban' | 'calendar' | 'habits' | 'mindmap' | 'agenda' | 'analytics'
      };
    }
    
    subscriptionValue = subscription;
    console.log('Successfully accessed userStore', { preferences, subscription, isGuestUser });
  } catch (err) {
    console.error('Failed to access userStore:', err);
    setStoreError(`UserStore error: ${err instanceof Error ? err.message : String(err)}`);
  }
  // Safe task store access
  let addTaskFunc = async (taskInput: Omit<Task, 'id' | 'createdAt'>) => {
    console.error('addTask function not available');
    toast.error('Failed to add task: Store not initialized');
    return Promise.resolve(); // Return resolved promise instead of rejected
  };
  
  try {
    const addTask = useTaskStore((state) => state.addTask);
    if (addTask) {
      addTaskFunc = (taskInput) => {
        console.log('Adding task:', taskInput);
        return addTask(taskInput);
      };
      console.log('Successfully accessed taskStore');
    }
  } catch (err) {
    console.error('Failed to access taskStore:', err);
    setStoreError(`TaskStore error: ${err instanceof Error ? err.message : String(err)}`);
  }
  
  // Safe routine store access
  let checkRoutinesFunc = () => {
    console.log('checkAndExecuteRoutines function not available');
  };
  
  try {
    const checkAndExecuteRoutines = useRoutineStore((state) => state.checkAndExecuteRoutines);
    if (checkAndExecuteRoutines) {
      checkRoutinesFunc = checkAndExecuteRoutines;
      console.log('Successfully accessed routineStore');
    }
  } catch (err) {
    console.error('Failed to access routineStore:', err);
    setStoreError(`RoutineStore error: ${err instanceof Error ? err.message : String(err)}`);
  }
    // Safe progress store access
  let progressFuncs = {
    fetchProgress: () => console.log('fetchProgress not available'),
    fetchLeaderboard: () => console.log('fetchLeaderboard not available')
  };
  
  try {
    const fetchProgress = useProgressStore((state) => state.fetchProgress);
    const fetchLeaderboard = useProgressStore((state) => state.fetchLeaderboard);
    
    progressFuncs = { 
      fetchProgress: () => {
        try {
          fetchProgress();
        } catch (err) {
          console.error('Error calling fetchProgress:', err);
        }
      }, 
      fetchLeaderboard: () => {
        try {
          fetchLeaderboard();
        } catch (err) {
          console.error('Error calling fetchLeaderboard:', err);
        }
      } 
    };
    console.log('Successfully accessed progressStore');
  } catch (err) {
    console.error('Failed to access progressStore:', err);
    setStoreError(`ProgressStore error: ${err instanceof Error ? err.message : String(err)}`);
  }
  
  const [view, setView] = useState<'list' | 'kanban' | 'calendar' | 'habits' | 'mindmap' | 'agenda' | 'analytics'>(
    preferencesValue.defaultView
  );
  const [focusModeActive, setFocusModeActive] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  useEffect(() => {
    console.log('Dashboard useEffect running');
    // Safe function calls with error handling
    try {
      checkRoutinesFunc();
      progressFuncs.fetchProgress();
      progressFuncs.fetchLeaderboard();
      
      const interval = setInterval(checkRoutinesFunc, 60000);
      return () => clearInterval(interval);
    } catch (err) {
      console.error('Error in Dashboard useEffect:', err);
      setStoreError(`UseEffect error: ${err instanceof Error ? err.message : String(err)}`);
    }
  }, []);
  const handleAddTask = async (taskData: TaskFormData) => {
    if (!taskData.title) {
      toast.error('Task title is required');
      return;
    }

    try {
      const task: Omit<Task, 'id' | 'createdAt'> = {
        title: taskData.title,
        description: taskData.description || '',
        dueDate: taskData.dueDate ? new Date(taskData.dueDate) : null,
        priority: taskData.priority || 'medium',
        category: taskData.category || 'personal',
        status: taskData.status || 'todo',
        completed: false
      };

      await addTaskFunc(task);
      toast.success('Task created successfully');
    } catch (error) {
      console.error('Failed to create task:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create task');
      return;
    }
  };

  const isPremium = subscriptionValue?.plan === 'pro' || subscriptionValue?.plan === 'team';
  const viewOptions = [
    { id: 'list', label: 'List', icon: ListTodo, color: 'from-blue-500 to-blue-600', description: 'Simple task list view' },
    { id: 'kanban', label: 'Kanban', icon: LayoutGrid, color: 'from-green-500 to-green-600', description: 'Drag & drop task management' },
    { id: 'calendar', label: 'Calendar', icon: CalendarIcon, color: 'from-purple-500 to-purple-600', description: 'Calendar view of tasks' },
    { id: 'habits', label: 'Habits', icon: Star, color: 'from-yellow-500 to-yellow-600', premium: true, description: 'Track daily habits' },
    { id: 'mindmap', label: 'Mind Map', icon: GitBranch, color: 'from-red-500 to-red-600', premium: true, description: 'Visual task relationships' },
    { id: 'agenda', label: 'Agenda', icon: Clock, color: 'from-indigo-500 to-indigo-600', description: 'Timeline view of tasks' },
    { id: 'analytics', label: 'Analytics', icon: PieChart, color: 'from-pink-500 to-pink-600', premium: true, description: 'Advanced analytics & reports' },
  ];
  // Add loading and error state tracking
  const [isLoaded, setIsLoaded] = useState(false);
  
  useEffect(() => {
    // Mark component as loaded after initial render
    setIsLoaded(true);
    console.log('Dashboard marked as loaded');
  }, []);
  
  // Show error if any store access failed
  if (storeError) {
    return (
      <div className="container mx-auto p-4 bg-red-50 dark:bg-red-900/20 rounded-xl">
        <div className="max-w-[1600px] mx-auto space-y-6">
          <h1 className="text-2xl font-bold text-red-700 dark:text-red-400">Dashboard Error</h1>
          <p className="text-red-600 dark:text-red-300">{storeError}</p>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow">
            <h2 className="font-bold mb-2">Troubleshooting Steps:</h2>
            <ol className="list-decimal pl-5 space-y-2">
              <li>Check browser console for detailed error messages</li>
              <li>Verify that the stores are properly initialized</li>
              <li>Clear browser storage and reload</li>
              <li>Check network connections to Supabase</li>
            </ol>
          </div>
          <div className="flex space-x-4">
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Reload Page
            </button>
            <button 
              onClick={() => {localStorage.clear(); window.location.reload();}}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
            >
              Clear Storage & Reload
            </button>
          </div>
        </div>
      </div>
    );
  }
    // Display loading spinner during initial component setup 
  if (!isLoaded) {
    return (
      <div className="container mx-auto p-4">
        <div className="max-w-[1600px] mx-auto flex justify-center items-center h-[70vh]">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="max-w-[1600px] mx-auto space-y-6">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-4 sm:p-6 text-white">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold mb-2">Welcome back!</h1>
              <p className="opacity-90">
                {isPremium ? (
                  <span className="flex items-center">
                    <Crown className="w-5 h-5 mr-2 text-yellow-300" />
                    Premium Member
                  </span>
                ) : (
                  'Free Plan'
                )}
              </p>
            </div>
            <Button
              onClick={() => setFocusModeActive(!focusModeActive)}
              className={`w-full sm:w-auto ${
                focusModeActive 
                  ? 'bg-red-500 hover:bg-red-600 text-white' 
                  : 'bg-white/20 hover:bg-white/30 text-white'
              }`}
            >
              {focusModeActive ? (
                <>
                  <X className="w-5 h-5 mr-2" />
                  Exit Focus Mode
                </>
              ) : (
                <>
                  <Activity className="w-5 h-5 mr-2" />
                  Enter Focus Mode
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <DashboardSummary />

        {/* View Selector */}
        {!focusModeActive && (
          <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {viewOptions.map((viewOption) => {
                const Icon = viewOption.icon;
                const isDisabled = viewOption.premium && !isPremium;
                const isActive = view === viewOption.id;
                
                return (
                  <div
                    key={viewOption.id}
                    className={`
                      relative group
                      ${isDisabled ? 'cursor-not-allowed' : 'cursor-pointer'}
                    `}
                    onClick={() => !isDisabled && setView(viewOption.id as any)}
                  >
                    <div className={`
                      h-24 rounded-xl transition-all duration-300
                      ${isActive ? `bg-gradient-to-r ${viewOption.color} text-white` : 'bg-gray-50 dark:bg-gray-700'}
                      ${isDisabled ? 'opacity-60' : 'hover:scale-105'}
                      flex flex-col items-center justify-center gap-2
                    `}>
                      <Icon className={`w-6 h-6 ${isActive ? 'text-white' : ''}`} />
                      <span className="text-sm font-medium">{viewOption.label}</span>
                      {isDisabled && (
                        <div className="absolute top-2 right-2">
                          <Zap className="w-4 h-4 text-yellow-500" />
                        </div>
                      )}
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute top-full left-0 right-0 mt-2 p-2 bg-gray-900 text-white text-xs rounded-lg z-10">
                      {viewOption.description}
                      {isDisabled && ' (Premium)'}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Main Content and Sidebar */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          <div className="xl:col-span-9 space-y-6">
            {/* Task Form */}
            {!focusModeActive && <TaskForm onSubmit={handleAddTask} />}

            {/* Main View */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden min-h-[600px]">
              {focusModeActive ? (
                <FocusMode onExit={() => setFocusModeActive(false)} />
              ) : (                <div className="p-6">
                  {(() => {
                    // Create a fallback UI for component errors
                    const fallbackUI = (componentName: string) => (
                      <div className="text-center py-8 bg-red-50 dark:bg-red-900/20 rounded-lg">
                        <h3 className="text-lg font-medium text-red-800 dark:text-red-300">
                          Error loading {componentName}
                        </h3>
                        <p className="mt-2 text-red-600 dark:text-red-400">
                          This component couldn't be rendered due to an error
                        </p>
                        <button
                          onClick={() => setView('list')}
                          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                        >
                          Switch to List View
                        </button>
                      </div>
                    );
                    
                    // Return the appropriate component based on current view
                    switch (view) {
                      case 'list':
                        return (
                          <ErrorBoundary name="TaskList" fallback={fallbackUI('Task List')}>
                            <TaskList />
                          </ErrorBoundary>
                        );
                      case 'kanban':
                        return (
                          <ErrorBoundary name="KanbanBoard" fallback={fallbackUI('Kanban Board')}>
                            <KanbanBoard />
                          </ErrorBoundary>
                        );
                      case 'calendar':
                        return (
                          <ErrorBoundary name="Calendar" fallback={fallbackUI('Calendar')}>
                            <Calendar />
                          </ErrorBoundary>
                        );
                      case 'habits':
                        return isPremium ? (
                          <ErrorBoundary name="HabitTracker" fallback={fallbackUI('Habit Tracker')}>
                            <HabitTracker />
                          </ErrorBoundary>
                        ) : (
                          <div className="text-center py-4">Premium feature</div>
                        );
                      case 'mindmap':
                        return isPremium ? (
                          <ErrorBoundary name="MindMap" fallback={fallbackUI('Mind Map')}>
                            <MindMap />
                          </ErrorBoundary>
                        ) : (
                          <div className="text-center py-4">Premium feature</div>
                        );
                      case 'agenda':
                        return (
                          <ErrorBoundary name="AgendaView" fallback={fallbackUI('Agenda View')}>
                            <AgendaView />
                          </ErrorBoundary>
                        );
                      case 'analytics':
                        return (
                          <ErrorBoundary name="AnalyticsDashboard" fallback={fallbackUI('Analytics Dashboard')}>
                            <AnalyticsDashboard />
                          </ErrorBoundary>
                        );
                      default:
                        return (
                          <ErrorBoundary name="TaskList" fallback={fallbackUI('Task List')}>
                            <TaskList />
                          </ErrorBoundary>
                        ); 
                    }
                  })()}
                </div>
              )}
            </div>
          </div>

          <div className={`xl:col-span-3 transition-all duration-300 ${sidebarCollapsed ? 'xl:col-span-1' : 'xl:col-span-3'}`}>
            <div className="sticky top-4 space-y-6">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="absolute -left-3 top-1/2 transform -translate-y-1/2 hidden xl:flex z-10 bg-white dark:bg-gray-800"
              >
                {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
              </Button>

              <div className={`transition-all duration-300 space-y-6 ${sidebarCollapsed ? 'opacity-0' : 'opacity-100'}`}>
                <PomodoroTimer />
                <TimeTracker />
                <ProgressDisplay />
                {isPremium && <RoutineManager />}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;