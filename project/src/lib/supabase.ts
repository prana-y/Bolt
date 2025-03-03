import { createClient } from '@supabase/supabase-js';

// Initialize the Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase credentials. Please connect to Supabase using the "Connect to Supabase" button.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Real-time subscriptions
export const subscribeToChannel = (channelId: string, callback: (payload: any) => void) => {
  return supabase
    .channel(`messages:channel_id=eq.${channelId}`)
    .on('postgres_changes', 
      { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'messages',
        filter: `channel_id=eq.${channelId}`
      }, 
      (payload) => callback(payload)
    )
    .subscribe();
};

export const subscribeToDirectMessages = (conversationId: string, callback: (payload: any) => void) => {
  return supabase
    .channel(`direct_messages:conversation_id=eq.${conversationId}`)
    .on('postgres_changes', 
      { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'direct_messages',
        filter: `conversation_id=eq.${conversationId}`
      }, 
      (payload) => callback(payload)
    )
    .subscribe();
};

export const subscribeToNotifications = (userId: string, callback: (payload: any) => void) => {
  return supabase
    .channel(`notifications:user_id=eq.${userId}`)
    .on('postgres_changes', 
      { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'notifications',
        filter: `user_id=eq.${userId}`
      }, 
      (payload) => callback(payload)
    )
    .subscribe();
};