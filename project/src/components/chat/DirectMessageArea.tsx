import React, { useState, useEffect, useRef } from 'react';
import { useMessageStore } from '../../store/messageStore';
import { useAuthStore } from '../../store/authStore';
import { format } from 'date-fns';
import { Send, Smile } from 'lucide-react';
import { subscribeToDirectMessages } from '../../lib/supabase';
import EmojiPicker from 'emoji-picker-react';
import type { DirectMessage } from '../../types';

interface DirectMessageAreaProps {
  conversationId: string;
  otherUser: {
    id: string;
    username: string;
    avatar_url?: string;
  };
}

const DirectMessageArea: React.FC<DirectMessageAreaProps> = ({ conversationId, otherUser }) => {
  const [message, setMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const { fetchDirectMessages, directMessages, sendDirectMessage, addDirectMessage, loading } = useMessageStore();
  const { user } = useAuthStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchDirectMessages(conversationId);
    
    // Subscribe to real-time messages
    const subscription = subscribeToDirectMessages(conversationId, (payload) => {
      if (payload.new) {
        addDirectMessage(payload.new as DirectMessage);
      }
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, [conversationId, fetchDirectMessages, addDirectMessage]);

  useEffect(() => {
    scrollToBottom();
  }, [directMessages]);

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
    
    await sendDirectMessage(message, conversationId, user.id);
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
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center mr-3">
            {otherUser.avatar_url ? (
              <img 
                src={otherUser.avatar_url} 
                alt={otherUser.username} 
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <span className="text-sm font-semibold text-indigo-800">
                {otherUser.username.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <h2 className="text-lg font-medium text-gray-900">{otherUser.username}</h2>
        </div>
      </div>
      
      <div className="flex-grow overflow-y-auto p-4 space-y-4">
        {loading && directMessages.length === 0 ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : directMessages.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            No messages yet. Start a conversation!
          </div>
        ) : (
          directMessages.map((msg) => (
            <div 
              key={msg.id} 
              className={`flex ${msg.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`max-w-xs sm:max-w-md lg:max-w-lg rounded-lg px-4 py-2 ${
                  msg.sender_id === user?.id 
                    ? 'bg-indigo-100 text-indigo-900' 
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
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
    </div>
  );
};

export default DirectMessageArea;