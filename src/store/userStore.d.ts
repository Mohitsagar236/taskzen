interface UserStore {
    user: any | null;
    darkMode: boolean;
    preferences: any;
    setUser: (user: any | null) => void;
    validateSession: () => Promise<boolean>;
    toggleDarkMode: () => void;
    updatePreferences: (preferences: any) => void;
    resetPreferences: () => void;
    signOut: () => Promise<void>;
}
export declare const useUserStore: import("zustand").UseBoundStore<Omit<import("zustand").StoreApi<UserStore>, "persist"> & {
    persist: {
        setOptions: (options: Partial<import("zustand/middleware").PersistOptions<UserStore, UserStore>>) => void;
        clearStorage: () => void;
        rehydrate: () => Promise<void> | void;
        hasHydrated: () => boolean;
        onHydrate: (fn: (state: UserStore) => void) => () => void;
        onFinishHydration: (fn: (state: UserStore) => void) => () => void;
        getOptions: () => Partial<import("zustand/middleware").PersistOptions<UserStore, UserStore>>;
    };
}>;
export {};
