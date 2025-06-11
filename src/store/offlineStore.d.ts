import { Task } from '../types';
interface PendingChange {
    id: string;
    type: 'create' | 'update' | 'delete';
    entity: 'task' | 'comment' | 'tag';
    data: any;
    timestamp: number;
}
interface OfflineStore {
    isOnline: boolean;
    pendingChanges: PendingChange[];
    offlineData: {
        tasks: Task[];
        comments: any[];
        tags: any[];
    };
    setOnlineStatus: (status: boolean) => void;
    addPendingChange: (change: Omit<PendingChange, 'id' | 'timestamp'>) => void;
    syncChanges: () => Promise<void>;
    cacheData: (data: any, type: keyof OfflineStore['offlineData']) => void;
    getOfflineData: (type: keyof OfflineStore['offlineData']) => any[];
}
export declare const useOfflineStore: import("zustand").UseBoundStore<Omit<import("zustand").StoreApi<OfflineStore>, "persist"> & {
    persist: {
        setOptions: (options: Partial<import("zustand/middleware").PersistOptions<OfflineStore, OfflineStore>>) => void;
        clearStorage: () => void;
        rehydrate: () => Promise<void> | void;
        hasHydrated: () => boolean;
        onHydrate: (fn: (state: OfflineStore) => void) => () => void;
        onFinishHydration: (fn: (state: OfflineStore) => void) => () => void;
        getOptions: () => Partial<import("zustand/middleware").PersistOptions<OfflineStore, OfflineStore>>;
    };
}>;
export {};
