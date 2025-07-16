import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { supabase, authService } from '../lib/supabase';
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
  const [loading, setLoading] = useState(true);

  const isAuthenticated = !!user && !!supabaseUser;

  // Charger le profil utilisateur
  const loadUserProfile = async (supabaseUser: SupabaseUser) => {
    try {
      const result = await authService.getUserProfile(supabaseUser.id);
      
      if (result.success && result.profile) {
        const userData: User = {
          id: result.profile.id,
          username: result.profile.username,
          email: result.profile.email,
          points: result.profile.points || 0,
          level: result.profile.level || 1,
          avatar: result.profile.avatar_url,
          createdAt: result.profile.created_at,
          achievements: [],
          completedHunts: [],
          createdHunts: [],
        };
        
        setUser(userData);
        console.log('✅ Profil utilisateur chargé:', userData.username);
      } else {
        console.error('❌ Erreur chargement profil:', result.error);
        setUser(null);
      }
    } catch (error) {
      console.error('❌ Erreur chargement profil:', error);
      setUser(null);
    }
  };

  // Initialisation
  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        console.log('🔄 Initialisation authentification...');
        
        // Vérifier la session existante
        const sessionResult = await authService.getCurrentSession();
        
        if (mounted) {
          if (sessionResult.success && sessionResult.session?.user) {
            console.log('✅ Session existante trouvée');
            setSupabaseUser(sessionResult.session.user);
            await loadUserProfile(sessionResult.session.user);
          } else {
            console.log('ℹ️ Aucune session existante');
            setUser(null);
            setSupabaseUser(null);
          }
          setLoading(false);
        }
      } catch (error) {
        console.error('❌ Erreur initialisation:', error);
        if (mounted) {
          setUser(null);
          setSupabaseUser(null);
          setLoading(false);
        }
      }
    };

    initializeAuth();

    // Écouter les changements d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      console.log('🔔 Événement auth:', event);

      if (event === 'SIGNED_IN' && session?.user) {
        console.log('✅ Utilisateur connecté');
        setSupabaseUser(session.user);
        await loadUserProfile(session.user);
      } else if (event === 'SIGNED_OUT') {
        console.log('👋 Utilisateur déconnecté');
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
    try {
      console.log('📝 Inscription:', email, username);
      const result = await authService.signUp(email, password, username);
      
      if (result.success) {
        console.log('✅ Inscription réussie');
        return { success: true };
      } else {
        console.error('❌ Erreur inscription:', result.error);
        return { success: false, error: result.error };
      }
    } catch (error: any) {
      console.error('❌ Erreur inscription:', error);
      return { success: false, error: error.message };
    }
  };

  // Connexion
  const signIn = async (email: string, password: string) => {
    try {
      console.log('🔑 Connexion:', email);
      const result = await authService.signIn(email, password);
      
      if (result.success) {
        console.log('✅ Connexion réussie');
        return { success: true };
      } else {
        console.error('❌ Erreur connexion:', result.error);
        return { success: false, error: result.error };
      }
    } catch (error: any) {
      console.error('❌ Erreur connexion:', error);
      return { success: false, error: error.message };
    }
  };

  // Déconnexion
  const signOut = async () => {
    try {
      console.log('👋 Déconnexion...');
      const result = await authService.signOut();
      
      if (result.success) {
        console.log('✅ Déconnexion réussie');
        setUser(null);
        setSupabaseUser(null);
      } else {
        console.error('❌ Erreur déconnexion:', result.error);
      }
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

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};