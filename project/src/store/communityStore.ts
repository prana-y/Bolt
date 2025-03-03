import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { Community, Channel, Message, CommunityMember } from '../types';

interface CommunityState {
  communities: Community[];
  currentCommunity: Community | null;
  channels: Channel[];
  currentChannel: Channel | null;
  messages: Message[];
  members: CommunityMember[];
  loading: boolean;
  error: string | null;
  
  fetchCommunities: () => Promise<void>;
  fetchCommunity: (id: string) => Promise<void>;
  fetchChannels: (communityId: string) => Promise<void>;
  fetchChannel: (id: string) => Promise<void>;
  fetchMessages: (channelId: string) => Promise<void>;
  fetchMembers: (communityId: string) => Promise<void>;
  
  createCommunity: (name: string, description: string, imageUrl?: string) => Promise<Community | null>;
  createChannel: (name: string, description: string, communityId: string) => Promise<Channel | null>;
  sendMessage: (content: string, channelId: string, userId: string) => Promise<Message | null>;
  
  joinCommunity: (communityId: string, userId: string) => Promise<void>;
  leaveCommunity: (communityId: string, userId: string) => Promise<void>;
  
  setCurrentCommunity: (community: Community | null) => void;
  setCurrentChannel: (channel: Channel | null) => void;
  addMessage: (message: Message) => void;
}

export const useCommunityStore = create<CommunityState>((set, get) => ({
  communities: [],
  currentCommunity: null,
  channels: [],
  currentChannel: null,
  messages: [],
  members: [],
  loading: false,
  error: null,
  
  fetchCommunities: async () => {
    try {
      set({ loading: true });
      
      const { data, error } = await supabase
        .from('communities')
        .select('*');
        
      if (error) throw error;
      
      set({ communities: data || [] });
    } catch (error: any) {
      set({ error: error.message });
      console.error('Fetch communities error:', error);
    } finally {
      set({ loading: false });
    }
  },
  
  fetchCommunity: async (id) => {
    try {
      set({ loading: true });
      
      const { data, error } = await supabase
        .from('communities')
        .select('*')
        .eq('id', id)
        .single();
        
      if (error) throw error;
      
      set({ currentCommunity: data });
    } catch (error: any) {
      set({ error: error.message });
      console.error('Fetch community error:', error);
    } finally {
      set({ loading: false });
    }
  },
  
  fetchChannels: async (communityId) => {
    try {
      set({ loading: true });
      
      const { data, error } = await supabase
        .from('channels')
        .select('*')
        .eq('community_id', communityId);
        
      if (error) throw error;
      
      set({ channels: data || [] });
    } catch (error: any) {
      set({ error: error.message });
      console.error('Fetch channels error:', error);
    } finally {
      set({ loading: false });
    }
  },
  
  fetchChannel: async (id) => {
    try {
      set({ loading: true });
      
      const { data, error } = await supabase
        .from('channels')
        .select('*')
        .eq('id', id)
        .single();
        
      if (error) throw error;
      
      set({ currentChannel: data });
    } catch (error: any) {
      set({ error: error.message });
      console.error('Fetch channel error:', error);
    } finally {
      set({ loading: false });
    }
  },
  
  fetchMessages: async (channelId) => {
    try {
      set({ loading: true });
      
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          user:user_id(id, username, avatar_url),
          reactions(*)
        `)
        .eq('channel_id', channelId)
        .order('created_at', { ascending: true });
        
      if (error) throw error;
      
      set({ messages: data || [] });
    } catch (error: any) {
      set({ error: error.message });
      console.error('Fetch messages error:', error);
    } finally {
      set({ loading: false });
    }
  },
  
  fetchMembers: async (communityId) => {
    try {
      set({ loading: true });
      
      const { data, error } = await supabase
        .from('community_members')
        .select(`
          *,
          user:user_id(*)
        `)
        .eq('community_id', communityId);
        
      if (error) throw error;
      
      set({ members: data || [] });
    } catch (error: any) {
      set({ error: error.message });
      console.error('Fetch members error:', error);
    } finally {
      set({ loading: false });
    }
  },
  
  createCommunity: async (name, description, imageUrl) => {
    try {
      set({ loading: true });
      
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');
      
      const newCommunity = {
        name,
        description,
        image_url: imageUrl,
        created_by: user.user.id,
        member_count: 1
      };
      
      const { data, error } = await supabase
        .from('communities')
        .insert(newCommunity)
        .select()
        .single();
        
      if (error) throw error;
      
      // Add creator as admin
      await supabase.from('community_members').insert({
        user_id: user.user.id,
        community_id: data.id,
        role: 'admin'
      });
      
      // Create general channel
      await supabase.from('channels').insert({
        name: 'general',
        description: 'General discussion',
        community_id: data.id,
        created_by: user.user.id
      });
      
      const { communities } = get();
      set({ communities: [...communities, data] });
      
      return data;
    } catch (error: any) {
      set({ error: error.message });
      console.error('Create community error:', error);
      return null;
    } finally {
      set({ loading: false });
    }
  },
  
  createChannel: async (name, description, communityId) => {
    try {
      set({ loading: true });
      
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');
      
      const newChannel = {
        name,
        description,
        community_id: communityId,
        created_by: user.user.id
      };
      
      const { data, error } = await supabase
        .from('channels')
        .insert(newChannel)
        .select()
        .single();
        
      if (error) throw error;
      
      const { channels } = get();
      set({ channels: [...channels, data] });
      
      return data;
    } catch (error: any) {
      set({ error: error.message });
      console.error('Create channel error:', error);
      return null;
    } finally {
      set({ loading: false });
    }
  },
  
  sendMessage: async (content, channelId, userId) => {
    try {
      const newMessage = {
        content,
        channel_id: channelId,
        user_id: userId
      };
      
      const { data, error } = await supabase
        .from('messages')
        .insert(newMessage)
        .select(`
          *,
          user:user_id(id, username, avatar_url)
        `)
        .single();
        
      if (error) throw error;
      
      return data;
    } catch (error: any) {
      console.error('Send message error:', error);
      return null;
    }
  },
  
  joinCommunity: async (communityId, userId) => {
    try {
      set({ loading: true });
      
      // Check if already a member
      const { data: existingMember } = await supabase
        .from('community_members')
        .select('*')
        .eq('community_id', communityId)
        .eq('user_id', userId)
        .single();
        
      if (existingMember) return;
      
      // Add as member
      await supabase.from('community_members').insert({
        user_id: userId,
        community_id: communityId,
        role: 'member'
      });
      
      // Increment member count
      await supabase.rpc('increment_member_count', { community_id: communityId });
      
      // Refresh community
      await get().fetchCommunity(communityId);
    } catch (error: any) {
      console.error('Join community error:', error);
    } finally {
      set({ loading: false });
    }
  },
  
  leaveCommunity: async (communityId, userId) => {
    try {
      set({ loading: true });
      
      // Remove membership
      await supabase
        .from('community_members')
        .delete()
        .eq('community_id', communityId)
        .eq('user_id', userId);
      
      // Decrement member count
      await supabase.rpc('decrement_member_count', { community_id: communityId });
      
      // Refresh community
      await get().fetchCommunity(communityId);
    } catch (error: any) {
      console.error('Leave community error:', error);
    } finally {
      set({ loading: false });
    }
  },
  
  setCurrentCommunity: (community) => {
    set({ currentCommunity: community });
  },
  
  setCurrentChannel: (channel) => {
    set({ currentChannel: channel });
  },
  
  addMessage: (message) => {
    const { messages } = get();
    set({ messages: [...messages, message] });
  }
}));