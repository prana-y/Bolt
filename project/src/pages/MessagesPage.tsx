import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useMessageStore } from '../store/messageStore';
import { useAuthStore } from '../store/authStore';
import ConversationList from '../components/messages/ConversationList';
import DirectMessageArea from '../components/chat/DirectMessageArea';
import { MessageSquare } from 'lucide-react';
import type { User } from '../types';

const MessagesPage: React.FC = () => {
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [otherUser, setOtherUser] = useState<User | null>(null);
  const { getOrCreateConversation } = useMessageStore();
  const { user } = useAuthStore();
  const location = useLocation();

  useEffect(() => {
    // Check if there's a userId in the query params
    const params = new URLSearchParams(location.search);
    const userId = params.get('userId');
    
    if (userId && user) {
      // Create or get conversation with this user
      const initConversation = async () => {
        const conversation = await getOrCreateConversation(user.id, userId);
        if (conversation) {
          setSelectedConversation(conversation.id);
          // Find the other user in the conversation
          const other = conversation.participants.find(p => p.id !== user.id);
          if (other) {
            setOtherUser(other);
          }
        }
      };
      
      initConversation();
    }
  }, [location.search, user, getOrCreateConversation]);

  const handleSelectConversation = (conversationId: string, user: User) => {
    setSelectedConversation(conversationId);
    setOtherUser(user);
  };

  return (
    <div className="h-full bg-white rounded-lg shadow overflow-hidden flex">
      <div className="w-80 border-r border-gray-200 flex-shrink-0">
        <ConversationList 
          onSelectConversation={handleSelectConversation}
          selectedConversationId={selectedConversation || undefined}
        />
      </div>
      <div className="flex-1">
        {selectedConversation && otherUser ? (
          <DirectMessageArea 
            conversationId={selectedConversation}
            otherUser={otherUser}
          />
        ) : (
          <div className="h-full flex items-center justify-center p-6 text-center">
            <div>
              <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No conversation selected</h3>
              <p className="text-gray-500">
                Select a conversation from the sidebar or start a new one
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessagesPage;