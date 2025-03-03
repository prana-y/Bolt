import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { DirectMessage, Conversation, User } from '../types';

interface MessageState {
  conversations: Conversation[];
  currentConversation: Conversation | null;
  directMessages: DirectMessage[];
  loading: boolean;
  error: string | null;
  
  fetchConversations: (userId: string) => Promise<void>;
  fetchConversation: (id: string) => Promise<void>;
  fetchDirectMessages: (conversationId: string) => Promise<void>;
  
  createConversation: (userId: string, otherUserId: string) => Promise<Conversation | null>;
  sendDirectMessage: (content: string, conversationId: string, senderId: string) => Promise<DirectMessage | null>;
  
  setCurrentConversation: (conversation: Conversation | null) => void;
  addDirectMessage: (message: DirectMessage) => void;
  getOrCreateConversation: (userId: string, otherUserId: string) => Promise<Conversation | null>;
}

export const useMessageStore = create<MessageState>((set, get) => ({
  conversations: [],
  currentConversation: null,
  directMessages: [],
  loading: false,
  error: null,
  
  fetchConversations: async (userId) => {
    try {
      set({ loading: true });
      
      const { data, error } = await supabase
        .from('conversations')
        .select(`
          *,
          participants:conversation_participants(
            user:user_id(*)
          ),
          last_message:direct_messages(
            *
          )
        `)
        .contains('conversation_participants.user_id', [userId])
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      // Format conversations
      const formattedConversations = data.map((conv: any) => ({
        ...conv,
        participants: conv.participants.map((p: any) => p.user),
        last_message: conv.last_message[0] || null
      }));
      
      set({ conversations: formattedConversations });
    } catch (error: any) {
      set({ error: error.message });
      console.error('Fetch conversations error:', error);
    } finally {
      set({ loading: false });
    }
  },
  
  fetchConversation: async (id) => {
    try {
      set({ loading: true });
      
      const { data, error } = await supabase
        .from('conversations')
        .select(`
          *,
          participants:conversation_participants(
            user:user_id(*)
          )
        `)
        .eq('id', id)
        .single();
        
      if (error) throw error;
      
      // Format conversation
      const formattedConversation = {
        ...data,
        participants: data.participants.map((p: any) => p.user)
      };
      
      set({ currentConversation: formattedConversation });
    } catch (error: any) {
      set({ error: error.message });
      console.error('Fetch conversation error:', error);
    } finally {
      set({ loading: false });
    }
  },
  
  fetchDirectMessages: async (conversationId) => {
    try {
      set({ loading: true });
      
      const { data, error } = await supabase
        .from('direct_messages')
        .select(`
          *,
          sender:sender_id(id, username, avatar_url),
          reactions(*)
        `)
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });
        
      if (error) throw error;
      
      set({ directMessages: data || [] });
    } catch (error: any) {
      set({ error: error.message });
      console.error('Fetch direct messages error:', error);
    } finally {
      set({ loading: false });
    }
  },
  
  createConversation: async (userId, otherUserId) => {
    try {
      set({ loading: true });
      
      // Create conversation
      const { data: conversation, error: convError } = await supabase
        .from('conversations')
        .insert({})
        .select()
        .single();
        
      if (convError) throw convError;
      
      // Add participants
      const participants = [
        { conversation_id: conversation.id, user_id: userId },
        { conversation_id: conversation.id, user_id: otherUserId }
      ];
      
      const { error: partError } = await supabase
        .from('conversation_participants')
        .insert(participants);
        
      if (partError) throw partError;
      
      // Get user data for participants
      const { data: users, error: userError } = await supabase
        .from('profiles')
        .select('*')
        .in('id', [userId, otherUserId]);
        
      if (userError) throw userError;
      
      const newConversation = {
        ...conversation,
        participants: users
      };
      
      const { conversations } = get();
      set({ 
        conversations: [newConversation, ...conversations],
        currentConversation: newConversation
      });
      
      return newConversation;
    } catch (error: any) {
      set({ error: error.message });
      console.error('Create conversation error:', error);
      return null;
    } finally {
      set({ loading: false });
    }
  },
  
  sendDirectMessage: async (content, conversationId, senderId) => {
    try {
      const newMessage = {
        content,
        conversation_id: conversationId,
        sender_id: senderId
      };
      
      const { data, error } = await supabase
        .from('direct_messages')
        .insert(newMessage)
        .select(`
          *,
          sender:sender_id(id, username, avatar_url)
        `)
        .single();
        
      if (error) throw error;
      
      return data;
    } catch (error: any) {
      console.error('Send direct message error:', error);
      return null;
    }
  },
  
  setCurrentConversation: (conversation) => {
    set({ currentConversation: conversation });
  },
  
  addDirectMessage: (message) => {
    const { directMessages } = get();
    set({ directMessages: [...directMessages, message] });
  },
  
  getOrCreateConversation: async (userId, otherUserId) => {
    try {
      set({ loading: true });
      
      // Check if conversation exists
      const { data, error } = await supabase
        .from('conversations')
        .select(`
          *,
          participants:conversation_participants(
            user:user_id(*)
          )
        `)
        .contains('conversation_participants.user_id', [userId])
        .contains('conversation_participants.user_id', [otherUserId]);
        
      if (error) throw error;
      
      // Format conversations
      const formattedConversations = data.map((conv: any) => ({
        ...conv,
        participants: conv.participants.map((p: any) => p.user)
      }));
      
      // If conversation exists, return it
      if (formattedConversations.length > 0) {
        const conversation = formattedConversations[0];
        set({ currentConversation: conversation });
        return conversation;
      }
      
      // Otherwise create new conversation
      return await get().createConversation(userId, otherUserId);
    } catch (error: any) {
      console.error('Get or create conversation error:', error);
      return null;
    } finally {
      set({ loading: false });
    }
  }
}));