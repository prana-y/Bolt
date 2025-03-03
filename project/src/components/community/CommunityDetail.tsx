import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useCommunityStore } from '../../store/communityStore';
import { useAuthStore } from '../../store/authStore';
import { Users, Plus, MessageSquare } from 'lucide-react';
import ChannelList from './ChannelList';
import ChatArea from '../chat/ChatArea';

const CommunityDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { 
    currentCommunity, 
    fetchCommunity, 
    fetchChannels, 
    channels, 
    currentChannel, 
    setCurrentChannel,
    fetchMembers,
    members,
    joinCommunity,
    leaveCommunity,
    loading 
  } = useCommunityStore();
  const { user } = useAuthStore();
  const [showMembers, setShowMembers] = useState(false);

  useEffect(() => {
    if (id) {
      fetchCommunity(id);
      fetchChannels(id);
      fetchMembers(id);
    }
  }, [id, fetchCommunity, fetchChannels, fetchMembers]);

  useEffect(() => {
    if (channels.length > 0 && !currentChannel) {
      setCurrentChannel(channels[0]);
    }
  }, [channels, currentChannel, setCurrentChannel]);

  const isMember = user && members.some(member => member.user_id === user.id);
  const userRole = user && members.find(member => member.user_id === user.id)?.role;

  const handleJoin = () => {
    if (user && id) {
      joinCommunity(id, user.id);
    }
  };

  const handleLeave = () => {
    if (user && id) {
      leaveCommunity(id, user.id);
    }
  };

  if (loading && !currentCommunity) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!currentCommunity) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Community not found</h2>
        <p className="text-gray-500 mb-6">The community you're looking for doesn't exist or you don't have access.</p>
        <Link
          to="/communities"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Back to Communities
        </Link>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="bg-white rounded-lg shadow mb-4 overflow-hidden">
        <div className="h-40 bg-indigo-100 relative">
          {currentCommunity.image_url ? (
            <img
              src={currentCommunity.image_url}
              alt={currentCommunity.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Users className="h-16 w-16 text-indigo-500" />
            </div>
          )}
        </div>
        <div className="p-4">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{currentCommunity.name}</h1>
              <p className="text-gray-500 mt-1">{currentCommunity.description}</p>
            </div>
            <div>
              {isMember ? (
                <button
                  onClick={handleLeave}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Leave Community
                </button>
              ) : (
                <button
                  onClick={handleJoin}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Join Community
                </button>
              )}
            </div>
          </div>
          <div className="flex items-center mt-4 space-x-4">
            <button
              onClick={() => setShowMembers(false)}
              className={`flex items-center px-3 py-1 rounded-md ${
                !showMembers ? 'bg-indigo-100 text-indigo-800' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <MessageSquare className="h-4 w-4 mr-1" />
              <span>Channels</span>
            </button>
            <button
              onClick={() => setShowMembers(true)}
              className={`flex items-center px-3 py-1 rounded-md ${
                showMembers ? 'bg-indigo-100 text-indigo-800' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Users className="h-4 w-4 mr-1" />
              <span>Members ({currentCommunity.member_count})</span>
            </button>
          </div>
        </div>
      </div>

      {!isMember && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                You need to join this community to participate in discussions.
              </p>
            </div>
          </div>
        </div>
      )}

      {showMembers ? (
        <div className="bg-white rounded-lg shadow flex-grow overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Members</h2>
          </div>
          <div className="p-4 overflow-y-auto max-h-[calc(100vh-400px)]">
            <ul className="divide-y divide-gray-200">
              {members.map((member) => (
                <li key={member.user_id} className="py-4 flex items-center">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center mr-4">
                    {member.user?.avatar_url ? (
                      <img 
                        src={member.user.avatar_url} 
                        alt={member.user.username} 
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-sm font-semibold text-indigo-800">
                        {member.user?.username?.charAt(0).toUpperCase() || 'U'}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {member.user?.username}
                    </p>
                    <p className="text-sm text-gray-500 truncate">
                      {member.role === 'admin' ? 'Admin' : member.role === 'moderator' ? 'Moderator' : 'Member'}
                    </p>
                  </div>
                  {user && member.user_id !== user.id && (
                    <Link
                      to={`/messages?userId=${member.user_id}`}
                      className="ml-2 inline-flex items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Message
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow flex-grow overflow-hidden flex">
          <div className="w-64 border-r border-gray-200 flex flex-col">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-lg font-medium text-gray-900">Channels</h2>
              {isMember && (userRole === 'admin' || userRole === 'moderator') && (
                <Link
                  to={`/community/${id}/create-channel`}
                  className="text-indigo-600 hover:text-indigo-900"
                >
                  <Plus className="h-5 w-5" />
                </Link>
              )}
            </div>
            <div className="flex-grow overflow-y-auto">
              <ChannelList 
                channels={channels} 
                currentChannelId={currentChannel?.id} 
                onSelectChannel={setCurrentChannel}
              />
            </div>
          </div>
          <div className="flex-grow flex flex-col">
            {currentChannel ? (
              <ChatArea 
                channelId={currentChannel.id} 
                channelName={currentChannel.name}
                isMember={isMember || false}
              />
            ) : (
              <div className="flex-grow flex items-center justify-center p-6 text-center">
                <div>
                  <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No channel selected</h3>
                  <p className="text-gray-500">
                    Select a channel from the sidebar to start chatting
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CommunityDetail;