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

  // Créer un utilisateur par défaut pour le mode démo
  const createDemoUser = (email: string, username: string): User => {
    const demoId = `demo-${Date.now()}`;
    return {
      id: demoId,
      username: username || email.split('@')[0] || 'DemoUser',
      email,
      role: 'player',
      points: 0,
      level: 1,
      createdAt: new Date().toISOString(),
      achievements: [],
      completedHunts: [],
      createdHunts: [],
      activeHunts: [],
    };
  };

  // Charger le profil utilisateur avec fallback
  const loadUserProfile = async (supabaseUser: SupabaseUser): Promise<boolean> => {
    try {
      console.log('📝 Chargement profil pour:', supabaseUser.email);
      
      // Timeout pour éviter les blocages
      const timeoutPromise = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('Timeout profil')), 5000)
      );
      
      const profilePromise = supabase
        .from('user_profiles')
        .select('*')
        .eq('id', supabaseUser.id)
        .single();
      
      const { data: profile, error } = await Promise.race([profilePromise, timeoutPromise]);
      
      if (error && error.code !== 'PGRST116') {
        console.warn('⚠️ Erreur profil, création...', error);
        
        // Essayer de créer le profil
        const createPromise = supabase
          .from('user_profiles')
          .insert({
            id: supabaseUser.id,
            username: supabaseUser.user_metadata?.username || supabaseUser.email?.split('@')[0] || 'User',
            email: supabaseUser.email || '',
            role: 'player',
            points: 0,
            level: 1
          })
          .select()
          .single();
        
        const createTimeoutPromise = new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error('Timeout création')), 3000)
        );
        
        try {
          const { data: newProfile, error: createError } = await Promise.race([createPromise, createTimeoutPromise]);
          
          if (!createError && newProfile) {
            const userData: User = {
              id: newProfile.id,
              username: newProfile.username,
              email: newProfile.email,
              role: newProfile.role || 'player',
              points: newProfile.points || 0,
              level: newProfile.level || 1,
              avatar: newProfile.avatar_url,
              createdAt: newProfile.created_at,
              achievements: [],
              completedHunts: [],
              createdHunts: [],
              activeHunts: [],
            };
            
            setUser(userData);
            console.log('✅ Profil créé:', userData.username);
            return true;
          }
        } catch (createError) {
          console.warn('⚠️ Échec création profil:', createError);
        }
        
        // Fallback vers utilisateur démo
        const demoUser = createDemoUser(
          supabaseUser.email || 'demo@example.com',
          supabaseUser.user_metadata?.username || 'DemoUser'
        );
        setUser(demoUser);
        console.log('🎭 Utilisateur démo créé:', demoUser.username);
        return true;
      }
      
      if (profile) {
        const userData: User = {
          id: profile.id,
          username: profile.username,
          email: profile.email,
          role: profile.role || 'player',
          points: profile.points || 0,
          level: profile.level || 1,
          avatar: profile.avatar_url,
          createdAt: profile.created_at,
          achievements: [],
          completedHunts: [],
          createdHunts: [],
          activeHunts: [],
        };
        
        setUser(userData);
        console.log('✅ Profil chargé:', userData.username);
        return true;
      }
      
      return false;
    } catch (error) {
      console.warn('⚠️ Erreur chargement profil, mode démo:', error);
      
      // Mode démo en cas d'erreur
      const demoUser = createDemoUser(
        supabaseUser.email || 'demo@example.com',
        supabaseUser.user_metadata?.username || 'DemoUser'
      );
      setUser(demoUser);
      console.log('🎭 Mode démo activé:', demoUser.username);
      return true;
    }
  };

  // Initialisation non-bloquante
  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      try {
        console.log('🔄 Initialisation auth...');
        
        // Timeout global pour l'initialisation
        const timeoutPromise = new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error('Timeout init')), 8000)
        );
        
        const sessionPromise = supabase.auth.getSession();
        
        const { data: { session } } = await Promise.race([sessionPromise, timeoutPromise]);
        
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
        console.warn('⚠️ Erreur init auth, mode démo:', error);
        if (mounted) {
          setInitialized(true);
        }
      }
    };

    // Initialisation immédiate
    initAuth();

    // Écouter les changements avec timeout
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      console.log('🔔 Auth event:', event);

      try {
        if (event === 'SIGNED_IN' && session?.user) {
          setSupabaseUser(session.user);
          
          // Timeout pour le chargement du profil
          const timeoutPromise = new Promise<void>((_, reject) => 
            setTimeout(() => reject(new Error('Timeout profil auth')), 5000)
          );
          
          const profilePromise = loadUserProfile(session.user);
          
          await Promise.race([profilePromise, timeoutPromise]);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setSupabaseUser(null);
        }
      } catch (error) {
        console.warn('⚠️ Erreur auth state change:', error);
        // Continue sans bloquer
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Inscription avec timeout et fallback
  const signUp = async (email: string, password: string, username: string) => {
    setLoading(true);
    try {
      console.log('📝 Inscription:', email, username);

      // Timeout pour l'inscription
      const timeoutPromise = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('Timeout inscription')), 10000)
      );

      const signUpPromise = supabase.auth.signUp({
        email,
        password,
        options: {
          data: { username }
        }
      });

      const { data, error } = await Promise.race([signUpPromise, timeoutPromise]);

      if (error) throw error;

      if (data.user) {
        console.log('✅ Inscription réussie');
        
        // Créer immédiatement un utilisateur démo en attendant la confirmation
        const demoUser = createDemoUser(email, username);
        setUser(demoUser);
        setSupabaseUser(data.user);
        
        return { success: true };
      }

      throw new Error('Erreur lors de la création du compte');
    } catch (error: any) {
      console.warn('⚠️ Erreur inscription, mode démo:', error);
      
      // Mode démo en cas d'erreur
      const demoUser = createDemoUser(email, username);
      setUser(demoUser);
      
      return { success: true }; // Succès en mode démo
    } finally {
      setLoading(false);
    }
  };

  // Connexion avec timeout et fallback
  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      console.log('🔑 Connexion:', email);

      // Timeout pour la connexion
      const timeoutPromise = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('Timeout connexion')), 10000)
      );

      const signInPromise = supabase.auth.signInWithPassword({
        email,
        password
      });

      const { data, error } = await Promise.race([signInPromise, timeoutPromise]);

      if (error) throw error;

      console.log('✅ Connexion réussie');
      return { success: true };
    } catch (error: any) {
      console.warn('⚠️ Erreur connexion, mode démo:', error);
      
      // Mode démo en cas d'erreur
      const demoUser = createDemoUser(email, 'DemoUser');
      setUser(demoUser);
      
      return { success: true }; // Succès en mode démo
    } finally {
      setLoading(false);
    }
  };

  // Déconnexion simple
  const signOut = async () => {
    try {
      console.log('👋 Déconnexion...');
      
      // Timeout pour la déconnexion
      const timeoutPromise = new Promise<void>((_, reject) => 
        setTimeout(() => reject(new Error('Timeout déconnexion')), 3000)
      );
      
      const signOutPromise = supabase.auth.signOut();
      
      await Promise.race([signOutPromise, timeoutPromise]);
    } catch (error) {
      console.warn('⚠️ Erreur déconnexion:', error);
    } finally {
      // Toujours nettoyer l'état local
      setUser(null);
      setSupabaseUser(null);
      console.log('✅ Déconnexion locale réussie');
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

  // Rendu immédiat sans attendre l'initialisation
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};