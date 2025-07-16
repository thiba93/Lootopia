import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/database';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Create a fallback client if environment variables are missing
let supabase: any;

try {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase environment variables missing. Using offline mode.');
    // Create a mock client for development
    supabase = {
      auth: {
        getSession: () => Promise.resolve({ data: { session: null }, error: null }),
        signUp: () => Promise.resolve({ data: null, error: { message: 'Offline mode' } }),
        signInWithPassword: () => Promise.resolve({ data: null, error: { message: 'Offline mode' } }),
        signOut: () => Promise.resolve({ error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      },
      from: () => ({
        select: () => ({ eq: () => ({ single: () => Promise.resolve({ data: null, error: { message: 'Offline mode' } }) }) }),
        insert: () => ({ select: () => ({ single: () => Promise.resolve({ data: null, error: { message: 'Offline mode' } }) }) }),
        update: () => ({ eq: () => ({ select: () => ({ single: () => Promise.resolve({ data: null, error: { message: 'Offline mode' } }) }) }) }),
      }),
    };
  } else {
    supabase = createClient<Database>(
      supabaseUrl,
      supabaseAnonKey,
      {
        auth: {
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: false,
          flowType: 'pkce'
        }
      }
    );
  }
} catch (error) {
  console.error('Error creating Supabase client:', error);
  // Fallback mock client
  supabase = {
    auth: {
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      signUp: () => Promise.resolve({ data: null, error: { message: 'Connection error' } }),
      signInWithPassword: () => Promise.resolve({ data: null, error: { message: 'Connection error' } }),
      signOut: () => Promise.resolve({ error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    },
    from: () => ({
      select: () => ({ eq: () => ({ single: () => Promise.resolve({ data: null, error: { message: 'Connection error' } }) }) }),
      insert: () => ({ select: () => ({ single: () => Promise.resolve({ data: null, error: { message: 'Connection error' } }) }) }),
      update: () => ({ eq: () => ({ select: () => ({ single: () => Promise.resolve({ data: null, error: { message: 'Connection error' } }) }) }) }),
    }),
  };
}

export { supabase };

// Helper functions for authentication
export const auth = {
  signUp: async (email: string, password: string, username: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
          },
        },
      });
      return { data, error };
    } catch (error: any) {
      console.error('SignUp error:', error);
      return { data: null, error };
    }
  },

  signIn: async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      return { data, error };
    } catch (error: any) {
      console.error('SignIn error:', error);
      return { data: null, error };
    }
  },

  signOut: async () => {
    try {
      const { error } = await supabase.auth.signOut();
      return { error };
    } catch (error: any) {
      console.error('SignOut error:', error);
      return { error };
    }
  },

  getCurrentUser: async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      return { user, error };
    } catch (error: any) {
      console.error('GetCurrentUser error:', error);
      return { user: null, error };
    }
  },

  onAuthStateChange: (callback: (event: string, session: any) => void) => {
    return supabase.auth.onAuthStateChange(callback);
  },
};

// Helper functions for database operations
export const db = {
  // User profiles
  getUserProfile: async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();
      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  },

  updateUserProfile: async (userId: string, updates: any) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();
      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Treasure hunts
  getTreasureHunts: async () => {
    try {
      const { data, error } = await supabase
        .from('treasure_hunts')
        .select(`
          *,
          clues(*),
          rewards(*),
          user_profiles!treasure_hunts_created_by_fkey(username)
        `)
        .eq('status', 'active')
        .eq('is_public', true)
        .order('created_at', { ascending: false });
      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  },

  getTreasureHunt: async (huntId: string) => {
    try {
      const { data, error } = await supabase
        .from('treasure_hunts')
        .select(`
          *,
          clues(*),
          rewards(*),
          user_profiles!treasure_hunts_created_by_fkey(username)
        `)
        .eq('id', huntId)
        .single();
      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  },

  createTreasureHunt: async (hunt: any) => {
    try {
      const { data, error } = await supabase
        .from('treasure_hunts')
        .insert(hunt)
        .select()
        .single();
      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Game sessions
  createGameSession: async (session: any) => {
    try {
      const { data, error } = await supabase
        .from('game_sessions')
        .insert(session)
        .select()
        .single();
      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  },

  updateGameSession: async (sessionId: string, updates: any) => {
    try {
      const { data, error } = await supabase
        .from('game_sessions')
        .update(updates)
        .eq('id', sessionId)
        .select()
        .single();
      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  },

  getGameSession: async (userId: string, huntId: string) => {
    try {
      const { data, error } = await supabase
        .from('game_sessions')
        .select('*')
        .eq('user_id', userId)
        .eq('hunt_id', huntId)
        .eq('status', 'active')
        .single();
      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Achievements
  getAchievements: async () => {
    try {
      const { data, error } = await supabase
        .from('achievements')
        .select('*')
        .order('points', { ascending: true });
      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  },

  getUserAchievements: async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_achievements')
        .select(`
          *,
          achievements(*)
        `)
        .eq('user_id', userId)
        .order('unlocked_at', { ascending: false });
      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  },

  unlockAchievement: async (userId: string, achievementId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_achievements')
        .insert({
          user_id: userId,
          achievement_id: achievementId,
        })
        .select(`
          *,
          achievements(*)
        `)
        .single();
      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Notifications
  createNotification: async (notification: any) => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .insert(notification)
        .select()
        .single();
      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  },

  getUserNotifications: async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  },

  markNotificationAsRead: async (notificationId: string) => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId)
        .select()
        .single();
      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  },
};