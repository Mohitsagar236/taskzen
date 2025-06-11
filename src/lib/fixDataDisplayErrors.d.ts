/**
 * This file contains helper functions to fix data display issues
 * across Dashboard, Tasks, Analytics, Team, Subscription, and Settings sections
 */
/**
 * Loads all necessary data for the application
 * Call this function when initializing the app to ensure data is available
 */
export declare function loadAllApplicationData(): Promise<{
    success: boolean;
    error?: undefined;
} | {
    success: boolean;
    error: unknown;
}>;
/**
 * Verify store data and return diagnostic information
 * Useful for debugging data loading issues
 */
export declare function diagnoseStoreData(): {
    tasksLoaded: boolean;
    taskCount: number;
    teamsLoaded: boolean;
    teamCount: number;
    habitsLoaded: boolean;
    habitCount: number;
    progressLoaded: boolean;
    storeStatus: {
        tasks: string;
        teams: string;
        habits: string;
        progress: string;
    };
};
