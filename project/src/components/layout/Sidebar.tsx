import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useNotificationStore } from '../../store/notificationStore';
import { 
  Home, 
  Users, 
  MessageSquare, 
  Briefcase, 
  BookOpen, 
  Bell, 
  Settings, 
  LogOut,
  PlusCircle
} from 'lucide-react';

const Sidebar: React.FC = () => {
  const location = useLocation();
  const { user, signOut } = useAuthStore();
  const { unreadCount } = useNotificationStore();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="h-screen w-64 bg-indigo-900 text-white flex flex-col">
      <div className="p-4 border-b border-indigo-800">
        <h1 className="text-xl font-bold">Support Community</h1>
      </div>

      <div className="p-4 border-b border-indigo-800 flex items-center space-x-3">
        <div className="w-10 h-10 rounded-full bg-indigo-700 flex items-center justify-center">
          {user?.avatar_url ? (
            <img 
              src={user.avatar_url} 
              alt={user.username} 
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <span className="text-lg font-semibold">
              {user?.username?.charAt(0).toUpperCase() || 'U'}
            </span>
          )}
        </div>
        <div>
          <p className="font-medium">{user?.username || 'User'}</p>
          <p className="text-xs text-indigo-300">Online</p>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        <Link
          to="/dashboard"
          className={`flex items-center space-x-3 p-2 rounded-md ${
            isActive('/dashboard') 
              ? 'bg-indigo-800 text-white' 
              : 'text-indigo-200 hover:bg-indigo-800 hover:text-white'
          }`}
        >
          <Home size={20} />
          <span>Dashboard</span>
        </Link>

        <Link
          to="/communities"
          className={`flex items-center space-x-3 p-2 rounded-md ${
            isActive('/communities') || location.pathname.startsWith('/community/')
              ? 'bg-indigo-800 text-white' 
              : 'text-indigo-200 hover:bg-indigo-800 hover:text-white'
          }`}
        >
          <Users size={20} />
          <span>Communities</span>
        </Link>

        <Link
          to="/messages"
          className={`flex items-center space-x-3 p-2 rounded-md ${
            isActive('/messages') || location.pathname.startsWith('/messages/')
              ? 'bg-indigo-800 text-white' 
              : 'text-indigo-200 hover:bg-indigo-800 hover:text-white'
          }`}
        >
          <MessageSquare size={20} />
          <span>Messages</span>
        </Link>

        <Link
          to="/jobs"
          className={`flex items-center space-x-3 p-2 rounded-md ${
            isActive('/jobs') || location.pathname.startsWith('/jobs/')
              ? 'bg-indigo-800 text-white' 
              : 'text-indigo-200 hover:bg-indigo-800 hover:text-white'
          }`}
        >
          <Briefcase size={20} />
          <span>Job Board</span>
        </Link>

        <Link
          to="/resources"
          className={`flex items-center space-x-3 p-2 rounded-md ${
            isActive('/resources') || location.pathname.startsWith('/resources/')
              ? 'bg-indigo-800 text-white' 
              : 'text-indigo-200 hover:bg-indigo-800 hover:text-white'
          }`}
        >
          <BookOpen size={20} />
          <span>Resources</span>
        </Link>

        <Link
          to="/notifications"
          className={`flex items-center space-x-3 p-2 rounded-md ${
            isActive('/notifications')
              ? 'bg-indigo-800 text-white' 
              : 'text-indigo-200 hover:bg-indigo-800 hover:text-white'
          }`}
        >
          <div className="relative">
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </div>
          <span>Notifications</span>
        </Link>

        <div className="pt-4 mt-4 border-t border-indigo-800">
          <Link
            to="/create-community"
            className="flex items-center space-x-3 p-2 rounded-md text-indigo-200 hover:bg-indigo-800 hover:text-white"
          >
            <PlusCircle size={20} />
            <span>Create Community</span>
          </Link>
          
          <Link
            to="/settings"
            className={`flex items-center space-x-3 p-2 rounded-md ${
              isActive('/settings')
                ? 'bg-indigo-800 text-white' 
                : 'text-indigo-200 hover:bg-indigo-800 hover:text-white'
            }`}
          >
            <Settings size={20} />
            <span>Settings</span>
          </Link>

          <button
            onClick={() => signOut()}
            className="w-full flex items-center space-x-3 p-2 rounded-md text-indigo-200 hover:bg-indigo-800 hover:text-white"
          >
            <LogOut size={20} />
            <span>Sign Out</span>
          </button>
        </div>
      </nav>
    </div>
  );
};

export default Sidebar;