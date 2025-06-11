import { loadAllApplicationData, diagnoseStoreData } from './fixDataDisplayErrors';

// Mock the stores
jest.mock('../store/taskStore.fixed', () => ({
  useTaskStore: {
    getState: jest.fn(() => ({
      fetchTasks: jest.fn().mockResolvedValue([]),
      tasks: [],
    })),
  },
}));

jest.mock('../store/teamStore.fixed', () => ({
  useTeamStore: {
    getState: jest.fn(() => ({
      fetchTeams: jest.fn().mockResolvedValue([]),
      teams: [],
    })),
  },
}));

jest.mock('../store/habitStore', () => ({
  useHabitStore: {
    getState: jest.fn(() => ({
      fetchHabits: jest.fn().mockResolvedValue([]),
      habits: [],
    })),
  },
}));

jest.mock('../store/progressStore', () => ({
  useProgressStore: {
    getState: jest.fn(() => ({
      fetchProgress: jest.fn().mockResolvedValue([]),
      fetchLeaderboard: jest.fn().mockResolvedValue([]),
      progress: null,
    })),
  },
}));

describe('fixDataDisplayErrors', () => {
  test('loadAllApplicationData should load all data without errors', async () => {
    const result = await loadAllApplicationData();
    expect(result.success).toBe(true);
  });

  test('diagnoseStoreData should return correct diagnostics', () => {
    const diagnostics = diagnoseStoreData();
    expect(diagnostics).toEqual({
      tasksLoaded: false,
      taskCount: 0,
      teamsLoaded: false,
      teamCount: 0,
      habitsLoaded: false,
      habitCount: 0,
      progressLoaded: false,
      storeStatus: {
        tasks: 'Empty or not loaded',
        teams: 'Empty or not loaded',
        habits: 'Empty or not loaded',
        progress: 'Empty or not loaded',
      },
    });
  });
});
