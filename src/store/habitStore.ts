import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Habit, HabitCompletion } from '../types';
import { supabase } from '../lib/supabase';
import { useUserStore } from './userStore';
import { addDays, isSameDay, startOfDay } from 'date-fns';

interface HabitStore {
  habits: Habit[];
  completions: { [habitId: string]: HabitCompletion[] };
  fetchHabits: () => Promise<void>;
  addHabit: (habit: Omit<Habit, 'id' | 'userId' | 'createdAt'>) => Promise<void>;
  archiveHabit: (id: string) => Promise<void>;
  updateHabit: (id: string, updates: Partial<Habit>) => Promise<void>;
  completeHabit: (habitId: string, value: number, notes?: string) => Promise<void>;
  getStreak: (habitId: string) => number;
  calculatePoints: (habitId: string) => number;
}

export const useHabitStore = create<HabitStore>()(
  persist(
    (set, get) => ({
      habits: [],
      completions: {},

      fetchHabits: async () => {
        const user = useUserStore.getState().user;
        if (!user) return;

        try {
          const { data: habits, error: habitsError } = await supabase
            .from('habits')
            .select('*')
            .eq('user_id', user.id)
            .is('archived_at', null)
            .order('created_at', { ascending: false });

          if (habitsError) throw habitsError;

          const { data: completions, error: completionsError } = await supabase
            .from('habit_completions')
            .select('*')
            .eq('user_id', user.id)
            .gte('date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

          if (completionsError) throw completionsError;

          const completionsByHabit = completions.reduce((acc, completion) => {
            if (!acc[completion.habit_id]) {
              acc[completion.habit_id] = [];
            }
            acc[completion.habit_id].push({
              ...completion,
              date: new Date(completion.date),
              createdAt: new Date(completion.created_at),
            });
            return acc;
          }, {} as { [key: string]: HabitCompletion[] });

          set({
            habits: habits.map(habit => ({
              ...habit,
              createdAt: new Date(habit.created_at),
              archivedAt: habit.archived_at ? new Date(habit.archived_at) : undefined,
            })),
            completions: completionsByHabit,
          });
        } catch (error) {
          console.error('Error fetching habits:', error);
          throw error;
        }
      },

      addHabit: async (habit) => {
        const user = useUserStore.getState().user;
        if (!user) return;

        try {
          const { data, error } = await supabase
            .from('habits')
            .insert({
              name: habit.name,
              description: habit.description,
              frequency: habit.frequency,
              target: habit.target,
              unit: habit.unit,
              color: habit.color,
              user_id: user.id,
              created_at: new Date().toISOString(),
            })
            .select()
            .single();

          if (error) throw error;

          set(state => ({
            habits: [
              {
                ...data,
                createdAt: new Date(data.created_at),
                archivedAt: data.archived_at ? new Date(data.archived_at) : undefined,
              },
              ...state.habits,
            ],
          }));
        } catch (error) {
          console.error('Error adding habit:', error);
          throw error;
        }
      },

      archiveHabit: async (id) => {
        try {
          const { error } = await supabase
            .from('habits')
            .update({ archived_at: new Date().toISOString() })
            .eq('id', id);

          if (error) throw error;

          set(state => ({
            habits: state.habits.filter(habit => habit.id !== id),
          }));
        } catch (error) {
          console.error('Error archiving habit:', error);
          throw error;
        }
      },

      updateHabit: async (id, updates) => {
        try {
          const { error } = await supabase
            .from('habits')
            .update(updates)
            .eq('id', id);

          if (error) throw error;

          set(state => ({
            habits: state.habits.map(habit =>
              habit.id === id ? { ...habit, ...updates } : habit
            ),
          }));
        } catch (error) {
          console.error('Error updating habit:', error);
          throw error;
        }
      },

      completeHabit: async (habitId, value, notes) => {
        const user = useUserStore.getState().user;
        if (!user) return;

        const today = startOfDay(new Date());
        const habit = get().habits.find(h => h.id === habitId);
        
        if (!habit) return;

        try {
          const existingCompletion = get().completions[habitId]?.find(c =>
            isSameDay(c.date, today)
          );

          if (existingCompletion) {
            const { error } = await supabase
              .from('habit_completions')
              .update({
                value,
                notes,
              })
              .eq('id', existingCompletion.id);

            if (error) throw error;
          } else {
            const { data, error } = await supabase
              .from('habit_completions')
              .insert({
                habit_id: habitId,
                user_id: user.id,
                date: today.toISOString(),
                value,
                notes,
              })
              .select()
              .single();

            if (error) throw error;

            set(state => ({
              completions: {
                ...state.completions,
                [habitId]: [
                  ...(state.completions[habitId] || []),
                  {
                    ...data,
                    date: new Date(data.date),
                    createdAt: new Date(data.created_at),
                  },
                ],
              },
            }));
          }
        } catch (error) {
          console.error('Error completing habit:', error);
          throw error;
        }
      },

      getStreak: (habitId) => {
        const completions = get().completions[habitId] || [];
        const habit = get().habits.find(h => h.id === habitId);
        
        if (!habit || completions.length === 0) return 0;

        let streak = 0;
        let currentDate = startOfDay(new Date());

        while (true) {
          const hasCompletion = completions.some(c =>
            isSameDay(new Date(c.date), currentDate)
          );

          if (!hasCompletion) break;

          streak++;
          currentDate = addDays(currentDate, -1);
        }

        return streak;
      },

      calculatePoints: (habitId) => {
        const streak = get().getStreak(habitId);
        const completions = get().completions[habitId] || [];
        const basePoints = completions.length * 10;
        const streakBonus = Math.floor(streak / 7) * 50;
        return basePoints + streakBonus;
      },
    }),
    {
      name: 'habit-store',
    }
  )
);