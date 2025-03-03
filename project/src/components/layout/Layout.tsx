import React, { useState, useEffect } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useNotificationStore } from '../../store/notificationStore';
import Sidebar from './Sidebar';
import Header from './Header';
import { subscribeToNotifications } from '../../lib/supabase';

const Layout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, initialized } = useAuthStore();
  const { fetchNotifications, addNotification } = useNotificationStore();

  useEffect(() => {
    if (user) {
      // Fetch notifications
      fetchNotifications(user.id);
      
      // Subscribe to real-time notifications
      const subscription = subscribeToNotifications(user.id, (payload) => {
        if (payload.new) {
          addNotification(payload.new);
        }
      });
      
      return () => {
        subscription.unsubscribe();
      };
    }
  }, [user, fetchNotifications, addNotification]);

  if (!initialized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Mobile sidebar */}
      <div 
        className={`md:hidden fixed inset-0 z-40 ${
          sidebarOpen ? 'block' : 'hidden'
        }`}
      >
        <div 
          className="fixed inset-0 bg-gray-600 bg-opacity-75"
          onClick={() => setSidebarOpen(false)}
        ></div>
        <div className="fixed inset-y-0 left-0 flex flex-col z-40 max-w-xs w-full">
          <Sidebar />
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden md:flex md:flex-shrink-0">
        <Sidebar />
      </div>

      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 overflow-y-auto bg-gray-50 p-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;