import { Habit, HabitCompletion } from '../types';
interface HabitStore {
    habits: Habit[];
    completions: {
        [habitId: string]: HabitCompletion[];
    };
    fetchHabits: () => Promise<void>;
    addHabit: (habit: Omit<Habit, 'id' | 'userId' | 'createdAt'>) => Promise<void>;
    archiveHabit: (id: string) => Promise<void>;
    updateHabit: (id: string, updates: Partial<Habit>) => Promise<void>;
    completeHabit: (habitId: string, value: number, notes?: string) => Promise<void>;
    getStreak: (habitId: string) => number;
    calculatePoints: (habitId: string) => number;
}
export declare const useHabitStore: import("zustand").UseBoundStore<Omit<import("zustand").StoreApi<HabitStore>, "persist"> & {
    persist: {
        setOptions: (options: Partial<import("zustand/middleware").PersistOptions<HabitStore, HabitStore>>) => void;
        clearStorage: () => void;
        rehydrate: () => Promise<void> | void;
        hasHydrated: () => boolean;
        onHydrate: (fn: (state: HabitStore) => void) => () => void;
        onFinishHydration: (fn: (state: HabitStore) => void) => () => void;
        getOptions: () => Partial<import("zustand/middleware").PersistOptions<HabitStore, HabitStore>>;
    };
}>;
export {};
