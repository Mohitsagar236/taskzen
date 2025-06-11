import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Task } from '../types';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

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

export const useOfflineStore = create<OfflineStore>()(
  persist(
    (set, get) => ({
      isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
      pendingChanges: [],
      offlineData: {
        tasks: [],
        comments: [],
        tags: [],
      },

      setOnlineStatus: (status) => {
        const currentStatus = get().isOnline;
        // Only update and show toast if status actually changed
        if (currentStatus !== status) {
          const wasOffline = !currentStatus;
          set({ isOnline: status });
          
          if (status && wasOffline) {
            // Auto-sync when coming back online
            get().syncChanges().catch(err => {
              console.error("Failed to sync changes:", err);
            });
            toast.success('Back online! Syncing changes...');
          } else if (!status) {
            toast.warning('You are offline. Changes will sync when you reconnect.');
          }
        }
      },

      addPendingChange: (change) => {
        const pendingChange: PendingChange = {
          id: Math.random().toString(36).substr(2, 9),
          timestamp: Date.now(),
          ...change,
        };

        set((state) => ({
          pendingChanges: [...state.pendingChanges, pendingChange],
        }));
      },

      syncChanges: async () => {
        const { pendingChanges } = get();
        if (pendingChanges.length === 0) return;

        const sortedChanges = [...pendingChanges].sort((a, b) => a.timestamp - b.timestamp);
        const errors: string[] = [];

        for (const change of sortedChanges) {
          try {
            switch (change.type) {
              case 'create':
                await supabase.from(change.entity + 's').insert(change.data);
                break;
              case 'update':
                await supabase
                  .from(change.entity + 's')
                  .update(change.data)
                  .eq('id', change.data.id);
                break;
              case 'delete':
                await supabase
                  .from(change.entity + 's')
                  .delete()
                  .eq('id', change.data.id);
                break;
            }
          } catch (error) {
            console.error(`Sync error for ${change.entity}:`, error);
            errors.push(`Failed to sync ${change.entity}: ${error.message}`);
          }
        }

        // Remove successfully synced changes
        set((state) => ({
          pendingChanges: state.pendingChanges.filter((change) =>
            errors.some((error) => error.includes(change.entity))
          ),
        }));

        if (errors.length > 0) {
          toast.error(`Some changes failed to sync. They will be retried later.`);
        } else {
          toast.success('All changes synced successfully!');
        }
      },

      cacheData: (data, type) => {
        set((state) => ({
          offlineData: {
            ...state.offlineData,
            [type]: data,
          },
        }));
      },

      getOfflineData: (type) => {
        return get().offlineData[type];
      },
    }),
    {
      name: 'offline-store',
    }
  )
);

// Set up online/offline listeners
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    useOfflineStore.getState().setOnlineStatus(true);
  });
  
  window.addEventListener('offline', () => {
    useOfflineStore.getState().setOnlineStatus(false);
  });
}