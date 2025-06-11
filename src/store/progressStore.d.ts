import { UserProgress, LeaderboardEntry } from '../types';
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
export declare const useProgressStore: import("zustand").UseBoundStore<Omit<import("zustand").StoreApi<ProgressStore>, "persist"> & {
    persist: {
        setOptions: (options: Partial<import("zustand/middleware").PersistOptions<ProgressStore, ProgressStore>>) => void;
        clearStorage: () => void;
        rehydrate: () => Promise<void> | void;
        hasHydrated: () => boolean;
        onHydrate: (fn: (state: ProgressStore) => void) => () => void;
        onFinishHydration: (fn: (state: ProgressStore) => void) => () => void;
        getOptions: () => Partial<import("zustand/middleware").PersistOptions<ProgressStore, ProgressStore>>;
    };
}>;
export {};
