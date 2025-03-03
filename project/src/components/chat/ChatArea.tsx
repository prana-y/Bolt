import React, { useState, useEffect, useRef } from 'react';
import { useCommunityStore } from '../../store/communityStore';
import { useAuthStore } from '../../store/authStore';
import { format } from 'date-fns';
import { Send, Smile } from 'lucide-react';
import { subscribeToChannel } from '../../lib/supabase';
import EmojiPicker from 'emoji-picker-react';
import type { Message } from '../../types';

interface ChatAreaProps {
  channelId: string;
  channelName: string;
  isMember: boolean;
}

const ChatArea: React.FC<ChatAreaProps> = ({ channelId, channelName, isMember }) => {
  const [message, setMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const { fetchMessages, messages, sendMessage, addMessage, loading } = useCommunityStore();
  const { user } = useAuthStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchMessages(channelId);
    
    // Subscribe to real-time messages
    const subscription = subscribeToChannel(channelId, (payload) => {
      if (payload.new) {
        addMessage(payload.new as Message);
      }
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, [channelId, fetchMessages, addMessage]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Close emoji picker when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!message.trim() || !user) return;
    
    await sendMessage(message, channelId, user.id);
    setMessage('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleEmojiClick = (emojiData: any) => {
    setMessage(prev => prev + emojiData.emoji);
    setShowEmojiPicker(false);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-medium text-gray-900">#{channelName}</h2>
      </div>
      
      <div className="flex-grow overflow-y-auto p-4 space-y-4">
        {loading && messages.length === 0 ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            No messages yet. Be the first to send a message!
          </div>
        ) : (
          messages.map((msg) => (
            <div 
              key={msg.id} 
              className={`flex ${msg.user_id === user?.id ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`max-w-xs sm:max-w-md lg:max-w-lg rounded-lg px-4 py-2 ${
                  msg.user_id === user?.id 
                    ? 'bg-indigo-100 text-indigo-900' 
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                {msg.user_id !== user?.id && (
                  <div className="flex items-center mb-1">
                    <div className="w-5 h-5 rounded-full bg-indigo-500 flex items-center justify-center mr-2">
                      {msg.user?.avatar_url ? (
                        <img 
                          src={msg.user.avatar_url} 
                          alt={msg.user.username} 
                          className="w-5 h-5 rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-xs font-semibold text-white">
                          {msg.user?.username?.charAt(0).toUpperCase() || 'U'}
                        </span>
                      )}
                    </div>
                    <span className="text-xs font-medium">{msg.user?.username}</span>
                  </div>
                )}
                <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                <div className="text-xs text-gray-500 mt-1 text-right">
                  {format(new Date(msg.created_at), 'h:mm a')}
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {isMember ? (
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-end">
            <div className="relative flex-grow">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a message..."
                className="w-full border border-gray-300 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                rows={2}
              />
              <div className="absolute bottom-2 right-2 flex space-x-1">
                <div className="relative" ref={emojiPickerRef}>
                  <button
                    type="button"
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className="text-gray-500 hover:text-gray-700 focus:outline-none"
                  >
                    <Smile className="h-5 w-5" />
                  </button>
                  {showEmojiPicker && (
                    <div className="absolute bottom-8 right-0 z-10">
                      <EmojiPicker onEmojiClick={handleEmojiClick} />
                    </div>
                  )}
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={handleSendMessage}
              disabled={!message.trim()}
              className="ml-2 inline-flex items-center p-2 border border-transparent rounded-full shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
        </div>
      ) : (
        <div className="p-4 border-t border-gray-200 bg-gray-50 text-center text-gray-500">
          You need to join this community to send messages
        </div>
      )}
    </div>
  );
};

export default ChatArea;