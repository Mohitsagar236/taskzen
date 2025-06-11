import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UserProgress, Badge, LeaderboardEntry } from '../types/progress';
import { supabase } from '../lib/supabase';
import { useUserStore } from './userStore';
import { useOfflineStore } from './offlineStore';
import confetti from 'canvas-confetti';

interface ProgressStore {
  progress: UserProgress | null;
  leaderboard: LeaderboardEntry[];
  error: string | null;
  fetchProgress: () => Promise<void>;
  fetchLeaderboard: () => Promise<void>;
  addXP: (amount: number) => Promise<void>;
  unlockBadge: (badgeId: string) => Promise<void>;
  updateStreak: () => Promise<void>;
  checkBadgeUnlocks: () => Promise<void>;
}

const BADGES: Badge[] = [
  {
    id: 'first-task',
    name: 'First Steps',
    description: 'Complete your first task',
    icon: '🎯',
    requirement: { type: 'tasks', value: 1 },
  },
  {
    id: 'productive-week',
    name: 'Productive Week',
    description: 'Maintain a 7-day streak',
    icon: '🔥',
    requirement: { type: 'streak', value: 7 },
  },
  {
    id: 'task-master',
    name: 'Task Master',
    description: 'Complete 100 tasks',
    icon: '👑',
    requirement: { type: 'tasks', value: 100 },
  },
  {
    id: 'xp-warrior',
    name: 'XP Warrior',
    description: 'Earn 1000 XP',
    icon: '⚔️',
    requirement: { type: 'xp', value: 1000 },
  },
];

const calculateLevel = (xp: number): number => {
  return Math.floor(Math.sqrt(xp / 100)) + 1;
};

// Retry configuration
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // Start with 1 second delay

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  retries = MAX_RETRIES,
  delay = RETRY_DELAY
): Promise<T> => {
  try {
    return await fn();
  } catch (error) {
    if (retries === 0) throw error;
    await wait(delay);
    return retryWithBackoff(fn, retries - 1, delay * 2);
  }
};

export const useProgressStore = create<ProgressStore>()(
  persist(
    (set, get) => ({
      progress: null,
      leaderboard: [],
      error: null,

      fetchProgress: async () => {
        try {
          const user = useUserStore.getState().user;
          if (!user) {
            set({ error: 'User not authenticated' });
            return;
          }

          const { data, error } = await supabase
            .from('user_progress_with_users')
            .select('*')
            .eq('user_id', user.id)
            .single();

          if (error) {
            if (error.code === 'PGRST116') {
              // Record not found, create initial progress
              const initialProgress = {
                user_id: user.id,
                xp: 0,
                level: 1,
                badges: [],
                streak_days: 0,
                last_task_date: new Date().toISOString(),
                tasks_completed: 0,
              };

              const { data: newProgress, error: createError } = await supabase
                .from('user_progress')
                .insert([initialProgress])
                .select()
                .single();

              if (createError) throw createError;
              set({ progress: newProgress, error: null });
            } else if (error.status === 406 || error.code === '42P01') {
              console.warn('user_progress_with_users not available, using default progress');
              set({
                progress: {
                  userId: user.id,
                  xp: 0,
                  level: 1,
                  badges: [],
                  streakDays: 0,
                  lastTaskDate: new Date(),
                  tasksCompleted: 0
                },
                error: null
              });
              return;
            } else {
              throw error;
            }
          } else {
            set({ progress: data, error: null });
          }
        } catch (err) {
          console.error('Error fetching progress:', err);
          set({ error: 'Failed to fetch progress' });
        }
      },

      fetchLeaderboard: async () => {
        // Check if we're offline
        const isOffline = useOfflineStore.getState().isOffline;
        if (isOffline) {
          set({ error: 'Cannot fetch leaderboard while offline' });
          return;
        }

        try {
          const fetchLeaderboardData = async () => {
            const { data, error } = await supabase
              .from('user_progress_with_users')
              .select('*')
              .order('xp', { ascending: false })
              .limit(10);

            if (error) {
              if (error.status === 406 || error.code === '42P01') {
                console.warn('user_progress_with_users not available, skipping leaderboard');
                return [];
              }
              throw error;
            }

            return data;
          };

          const data = await retryWithBackoff(fetchLeaderboardData);

          const leaderboard = (data || []).map((entry, index) => ({
            userId: entry.user_id,
            userName: entry.user_name || 'Unknown User',
            xp: entry.xp,
            level: entry.level,
            badges: entry.badges?.length || 0,
            rank: index + 1,
          }));

          set({ leaderboard, error: null });
        } catch (err) {
          console.error('Error fetching leaderboard:', err);
          const errorMessage = err instanceof Error ? err.message : 'Failed to fetch leaderboard';
          set({ error: errorMessage });
        }
      },

      addXP: async (amount: number) => {
        try {
          const user = useUserStore.getState().user;
          if (!user) {
            set({ error: 'User not authenticated' });
            return;
          }

          const currentProgress = get().progress;
          if (!currentProgress) {
            set({ error: 'Progress not initialized' });
            return;
          }

          const newXP = currentProgress.xp + amount;
          const newLevel = calculateLevel(newXP);

          const { error } = await supabase
            .from('user_progress')
            .update({
              xp: newXP,
              level: newLevel,
            })
            .eq('user_id', user.id);

          if (error) throw error;

          set((state) => ({
            progress: state.progress
              ? { ...state.progress, xp: newXP, level: newLevel }
              : null,
            error: null,
          }));

          if (newLevel > currentProgress.level) {
            confetti({
              particleCount: 100,
              spread: 70,
              origin: { y: 0.6 },
            });
          }

          await get().checkBadgeUnlocks();
        } catch (err) {
          console.error('Error adding XP:', err);
          set({ error: 'Failed to add XP' });
        }
      },

      unlockBadge: async (badgeId: string) => {
        try {
          const user = useUserStore.getState().user;
          if (!user) {
            set({ error: 'User not authenticated' });
            return;
          }

          const currentProgress = get().progress;
          if (!currentProgress) {
            set({ error: 'Progress not initialized' });
            return;
          }

          const badge = BADGES.find((b) => b.id === badgeId);
          if (!badge) {
            set({ error: 'Invalid badge ID' });
            return;
          }

          const updatedBadges = [
            ...(currentProgress.badges || []),
            { ...badge, unlockedAt: new Date() },
          ];

          const { error } = await supabase
            .from('user_progress')
            .update({ badges: updatedBadges })
            .eq('user_id', user.id);

          if (error) throw error;

          set((state) => ({
            progress: state.progress
              ? { ...state.progress, badges: updatedBadges }
              : null,
            error: null,
          }));

          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
          });
        } catch (err) {
          console.error('Error unlocking badge:', err);
          set({ error: 'Failed to unlock badge' });
        }
      },

      updateStreak: async () => {
        try {
          const user = useUserStore.getState().user;
          if (!user) {
            set({ error: 'User not authenticated' });
            return;
          }

          const currentProgress = get().progress;
          if (!currentProgress) {
            set({ error: 'Progress not initialized' });
            return;
          }

          const lastTaskDate = new Date(currentProgress.lastTaskDate);
          const today = new Date();
          const diffDays = Math.floor(
            (today.getTime() - lastTaskDate.getTime()) / (1000 * 60 * 60 * 24)
          );

          let newStreak = currentProgress.streakDays;
          if (diffDays === 1) {
            newStreak += 1;
          } else if (diffDays > 1) {
            newStreak = 1;
          }

          const { error } = await supabase
            .from('user_progress')
            .update({
              streak_days: newStreak,
              last_task_date: today.toISOString(),
            })
            .eq('user_id', user.id);

          if (error) throw error;

          set((state) => ({
            progress: state.progress
              ? {
                  ...state.progress,
                  streakDays: newStreak,
                  lastTaskDate: today,
                }
              : null,
            error: null,
          }));

          await get().checkBadgeUnlocks();
        } catch (err) {
          console.error('Error updating streak:', err);
          set({ error: 'Failed to update streak' });
        }
      },

      checkBadgeUnlocks: async () => {
        try {
          const progress = get().progress;
          if (!progress) {
            set({ error: 'Progress not initialized' });
            return;
          }

          const unlockedBadgeIds = progress.badges.map((b) => b.id);

          for (const badge of BADGES) {
            if (unlockedBadgeIds.includes(badge.id)) continue;

            const shouldUnlock = (() => {
              switch (badge.requirement.type) {
                case 'tasks':
                  return progress.tasksCompleted >= badge.requirement.value;
                case 'streak':
                  return progress.streakDays >= badge.requirement.value;
                case 'xp':
                  return progress.xp >= badge.requirement.value;
                default:
                  return false;
              }
            })();

            if (shouldUnlock) {
              await get().unlockBadge(badge.id);
            }
          }
        } catch (err) {
          console.error('Error checking badge unlocks:', err);
          set({ error: 'Failed to check badge unlocks' });
        }
      },
    }),
    {
      name: 'progress-store',
    }
  )
);