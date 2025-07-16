import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/database';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key';

// Mode dégradé si les variables d'environnement sont manquantes
const isDemoMode = !import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY;

if (isDemoMode) {
  console.warn('⚠️ Mode démo activé - Variables Supabase manquantes');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false
  }
});

// Export du mode démo
export { isDemoMode };

// Fonctions d'authentification simplifiées avec mode démo
export const authService = {
}
// Fonctions d'authentification simplifiées
export const authService = {
  // Inscription
  async signUp(email: string, password: string, username: string) {
    try {
      // 1. Créer l'utilisateur
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { username }
        }
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('Erreur lors de la création du compte');

      // 2. Créer le profil
      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert({
          id: authData.user.id,
          username,
          email,
          points: 0,
          level: 1
        });

      if (profileError) {
        console.warn('Erreur création profil:', profileError);
      }

      return { success: true, user: authData.user };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  // Connexion
  async signIn(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;
      return { success: true, user: data.user };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  // Déconnexion
  async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  // Récupérer le profil utilisateur
  async getUserProfile(userId: string) {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      return { success: true, profile: data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  // Obtenir la session actuelle
  async getCurrentSession() {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;
      return { success: true, session };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
};

// Export db pour compatibilité
export const db = {
  async getTreasureHunts() {
    const { data, error } = await supabase
      .from('treasure_hunts')
      .select(`
        *,
        clues(*),
        rewards(*)
      `)
      .eq('status', 'active')
      .eq('is_public', true);
    
    return { data: data || [], error };
  },

  async createTreasureHunt(huntData: any) {
    const { data, error } = await supabase
      .from('treasure_hunts')
      .insert(huntData)
      .select()
      .single();
    
    return { data, error };
  },

  async getGameSession(userId: string, huntId: string) {
    const { data, error } = await supabase
      .from('game_sessions')
      .select('*')
      .eq('user_id', userId)
      .eq('hunt_id', huntId)
      .eq('status', 'active')
      .single();
    
    return { data, error };
  },

  async createGameSession(sessionData: any) {
    const { data, error } = await supabase
      .from('game_sessions')
      .insert(sessionData)
      .select()
      .single();
    
    return { data, error };
  },

  async updateGameSession(sessionId: string, updates: any) {
    const { data, error } = await supabase
      .from('game_sessions')
      .update(updates)
      .eq('id', sessionId)
      .select()
      .single();
    
    return { data, error };
  }
};