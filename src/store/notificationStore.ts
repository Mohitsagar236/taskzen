// Clear stale persisted notification store to prevent circular JSON errors
if (typeof window !== 'undefined') {
  localStorage.removeItem('notification-store');
}

// src/store/notificationStore.ts
import { create } from 'zustand';
// import persist removed (no persistence for notification store)
import { supabase } from '../lib/supabase';
import { useUserStore } from './userStore';
import toast from 'react-hot-toast';
import { RealtimeChannel } from '@supabase/supabase-js';

export interface Notification {
  id: string;
  userId: string;
  type: 'team_invite' | 'team_update' | 'team_delete' | 'member_added' | 'member_removed' | 'member_role_updated' | 'task_shared' | 'task_assignment';
  title: string;
  message: string;
  metadata: any;
  read: boolean;
  createdAt: Date;
}

interface NotificationStore {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  subscription: RealtimeChannel | null;
  fetchNotifications: () => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
  clearAllNotifications: () => Promise<void>;
  showToast: (notification: Partial<Notification>) => void;
  subscribeToNotifications: () => void;
  unsubscribeFromNotifications: () => void;
  createTestNotification: () => Promise<any>;
}

// Helper function to get icon for notification type
export const getNotificationIcon = (type: Notification['type']): string => {
  switch (type) {
    case 'team_invite':
      return '👋';
    case 'team_update':
      return '📝';
    case 'team_delete':
      return '🗑️';
    case 'member_added':
      return '➕';
    case 'member_removed':
      return '➖';
    case 'member_role_updated':
      return '🔄';
    case 'task_shared':
      return '🔗';
    case 'task_assignment':
      return '📌';
    default:
      return '📣';
  }
};

export const useNotificationStore = create<NotificationStore>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  loading: false,
  error: null,
  subscription: null,
  
  // Helper function to create a test notification (for testing real-time functionality)
  createTestNotification: async () => {
    const user = useUserStore.getState().user;
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('notifications')
        .insert([
          {
            user_id: user.id,
            type: 'team_update',
            title: 'Test Notification',
            message: `This is a test notification created at ${new Date().toLocaleTimeString()}`,
            metadata: { test: true },
            read: false
          }
        ])
        .select();
        
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating test notification:', error);
      throw error;
    }
  },

  fetchNotifications: async () => {
    const user = useUserStore.getState().user;
    if (!user) return;

    try {
      set({ loading: true, error: null });
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        if (error.code === '42P01') {
          console.warn('Notifications table not found, disabling notifications');
          set({ notifications: [], unreadCount: 0, loading: false });
          return;
        }
        throw error;
      }

      const formatted = (data || []).map(n => ({
        id: n.id,
        userId: n.user_id,
        type: n.type,
        title: n.title,
        message: n.message,
        metadata: n.metadata || {},
        read: n.read,
        createdAt: new Date(n.created_at)
      }));

      set({
        notifications: formatted,
        unreadCount: formatted.filter(n => !n.read).length,
        loading: false
      });
    } catch (err) {
      console.error('Error fetching notifications:', err);
      set({ error: 'Failed to fetch notifications', loading: false });
    }
  },

  subscribeToNotifications: () => {
    const user = useUserStore.getState().user;
    if (!user) return;
    try {
      get().unsubscribeFromNotifications();
      const subscription = supabase
        .channel(`notifications:${user.id}`)
        .on('postgres_changes', 
          { schema: 'public', table: 'notifications', event: '*', filter: `user_id=eq.${user.id}` },
          () => {
            // handle real-time updates
          }
        )
        .subscribe();
      set({ subscription });
    } catch (err: any) {
      if (err.code === '42P01') {
        console.warn('Skipping notifications subscription, table not found');
      } else {
        console.error('Error subscribing to notifications:', err);
      }
    }
  },

  unsubscribeFromNotifications: () => {
    const { subscription } = get();
    if (subscription) {
      subscription.unsubscribe();
      set({ subscription: null });
    }
  },

  markAsRead: async (notificationId) => {
    try {
      await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId);

      set(state => {
        const updatedNotifications = state.notifications.map(n => 
          n.id === notificationId ? { ...n, read: true } : n
        );
        return {
          notifications: updatedNotifications,
          unreadCount: updatedNotifications.filter(n => !n.read).length
        };
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  },

  markAllAsRead: async () => {
    const user = useUserStore.getState().user;
    if (!user) return;

    try {
      await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', user.id)
        .eq('read', false);

      set(state => ({
        notifications: state.notifications.map(n => ({ ...n, read: true })),
        unreadCount: 0
      }));
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  },

  deleteNotification: async (notificationId) => {
    try {
      await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);

      set(state => {
        const updatedNotifications = state.notifications.filter(n => n.id !== notificationId);
        return {
          notifications: updatedNotifications,
          unreadCount: updatedNotifications.filter(n => !n.read).length
        };
      });
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  },

  clearAllNotifications: async () => {
    const user = useUserStore.getState().user;
    if (!user) return;

    try {
      await supabase
        .from('notifications')
        .delete()
        .eq('user_id', user.id);

      set({ notifications: [], unreadCount: 0 });
    } catch (error) {
      console.error('Error clearing notifications:', error);
    }
  },

  showToast: (notification) => {
    const icon = getNotificationIcon(notification.type as Notification['type']);
    toast(notification.message || '', {
      icon,
      duration: 5000
    });
  }
}));
