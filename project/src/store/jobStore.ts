import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { JobPost } from '../types';

interface JobState {
  jobs: JobPost[];
  currentJob: JobPost | null;
  loading: boolean;
  error: string | null;
  
  fetchJobs: () => Promise<void>;
  fetchJob: (id: string) => Promise<void>;
  createJob: (job: Omit<JobPost, 'id' | 'created_at' | 'user'>) => Promise<JobPost | null>;
  updateJob: (id: string, updates: Partial<JobPost>) => Promise<void>;
  deleteJob: (id: string) => Promise<void>;
  setCurrentJob: (job: JobPost | null) => void;
}

export const useJobStore = create<JobState>((set, get) => ({
  jobs: [],
  currentJob: null,
  loading: false,
  error: null,
  
  fetchJobs: async () => {
    try {
      set({ loading: true });
      
      const { data, error } = await supabase
        .from('job_posts')
        .select(`
          *,
          user:user_id(id, username, avatar_url)
        `)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      set({ jobs: data || [] });
    } catch (error: any) {
      set({ error: error.message });
      console.error('Fetch jobs error:', error);
    } finally {
      set({ loading: false });
    }
  },
  
  fetchJob: async (id) => {
    try {
      set({ loading: true });
      
      const { data, error } = await supabase
        .from('job_posts')
        .select(`
          *,
          user:user_id(id, username, avatar_url, email)
        `)
        .eq('id', id)
        .single();
        
      if (error) throw error;
      
      set({ currentJob: data });
    } catch (error: any) {
      set({ error: error.message });
      console.error('Fetch job error:', error);
    } finally {
      set({ loading: false });
    }
  },
  
  createJob: async (job) => {
    try {
      set({ loading: true });
      
      const { data, error } = await supabase
        .from('job_posts')
        .insert(job)
        .select(`
          *,
          user:user_id(id, username, avatar_url)
        `)
        .single();
        
      if (error) throw error;
      
      const { jobs } = get();
      set({ jobs: [data, ...jobs] });
      
      return data;
    } catch (error: any) {
      set({ error: error.message });
      console.error('Create job error:', error);
      return null;
    } finally {
      set({ loading: false });
    }
  },
  
  updateJob: async (id, updates) => {
    try {
      set({ loading: true });
      
      const { error } = await supabase
        .from('job_posts')
        .update(updates)
        .eq('id', id);
        
      if (error) throw error;
      
      // Update local state
      const { jobs, currentJob } = get();
      const updatedJobs = jobs.map(job => 
        job.id === id ? { ...job, ...updates } : job
      );
      
      set({ 
        jobs: updatedJobs,
        currentJob: currentJob?.id === id ? { ...currentJob, ...updates } : currentJob
      });
    } catch (error: any) {
      set({ error: error.message });
      console.error('Update job error:', error);
    } finally {
      set({ loading: false });
    }
  },
  
  deleteJob: async (id) => {
    try {
      set({ loading: true });
      
      const { error } = await supabase
        .from('job_posts')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      // Update local state
      const { jobs } = get();
      set({ 
        jobs: jobs.filter(job => job.id !== id),
        currentJob: null
      });
    } catch (error: any) {
      set({ error: error.message });
      console.error('Delete job error:', error);
    } finally {
      set({ loading: false });
    }
  },
  
  setCurrentJob: (job) => {
    set({ currentJob: job });
  }
}));