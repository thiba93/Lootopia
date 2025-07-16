import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/database';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log('🔍 Supabase Config:', {
  url: supabaseUrl ? 'Present' : 'Missing',
  key: supabaseAnonKey ? 'Present' : 'Missing',
  urlValue: supabaseUrl
});

// Créer le client Supabase
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    flowType: 'implicit'
  }
});

export const isSupabaseAvailable = !!(supabaseUrl && supabaseAnonKey);

// Helper functions pour l'authentification
export const auth = {
  signUp: async (email: string, password: string, username: string) => {
    console.log('🔄 Inscription Supabase:', { email, username });
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { username },
          emailRedirectTo: undefined // Pas de confirmation email
        }
      });
      
      console.log('📝 Résultat inscription:', { 
        success: !error, 
        user: data.user?.id,
        error: error?.message 
      });
      
      return { data, error };
    } catch (error: any) {
      console.error('💥 Exception inscription:', error);
      return { 
        data: null, 
        error: { message: error.message || 'Erreur lors de l\'inscription' } 
      };
    }
  },

  signIn: async (email: string, password: string) => {
    console.log('🔄 Connexion Supabase:', email);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      console.log('📝 Résultat connexion:', { 
        success: !error, 
        user: data.user?.id,
        error: error?.message 
      });
      
      return { data, error };
    } catch (error: any) {
      console.error('💥 Exception connexion:', error);
      return { 
        data: null, 
        error: { message: error.message || 'Erreur lors de la connexion' } 
      };
    }
  },

  signOut: async () => {
    console.log('🔄 Déconnexion Supabase...');
    
    try {
      const { error } = await supabase.auth.signOut();
      console.log('📝 Résultat déconnexion:', { success: !error });
      return { error };
    } catch (error: any) {
      console.error('💥 Exception déconnexion:', error);
      return { error };
    }
  },

  getCurrentUser: async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      return { user, error };
    } catch (error: any) {
      return { user: null, error };
    }
  },

  onAuthStateChange: (callback: (event: string, session: any) => void) => {
    return supabase.auth.onAuthStateChange(callback);
  }
};

// Helper functions pour la base de données
export const db = {
  getUserProfile: async (userId: string) => {
    console.log('🔄 Récupération profil utilisateur:', userId);
    
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      console.log('📝 Profil récupéré:', { found: !!data, error: error?.message });
      return { data, error };
    } catch (error) {
      console.error('💥 Erreur récupération profil:', error);
      return { data: null, error };
    }
  },

  createUserProfile: async (profile: any) => {
    console.log('🔄 Création profil utilisateur:', profile.username);
    
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .insert(profile)
        .select()
        .single();
      
      console.log('📝 Profil créé:', { success: !error, error: error?.message });
      return { data, error };
    } catch (error) {
      console.error('💥 Erreur création profil:', error);
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

  getTreasureHunts: async () => {
    console.log('🔄 Chargement chasses au trésor...');
    
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
      
      console.log('📝 Chasses chargées:', { count: data?.length || 0, error: error?.message });
      return { data, error };
    } catch (error) {
      console.error('💥 Erreur chargement chasses:', error);
      return { data: null, error };
    }
  },

  createTreasureHunt: async (huntData: any) => {
    try {
      const { data, error } = await supabase
        .from('treasure_hunts')
        .insert(huntData)
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

  createGameSession: async (sessionData: any) => {
    try {
      const { data, error } = await supabase
        .from('game_sessions')
        .insert(sessionData)
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

  getUserNotifications: async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50);
      
      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  },

  createNotification: async (notificationData: any) => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .insert(notificationData)
        .select()
        .single();
      
      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  },

  markNotificationAsRead: async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);
      
      return { error };
    } catch (error) {
      return { error };
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
        .eq('user_id', userId);
      
      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }
};