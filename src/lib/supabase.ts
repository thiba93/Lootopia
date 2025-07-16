import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/database';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log('🔍 Supabase Config Debug:', {
  url: supabaseUrl ? 'Present' : 'Missing',
  key: supabaseAnonKey ? 'Present' : 'Missing',
  urlValue: supabaseUrl,
  keyLength: supabaseAnonKey?.length
});

// Vérification des variables d'environnement
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Variables d\'environnement Supabase manquantes!');
  console.log('VITE_SUPABASE_URL:', supabaseUrl);
  console.log('VITE_SUPABASE_ANON_KEY présente:', !!supabaseAnonKey);
  throw new Error('Variables d\'environnement Supabase manquantes');
}

// Configuration Supabase optimisée pour l'authentification
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    flowType: 'implicit', // Changé de 'pkce' à 'implicit' pour plus de compatibilité
    debug: true // Activer les logs de debug
  },
  global: {
    headers: {
      'X-Client-Info': 'lootopia-web'
    }
  }
});

// Test de connexion au démarrage
supabase.auth.getSession().then(({ data, error }) => {
  if (error) {
    console.error('❌ Erreur de session initiale:', error);
  } else {
    console.log('✅ Session initiale récupérée:', data.session ? 'Connecté' : 'Non connecté');
  }
});

// Helper functions pour l'authentification avec logs détaillés
export const auth = {
  signUp: async (email: string, password: string, username: string) => {
    console.log('🔄 Tentative d\'inscription pour:', email);
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
          },
          emailRedirectTo: undefined // Désactiver la confirmation email
        }
      });
      
      console.log('📝 Résultat inscription:', { 
        success: !error, 
        user: data.user?.id,
        session: !!data.session,
        error: error?.message 
      });
      
      if (error) {
        console.error('❌ Erreur inscription:', error);
        return { data: null, error };
      }
      
      return { data, error: null };
    } catch (error: any) {
      console.error('💥 Exception lors de l\'inscription:', error);
      return { 
        data: null, 
        error: { message: error.message || 'Erreur lors de l\'inscription' } 
      };
    }
  },

  signIn: async (email: string, password: string) => {
    console.log('🔄 Tentative de connexion pour:', email);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      console.log('📝 Résultat connexion:', { 
        success: !error, 
        user: data.user?.id,
        session: !!data.session,
        error: error?.message 
      });
      
      if (error) {
        console.error('❌ Erreur connexion:', error);
        return { data: null, error };
      }
      
      return { data, error: null };
    } catch (error: any) {
      console.error('💥 Exception lors de la connexion:', error);
      return { 
        data: null, 
        error: { message: error.message || 'Erreur lors de la connexion' } 
      };
    }
  },

  signOut: async () => {
    console.log('🔄 Déconnexion...');
    try {
      const { error } = await supabase.auth.signOut();
      console.log('📝 Résultat déconnexion:', { success: !error, error: error?.message });
      return { error };
    } catch (error: any) {
      console.error('💥 Exception lors de la déconnexion:', error);
      return { error };
    }
  },

  getCurrentUser: async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      console.log('📝 Utilisateur actuel:', { user: user?.id, error: error?.message });
      return { user, error };
    } catch (error: any) {
      console.error('💥 Exception récupération utilisateur:', error);
      return { user: null, error };
    }
  },

  onAuthStateChange: (callback: (event: string, session: any) => void) => {
    console.log('👂 Écoute des changements d\'authentification...');
    return supabase.auth.onAuthStateChange((event, session) => {
      console.log('🔔 Changement d\'auth:', { event, user: session?.user?.id });
      callback(event, session);
    });
  }
};

// Helper functions pour la base de données
export const db = {
  // User profiles
  getUserProfile: async (userId: string) => {
    console.log('🔄 Récupération profil utilisateur:', userId);
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      console.log('📝 Profil utilisateur:', { found: !!data, error: error?.message });
      return { data, error };
    } catch (error) {
      console.error('💥 Exception profil utilisateur:', error);
      return { data: null, error };
    }
  },

  createUserProfile: async (profile: any) => {
    console.log('🔄 Création profil utilisateur:', profile.id);
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .insert(profile)
        .select()
        .single();
      
      console.log('📝 Création profil:', { success: !error, error: error?.message });
      return { data, error };
    } catch (error) {
      console.error('💥 Exception création profil:', error);
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