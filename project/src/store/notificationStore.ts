import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { Notification } from '../types';

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  
  fetchNotifications: (userId: string) => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: (userId: string) => Promise<void>;
  addNotification: (notification: Notification) => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  loading: false,
  error: null,
  
  fetchNotifications: async (userId) => {
    try {
      set({ loading: true });
      
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      const unreadCount = data.filter(n => !n.is_read).length;
      
      set({ 
        notifications: data || [],
        unreadCount
      });
    } catch (error: any) {
      set({ error: error.message });
      console.error('Fetch notifications error:', error);
    } finally {
      set({ loading: false });
    }
  },
  
  markAsRead: async (id) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', id);
        
      if (error) throw error;
      
      // Update local state
      const { notifications } = get();
      const updatedNotifications = notifications.map(notification => 
        notification.id === id ? { ...notification, is_read: true } : notification
      );
      
      const unreadCount = updatedNotifications.filter(n => !n.is_read).length;
      
      set({ 
        notifications: updatedNotifications,
        unreadCount
      });
    } catch (error: any) {
      console.error('Mark notification as read error:', error);
    }
  },
  
  markAllAsRead: async (userId) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', userId)
        .eq('is_read', false);
        
      if (error) throw error;
      
      // Update local state
      const { notifications } = get();
      const updatedNotifications = notifications.map(notification => 
        ({ ...notification, is_read: true })
      );
      
      set({ 
        notifications: updatedNotifications,
        unreadCount: 0
      });
    } catch (error: any) {
      console.error('Mark all notifications as read error:', error);
    }
  },
  
  addNotification: (notification) => {
    const { notifications, unreadCount } = get();
    set({ 
      notifications: [notification, ...notifications],
      unreadCount: unreadCount + 1
    });
  }
}));