import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

const useNotificationStore = create(
  persist(
    (set, get) => ({
      notifications: [],
      unreadCount: 0,
      isLoading: false,
      error: null,

      // Fetch notifications
      fetchNotifications: async () => {
        set({ isLoading: true, error: null });
        try {
          // For demo purposes, we'll use this mock data
          // In a real app, you would fetch from the server:
          // const response = await api.get('/admin/notifications');
          
          const mockNotifications = [
            {
              id: 1,
              title: 'New User Registration',
              message: 'John Doe has registered as a new farmer',
              createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(), // 10 minutes ago
              read: false,
              type: 'user'
            },
            {
              id: 2,
              title: 'System Update Completed',
              message: 'The system has been updated to version 2.1.0',
              createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(), // 1 hour ago
              read: false,
              type: 'system'
            },
            {
              id: 3,
              title: 'Low Milk Production Alert',
              message: 'Milk production dropped by 15% in the last week',
              createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), // 3 hours ago
              read: true,
              type: 'alert'
            },
            {
              id: 4,
              title: 'Database Backup Successful',
              message: 'Weekly database backup has been completed',
              createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
              read: true,
              type: 'system'
            },
            {
              id: 5,
              title: 'New Disease Prediction',
              message: 'A new disease prediction has been generated for cattle #C12345',
              createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // 12 hours ago
              read: false,
              type: 'health'
            }
          ];

          // Update the store with notifications
          set({
            notifications: mockNotifications,
            unreadCount: mockNotifications.filter(n => !n.read).length,
            isLoading: false
          });
        } catch (error) {
          console.error('Error fetching notifications:', error);
          set({ 
            error: error.message || 'Failed to fetch notifications', 
            isLoading: false 
          });
        }
      },

      // Mark notification as read
      markAsRead: async (notificationId) => {
        try {
          // In a real app, you would update on the server:
          // await api.patch(`/admin/notifications/${notificationId}/read`);

          // Update local state
          const updatedNotifications = get().notifications.map(notification => 
            notification.id === notificationId 
              ? { ...notification, read: true } 
              : notification
          );
          
          set({ 
            notifications: updatedNotifications,
            unreadCount: updatedNotifications.filter(n => !n.read).length
          });
        } catch (error) {
          console.error('Error marking notification as read:', error);
        }
      },

      // Mark all notifications as read
      markAllAsRead: async () => {
        try {
          // In a real app, you would update on the server:
          // await api.patch('/admin/notifications/mark-all-read');
          
          // Update local state
          const updatedNotifications = get().notifications.map(notification => ({
            ...notification,
            read: true
          }));
          
          set({ 
            notifications: updatedNotifications,
            unreadCount: 0
          });
        } catch (error) {
          console.error('Error marking all notifications as read:', error);
        }
      },

      // Clear a notification
      removeNotification: async (notificationId) => {
        try {
          // In a real app, you would delete from the server:
          // await api.delete(`/admin/notifications/${notificationId}`);
          
          // Update local state
          const updatedNotifications = get().notifications.filter(
            notification => notification.id !== notificationId
          );
          
          set({ 
            notifications: updatedNotifications,
            unreadCount: updatedNotifications.filter(n => !n.read).length
          });
        } catch (error) {
          console.error('Error removing notification:', error);
        }
      }
    }),
    {
      name: 'notifications-storage',
      partialize: (state) => ({ 
        notifications: state.notifications,
        unreadCount: state.unreadCount
      }),
    }
  )
);

export default useNotificationStore; 