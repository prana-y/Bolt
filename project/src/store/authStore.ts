import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { User } from '../types';

interface AuthState {
  user: User | null;
  session: any | null;
  loading: boolean;
  error: string | null;
  initialized: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, username: string, fullName: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  refreshUser: () => Promise<void>;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  loading: false,
  error: null,
  initialized: false,

  initialize: async () => {
    try {
      set({ loading: true });
      
      // Get session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        // Get user profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
          
        set({ 
          user: profile, 
          session,
          initialized: true
        });
      }
    } catch (error) {
      console.error('Error initializing auth:', error);
    } finally {
      set({ loading: false, initialized: true });
    }
  },

  signIn: async (email, password) => {
    try {
      set({ loading: true, error: null });
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      if (data.session) {
        // Get user profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.session.user.id)
          .single();
          
        set({ user: profile, session: data.session });
      }
    } catch (error: any) {
      set({ error: error.message });
      console.error('Sign in error:', error);
    } finally {
      set({ loading: false });
    }
  },

  signUp: async (email, password, username, fullName) => {
    try {
      set({ loading: true, error: null });
      
      // Check if username is taken
      const { data: existingUsers, error: checkError } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', username);
        
      if (checkError) throw checkError;
      
      if (existingUsers && existingUsers.length > 0) {
        throw new Error('Username is already taken');
      }
      
      // Sign up
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      
      if (error) throw error;
      
      if (data.user) {
        // Create profile
        const { error: profileError } = await supabase.from('profiles').insert({
          id: data.user.id,
          username,
          full_name: fullName,
          email,
        });
        
        if (profileError) throw profileError;
        
        set({ 
          user: {
            id: data.user.id,
            username,
            full_name: fullName,
            email,
            created_at: new Date().toISOString(),
          } as User, 
          session: data.session 
        });
      }
    } catch (error: any) {
      set({ error: error.message });
      console.error('Sign up error:', error);
    } finally {
      set({ loading: false });
    }
  },

  signOut: async () => {
    try {
      set({ loading: true });
      await supabase.auth.signOut();
      set({ user: null, session: null });
    } catch (error: any) {
      console.error('Sign out error:', error);
    } finally {
      set({ loading: false });
    }
  },

  updateProfile: async (updates) => {
    const { user } = get();
    if (!user) return;
    
    try {
      set({ loading: true });
      
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);
        
      if (error) throw error;
      
      set({ user: { ...user, ...updates } });
    } catch (error: any) {
      console.error('Update profile error:', error);
    } finally {
      set({ loading: false });
    }
  },

  refreshUser: async () => {
    const { user } = get();
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
        
      if (error) throw error;
      
      set({ user: data });
    } catch (error) {
      console.error('Refresh user error:', error);
    }
  }
}));