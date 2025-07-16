import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/database';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log('🔍 Supabase Config:', {
  url: supabaseUrl ? 'Present' : 'Missing',
  key: supabaseAnonKey ? 'Present' : 'Missing',
  urlValue: supabaseUrl,
  keyLength: supabaseAnonKey?.length
});

// Créer un client mock si les variables d'environnement manquent
let supabase: any;
let isSupabaseAvailable = false;

if (supabaseUrl && supabaseAnonKey) {
  try {
    supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
        flowType: 'implicit'
      }
    });
    isSupabaseAvailable = true;
    console.log('✅ Supabase client créé avec succès');
  } catch (error) {
    console.error('❌ Erreur création client Supabase:', error);
    isSupabaseAvailable = false;
  }
} else {
  console.warn('⚠️ Variables Supabase manquantes, mode mock activé');
  isSupabaseAvailable = false;
}

// Mock users storage pour le mode hors ligne
const mockUsers = new Map();
let currentMockUser: any = null;

// Helper functions pour l'authentification
export const auth = {
  signUp: async (email: string, password: string, username: string) => {
    console.log('🔄 Tentative d\'inscription:', { email, username });
    
    if (!isSupabaseAvailable) {
      console.log('📝 Mode mock - Création utilisateur local');
      
      // Simuler un délai
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Vérifier si l'utilisateur existe déjà
      if (mockUsers.has(email)) {
        return { 
          data: null, 
          error: { message: 'Un utilisateur avec cet email existe déjà' } 
        };
      }
      
      // Créer un utilisateur mock
      const mockUser = {
        id: `mock-${Date.now()}`,
        email,
        user_metadata: { username },
        created_at: new Date().toISOString()
      };
      
      mockUsers.set(email, { user: mockUser, password });
      currentMockUser = mockUser;
      
      console.log('✅ Utilisateur mock créé:', mockUser.id);
      return { 
        data: { 
          user: mockUser, 
          session: { user: mockUser, access_token: 'mock-token' } 
        }, 
        error: null 
      };
    }
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { username }
        }
      });
      
      console.log('📝 Résultat inscription Supabase:', { 
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
    console.log('🔄 Tentative de connexion:', email);
    
    if (!isSupabaseAvailable) {
      console.log('📝 Mode mock - Vérification utilisateur local');
      
      // Simuler un délai
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockUserData = mockUsers.get(email);
      if (!mockUserData || mockUserData.password !== password) {
        return { 
          data: null, 
          error: { message: 'Email ou mot de passe incorrect' } 
        };
      }
      
      currentMockUser = mockUserData.user;
      console.log('✅ Connexion mock réussie:', currentMockUser.id);
      
      return { 
        data: { 
          user: currentMockUser, 
          session: { user: currentMockUser, access_token: 'mock-token' } 
        }, 
        error: null 
      };
    }
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      console.log('📝 Résultat connexion Supabase:', { 
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
    console.log('🔄 Déconnexion...');
    
    if (!isSupabaseAvailable) {
      currentMockUser = null;
      console.log('✅ Déconnexion mock réussie');
      return { error: null };
    }
    
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
    if (!isSupabaseAvailable) {
      return { user: currentMockUser, error: null };
    }
    
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      return { user, error };
    } catch (error: any) {
      return { user: null, error };
    }
  },

  onAuthStateChange: (callback: (event: string, session: any) => void) => {
    if (!isSupabaseAvailable) {
      // Mock auth state change
      return {
        data: {
          subscription: {
            unsubscribe: () => console.log('Mock auth listener unsubscribed')
          }
        }
      };
    }
    
    return supabase.auth.onAuthStateChange(callback);
  }
};

// Helper functions pour la base de données (avec fallbacks mock)
export const db = {
  getUserProfile: async (userId: string) => {
    if (!isSupabaseAvailable) {
      // Retourner un profil mock
      return {
        data: {
          id: userId,
          username: currentMockUser?.user_metadata?.username || 'User',
          email: currentMockUser?.email || 'user@example.com',
          points: 0,
          level: 1,
          avatar_url: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        error: null
      };
    }
    
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

  createUserProfile: async (profile: any) => {
    if (!isSupabaseAvailable) {
      return { data: profile, error: null };
    }
    
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .insert(profile)
        .select()
        .single();
      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Autres méthodes de base de données avec fallbacks similaires...
  getTreasureHunts: async () => {
    if (!isSupabaseAvailable) {
      return { data: [], error: null };
    }
    
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
  }
};

export { supabase, isSupabaseAvailable };