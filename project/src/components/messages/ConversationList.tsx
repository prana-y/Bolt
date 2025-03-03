import React, { useEffect } from 'react';
import { useMessageStore } from '../../store/messageStore';
import { useAuthStore } from '../../store/authStore';
import { format } from 'date-fns';
import { MessageSquare, UserPlus } from 'lucide-react';
import type { User } from '../../types';

interface ConversationListProps {
  onSelectConversation: (conversationId: string, otherUser: User) => void;
  selectedConversationId?: string;
}

const ConversationList: React.FC<ConversationListProps> = ({ 
  onSelectConversation, 
  selectedConversationId 
}) => {
  const { conversations, fetchConversations, loading } = useMessageStore();
  const { user } = useAuthStore();

  useEffect(() => {
    if (user) {
      fetchConversations(user.id);
    }
  }, [user, fetchConversations]);

  if (loading && conversations.length === 0) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  // Get the other user in each conversation
  const getOtherUser = (conversation: any) => {
    return conversation.participants.find((p: User) => p.id !== user?.id);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-lg font-medium text-gray-900">Messages</h2>
        <button className="text-indigo-600 hover:text-indigo-900">
          <UserPlus className="h-5 w-5" />
        </button>
      </div>
      
      <div className="flex-grow overflow-y-auto">
        {conversations.length === 0 ? (
          <div className="text-center py-8 px-4">
            <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No conversations yet</h3>
            <p className="text-gray-500 mb-4">
              Start messaging with community members
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {conversations.map((conversation) => {
              const otherUser = getOtherUser(conversation);
              if (!otherUser) return null;
              
              return (
                <li key={conversation.id}>
                  <button
                    onClick={() => onSelectConversation(conversation.id, otherUser)}
                    className={`w-full flex items-center p-4 hover:bg-gray-50 ${
                      selectedConversationId === conversation.id ? 'bg-indigo-50' : ''
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center mr-4">
                      {otherUser.avatar_url ? (
                        <img 
                          src={otherUser.avatar_url} 
                          alt={otherUser.username} 
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-sm font-semibold text-indigo-800">
                          {otherUser.username.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {otherUser.username}
                      </p>
                      {conversation.last_message && (
                        <p className="text-sm text-gray-500 truncate">
                          {conversation.last_message.content}
                        </p>
                      )}
                    </div>
                    {conversation.last_message && (
                      <div className="ml-2 text-xs text-gray-500">
                        {format(new Date(conversation.last_message.created_at), 'MMM d')}
                      </div>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
};

export default ConversationList;