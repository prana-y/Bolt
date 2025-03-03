import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { Resource } from '../types';

interface ResourceState {
  resources: Resource[];
  currentResource: Resource | null;
  loading: boolean;
  error: string | null;
  
  fetchResources: () => Promise<void>;
  fetchResource: (id: string) => Promise<void>;
  createResource: (resource: Omit<Resource, 'id' | 'created_at' | 'user'>) => Promise<Resource | null>;
  updateResource: (id: string, updates: Partial<Resource>) => Promise<void>;
  deleteResource: (id: string) => Promise<void>;
  setCurrentResource: (resource: Resource | null) => void;
}

export const useResourceStore = create<ResourceState>((set, get) => ({
  resources: [],
  currentResource: null,
  loading: false,
  error: null,
  
  fetchResources: async () => {
    try {
      set({ loading: true });
      
      const { data, error } = await supabase
        .from('resources')
        .select(`
          *,
          user:user_id(id, username, avatar_url)
        `)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      set({ resources: data || [] });
    } catch (error: any) {
      set({ error: error.message });
      console.error('Fetch resources error:', error);
    } finally {
      set({ loading: false });
    }
  },
  
  fetchResource: async (id) => {
    try {
      set({ loading: true });
      
      const { data, error } = await supabase
        .from('resources')
        .select(`
          *,
          user:user_id(id, username, avatar_url)
        `)
        .eq('id', id)
        .single();
        
      if (error) throw error;
      
      set({ currentResource: data });
    } catch (error: any) {
      set({ error: error.message });
      console.error('Fetch resource error:', error);
    } finally {
      set({ loading: false });
    }
  },
  
  createResource: async (resource) => {
    try {
      set({ loading: true });
      
      const { data, error } = await supabase
        .from('resources')
        .insert(resource)
        .select(`
          *,
          user:user_id(id, username, avatar_url)
        `)
        .single();
        
      if (error) throw error;
      
      const { resources } = get();
      set({ resources: [data, ...resources] });
      
      return data;
    } catch (error: any) {
      set({ error: error.message });
      console.error('Create resource error:', error);
      return null;
    } finally {
      set({ loading: false });
    }
  },
  
  updateResource: async (id, updates) => {
    try {
      set({ loading: true });
      
      const { error } = await supabase
        .from('resources')
        .update(updates)
        .eq('id', id);
        
      if (error) throw error;
      
      // Update local state
      const { resources, currentResource } = get();
      const updatedResources = resources.map(resource => 
        resource.id === id ? { ...resource, ...updates } : resource
      );
      
      set({ 
        resources: updatedResources,
        currentResource: currentResource?.id === id ? { ...currentResource, ...updates } : currentResource
      });
    } catch (error: any) {
      set({ error: error.message });
      console.error('Update resource error:', error);
    } finally {
      set({ loading: false });
    }
  },
  
  deleteResource: async (id) => {
    try {
      set({ loading: true });
      
      const { error } = await supabase
        .from('resources')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      // Update local state
      const { resources } = get();
      set({ 
        resources: resources.filter(resource => resource.id !== id),
        currentResource: null
      });
    } catch (error: any) {
      set({ error: error.message });
      console.error('Delete resource error:', error);
    } finally {
      set({ loading: false });
    }
  },
  
  setCurrentResource: (resource) => {
    set({ currentResource: resource });
  }
}));