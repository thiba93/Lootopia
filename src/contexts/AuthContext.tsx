import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  supabaseUser: SupabaseUser | null;
  isAuthenticated: boolean;
  loading: boolean;
  signUp: (email: string, password: string, username: string) => Promise<{ success: boolean; error?: string }>;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);

  const isAuthenticated = !!user && !!supabaseUser;

  // Charger le profil utilisateur
  const loadUserProfile = async (supabaseUser: SupabaseUser) => {
    try {
      console.log('📝 Chargement profil pour:', supabaseUser.email);
      
      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', supabaseUser.id)
        .single();
      
      if (error) {
        console.warn('⚠️ Profil non trouvé, création...', error);
        
        // Créer le profil s'il n'existe pas
        const { data: newProfile, error: createError } = await supabase
          .from('user_profiles')
          .insert({
            id: supabaseUser.id,
            username: supabaseUser.user_metadata?.username || supabaseUser.email?.split('@')[0] || 'User',
            email: supabaseUser.email || '',
            points: 0,
            level: 1
          })
          .select()
          .single();
        
        if (createError) {
          console.error('❌ Erreur création profil:', createError);
          return;
        }
        
        if (newProfile) {
          const userData: User = {
            id: newProfile.id,
            username: newProfile.username,
            email: newProfile.email,
            points: newProfile.points || 0,
            level: newProfile.level || 1,
            avatar: newProfile.avatar_url,
            createdAt: newProfile.created_at,
            achievements: [],
            completedHunts: [],
            createdHunts: [],
          };
          
          setUser(userData);
          console.log('✅ Profil créé:', userData.username);
        }
      } else if (profile) {
        const userData: User = {
          id: profile.id,
          username: profile.username,
          email: profile.email,
          points: profile.points || 0,
          level: profile.level || 1,
          avatar: profile.avatar_url,
          createdAt: profile.created_at,
          achievements: [],
          completedHunts: [],
          createdHunts: [],
        };
        
        setUser(userData);
        console.log('✅ Profil chargé:', userData.username);
      }
    } catch (error) {
      console.error('❌ Erreur chargement profil:', error);
    }
  };

  // Initialisation simple
  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (mounted) {
          if (session?.user) {
            console.log('✅ Session existante trouvée');
            setSupabaseUser(session.user);
            await loadUserProfile(session.user);
          } else {
            console.log('ℹ️ Aucune session');
          }
          setInitialized(true);
        }
      } catch (error) {
        console.error('❌ Erreur init auth:', error);
        if (mounted) {
          setInitialized(true);
        }
      }
    };

    initAuth();

    // Écouter les changements
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      console.log('🔔 Auth event:', event);

      if (event === 'SIGNED_IN' && session?.user) {
        setSupabaseUser(session.user);
        await loadUserProfile(session.user);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setSupabaseUser(null);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Inscription
  const signUp = async (email: string, password: string, username: string) => {
    setLoading(true);
    try {
      console.log('📝 Inscription:', email, username);

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { username }
        }
      });

      if (error) throw error;

      if (data.user) {
        console.log('✅ Inscription réussie');
        return { success: true };
      }

      throw new Error('Erreur lors de la création du compte');
    } catch (error: any) {
      console.error('❌ Erreur inscription:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Connexion
  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      console.log('🔑 Connexion:', email);

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      console.log('✅ Connexion réussie');
      return { success: true };
    } catch (error: any) {
      console.error('❌ Erreur connexion:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Déconnexion
  const signOut = async () => {
    try {
      console.log('👋 Déconnexion...');
      
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      setUser(null);
      setSupabaseUser(null);
      console.log('✅ Déconnexion réussie');
    } catch (error) {
      console.error('❌ Erreur déconnexion:', error);
    }
  };

  const value: AuthContextType = {
    user,
    supabaseUser,
    isAuthenticated,
    loading,
    signUp,
    signIn,
    signOut,
  };

  // Attendre l'initialisation avant de rendre
  if (!initialized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
          <p>Initialisation...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};