// src/components/NotificationCenter.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Bell, X, Check, CheckCheck, Trash2 } from 'lucide-react';
import { useNotificationStore, Notification, getNotificationIcon } from '../store/notificationStore';
import { format } from 'date-fns';

export function NotificationCenter() {
  const { notifications, unreadCount, fetchNotifications, markAsRead, markAllAsRead, deleteNotification, clearAllNotifications } = useNotificationStore();
  const [isOpen, setIsOpen] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    // Fetch notifications initially
    fetchNotifications();
    
    // Set up real-time subscription
    useNotificationStore.getState().subscribeToNotifications();
    
    // Clean up subscription on unmount
    return () => {
      useNotificationStore.getState().unsubscribeFromNotifications();
    };
  }, [fetchNotifications]);

  useEffect(() => {
    // Close dropdown when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
    
    // Additional handling based on notification type
    switch (notification.type) {
      case 'team_invite':
        // Navigate to teams page or show invitation modal
        break;
      case 'task_assignment':
        // Navigate to task view
        break;
      default:
        break;
    }
  };

  return (
    <div className="relative" ref={notificationRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-medium text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>
      
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 max-h-[80vh] overflow-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg z-50 border border-gray-200 dark:border-gray-700">          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <h3 className="font-medium text-gray-800 dark:text-white">
              Notifications 
              {unreadCount > 0 && <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">({unreadCount} unread)</span>}
            </h3>
            <div className="flex space-x-2">
              {/* Test button - can be removed in production */}
              <button
                onClick={() => {
                  useNotificationStore.getState().createTestNotification();
                }}
                className="text-green-500 hover:text-green-600 dark:text-green-400 dark:hover:text-green-300"
                title="Create test notification"
              >
                <Bell size={16} />
              </button>
              
              {unreadCount > 0 && (
                <button
                  onClick={() => markAllAsRead()}
                  className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
                  title="Mark all as read"
                >
                  <CheckCheck size={16} />
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  onClick={() => {
                    if (window.confirm('Are you sure you want to clear all notifications?')) {
                      clearAllNotifications();
                      setIsOpen(false);
                    }
                  }}
                  className="text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300"
                  title="Clear all notifications"
                >
                  <Trash2 size={16} />
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                title="Close"
              >
                <X size={16} />
              </button>
            </div>
          </div>
          
          <div>
            {notifications.length > 0 ? (
              notifications.map(notification => (
                <div
                  key={notification.id}
                  className={`p-4 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer ${
                    !notification.read ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                        <span>{getNotificationIcon(notification.type)}</span>
                      </div>
                      <div>
                        <p className="font-medium text-sm text-gray-800 dark:text-gray-200">
                          {notification.title}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                          {format(new Date(notification.createdAt), 'MMM d, yyyy h:mm a')}
                        </p>
                      </div>
                    </div>
                    <div className="flex shrink-0 ml-2">
                      {!notification.read && (
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            markAsRead(notification.id);
                          }}
                          className="text-blue-500 hover:text-blue-600 p-1 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/30"
                          title="Mark as read"
                        >
                          <Check size={14} />
                        </button>
                      )}
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNotification(notification.id);
                        }}
                        className="text-red-500 hover:text-red-600 p-1 rounded-full hover:bg-red-100 dark:hover:bg-red-900/30"
                        title="Delete notification"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-6 text-center">
                <div className="w-12 h-12 mx-auto rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mb-3">
                  <Bell className="w-6 h-6 text-gray-400 dark:text-gray-500" />
                </div>
                <p className="text-gray-500 dark:text-gray-400">
                  No notifications yet
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default NotificationCenter;
