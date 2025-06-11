/**
 * This file contains helper functions to fix data display issues
 * across Dashboard, Tasks, Analytics, Team, Subscription, and Settings sections
 */

import { useTaskStore } from '../store/taskStore.fixed';
import { useTeamStore } from '../store/teamStore.fixed';
import { useHabitStore } from '../store/habitStore';
import { useProgressStore } from '../store/progressStore';
import { useUserStore } from '../store/userStore';

/**
 * Loads all necessary data for the application
 * Call this function when initializing the app to ensure data is available
 */
export async function loadAllApplicationData() {
  try {
    // Make sure user is logged in before attempting to load data
    const user = useUserStore.getState().user;
    if (!user || !user.id) {
      console.warn('User not logged in, skipping data load');
      return { success: false, error: 'User not logged in' };
    }

    // Load tasks
    const taskLoadPromise = useTaskStore.getState().fetchTasks()
      .catch(err => {
        console.error('Failed to load tasks:', err);
        return [];
      });

    // Load teams (if user is logged in)
    const teamLoadPromise = useTeamStore.getState().fetchTeams()
      .catch(err => {
        console.error('Failed to load teams:', err);
        return [];
      });
    
    // Load habits
    const habitsLoadPromise = useHabitStore.getState().fetchHabits()
      .catch(err => {
        console.error('Failed to load habits:', err);
        return [];
      });
    
    // Load progress
    const progressLoadPromise = useProgressStore.getState().fetchProgress()
      .catch(err => {
        console.error('Failed to load progress:', err);
        // Initialize with default values on error
        return Promise.resolve();
      });
    
    // Load leaderboard
    const leaderboardLoadPromise = useProgressStore.getState().fetchLeaderboard()
      .catch(err => {
        console.error('Failed to load leaderboard:', err);
        return [];
      });
    
    // Wait for all data to load
    const results = await Promise.allSettled([
      taskLoadPromise,
      teamLoadPromise,
      habitsLoadPromise,
      progressLoadPromise,
      leaderboardLoadPromise
    ]);
    
    // Check if any critical loads failed
    const criticalErrors = results.filter((r, idx) => 
      idx <= 2 && r.status === 'rejected'
    );
    
    if (criticalErrors.length > 0) {
      return { 
        success: false, 
        error: 'Failed to load critical data',
        details: criticalErrors.map(e => e.status === 'rejected' ? e.reason : null)
      };
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error loading application data:', error);
    return { success: false, error };
  }
}

/**
 * Verify store data and return diagnostic information
 * Useful for debugging data loading issues
 */
export function diagnoseStoreData() {
  const tasks = useTaskStore.getState().tasks || [];
  const teams = useTeamStore.getState().teams || [];
  const habits = useHabitStore.getState().habits || [];
  const progress = useProgressStore.getState().progress;
  const user = useUserStore.getState().user;
  
  return {
    userLoggedIn: !!user,
    userId: user?.id || 'none',
    tasksLoaded: tasks.length > 0,
    taskCount: tasks.length,
    teamsLoaded: teams.length > 0,
    teamCount: teams.length,
    habitsLoaded: habits.length > 0,
    habitCount: habits.length,
    progressLoaded: progress !== null,
    storeStatus: {
      tasks: tasks.length > 0 ? 'OK' : 'Empty or not loaded',
      teams: teams.length > 0 ? 'OK' : 'Empty or not loaded',
      habits: habits.length > 0 ? 'OK' : 'Empty or not loaded',
      progress: progress !== null ? 'OK' : 'Empty or not loaded'
    }
  };
}
