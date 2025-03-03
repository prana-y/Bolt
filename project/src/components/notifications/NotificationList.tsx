import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useNotificationStore } from '../../store/notificationStore';
import { useAuthStore } from '../../store/authStore';
import { format } from 'date-fns';
import { Bell, CheckCircle } from 'lucide-react';

const NotificationList: React.FC = () => {
  const { notifications, fetchNotifications, markAsRead, markAllAsRead, loading } = useNotificationStore();
  const { user } = useAuthStore();

  useEffect(() => {
    if (user) {
      fetchNotifications(user.id);
    }
  }, [user, fetchNotifications]);

  const handleMarkAllAsRead = () => {
    if (user) {
      markAllAsRead(user.id);
    }
  };

  const getNotificationLink = (notification: any) => {
    if (notification.reference_type === 'message' && notification.reference_id) {
      return `/community/${notification.reference_id.split(':')[0]}`;
    } else if (notification.reference_type === 'direct_message' && notification.reference_id) {
      return `/messages/${notification.reference_id}`;
    } else if (notification.reference_type === 'job_post' && notification.reference_id) {
      return `/jobs/${notification.reference_id}`;
    } else {
      return '/notifications';
    }
  };

  if (loading && notifications.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Notifications</h2>
        {notifications.some(n => !n.is_read) && (
          <button
            onClick={handleMarkAllAsRead}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Mark all as read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications</h3>
          <p className="text-gray-500">
            You're all caught up! You'll receive notifications for new messages, mentions, and more.
          </p>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden rounded-md">
          <ul className="divide-y divide-gray-200">
            {notifications.map((notification) => (
              <li key={notification.id}>
                <Link
                  to={getNotificationLink(notification)}
                  className={`block hover:bg-gray-50 ${!notification.is_read ? 'bg-indigo-50' : ''}`}
                  onClick={() => !notification.is_read && markAsRead(notification.id)}
                >
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center">
                      <div className={`flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center ${!notification.is_read ? 'bg-indigo-200' : ''}`}>
                        <Bell className={`h-5 w-5 ${!notification.is_read ? 'text-indigo-600' : 'text-indigo-400'}`} />
                      </div>
                      <div className="ml-4 flex-1">
                        <div className="text-sm font-medium text-gray-900">
                          {notification.content}
                        </div>
                        <div className="mt-1 text-sm text-gray-500">
                          {format(new Date(notification.created_at), 'MMM d, yyyy h:mm a')}
                        </div>
                      </div>
                      {!notification.is_read && (
                        <div className="ml-2 flex-shrink-0">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                            New
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default NotificationList;