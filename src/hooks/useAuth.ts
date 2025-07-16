import { useState, useEffect } from 'react';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { auth, db, supabase } from '../lib/supabase';
import { User } from '../types';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      console.log('🔄 Initialisation de l\'authentification...');
      
      try {
        // Récupérer la session actuelle sans timeout
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('❌ Erreur récupération session:', error);
          if (mounted) {
            setLoading(false);
          }
          return;
        }

        console.log('📝 Session récupérée:', { 
          hasSession: !!session, 
          userId: session?.user?.id 
        });

        if (session?.user && mounted) {
          console.log('✅ Session existante trouvée, chargement du profil...');
          await loadUserProfile(session.user);
        } else if (mounted) {
          console.log('ℹ️ Aucune session existante');
          setLoading(false);
        }
      } catch (error) {
        console.error('💥 Exception initialisation auth:', error);
        if (mounted) {
          setLoading(false);
        }
      }
    };

    // Initialiser l'authentification
    initializeAuth();

    // Écouter les changements d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      console.log('🔔 Changement d\'état auth:', { event, userId: session?.user?.id });

      try {
        if (event === 'SIGNED_IN' && session?.user) {
          console.log('✅ Utilisateur connecté, chargement du profil...');
          await loadUserProfile(session.user);
        } else if (event === 'SIGNED_OUT') {
          console.log('👋 Utilisateur déconnecté');
          setUser(null);
          setIsAuthenticated(false);
          setLoading(false);
        } else if (event === 'TOKEN_REFRESHED') {
          console.log('🔄 Token rafraîchi');
          // Ne pas recharger le profil, juste continuer
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error('💥 Erreur changement état auth:', error);
        if (mounted) {
          setLoading(false);
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const loadUserProfile = async (supabaseUser: SupabaseUser) => {
    console.log('🔄 Chargement profil utilisateur:', supabaseUser.id);
    
    try {
      // Essayer de récupérer le profil existant
      const { data: profile, error } = await db.getUserProfile(supabaseUser.id);
      
      let userData: User;

      if (profile && !error) {
        console.log('✅ Profil trouvé en base');
        
        // Charger les achievements de manière sécurisée
        let userAchievements: any[] = [];
        try {
          const { data: achievements } = await db.getUserAchievements(supabaseUser.id);
          userAchievements = achievements || [];
          console.log('📊 Achievements chargés:', userAchievements.length);
        } catch (error) {
          console.warn('⚠️ Erreur chargement achievements (ignorée):', error);
        }
        
        userData = {
          id: profile.id,
          username: profile.username,
          email: profile.email,
          points: profile.points || 0,
          level: profile.level || 1,
          avatar: profile.avatar_url,
          createdAt: profile.created_at,
          achievements: userAchievements.map(ua => ({
            id: ua.achievements?.id || '',
            name: ua.achievements?.name || '',
            description: ua.achievements?.description || '',
            icon: ua.achievements?.icon || '🏆',
            points: ua.achievements?.points || 0,
            rarity: ua.achievements?.rarity || 'common',
            unlockedAt: ua.unlocked_at,
          })),
          completedHunts: [],
          createdHunts: [],
        };
      } else {
        console.log('📝 Profil non trouvé, création d\'un nouveau profil...');
        
        // Créer un nouveau profil
        const newProfile = {
          id: supabaseUser.id,
          username: supabaseUser.user_metadata?.username || 
                   supabaseUser.email?.split('@')[0] || 
                   'User',
          email: supabaseUser.email || '',
          points: 0,
          level: 1,
        };

        try {
          const { data: createdProfile, error: createError } = await db.createUserProfile(newProfile);
          if (createError) {
            console.warn('⚠️ Erreur création profil (continuons quand même):', createError);
          } else {
            console.log('✅ Nouveau profil créé');
          }
        } catch (error) {
          console.warn('⚠️ Exception création profil (continuons quand même):', error);
        }

        userData = {
          id: supabaseUser.id,
          username: newProfile.username,
          email: newProfile.email,
          points: 0,
          level: 1,
          achievements: [],
          createdAt: supabaseUser.created_at || new Date().toISOString(),
          completedHunts: [],
          createdHunts: [],
        };
      }

      console.log('✅ Profil utilisateur chargé:', userData.username);
      setUser(userData);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('💥 Exception chargement profil:', error);
      
      // Créer un utilisateur de fallback pour ne pas bloquer l'app
      const fallbackUser: User = {
        id: supabaseUser.id,
        username: supabaseUser.email?.split('@')[0] || 'User',
        email: supabaseUser.email || '',
        points: 0,
        level: 1,
        achievements: [],
        createdAt: new Date().toISOString(),
        completedHunts: [],
        createdHunts: [],
      };
      
      console.log('🔄 Utilisation du profil de fallback');
      setUser(fallbackUser);
      setIsAuthenticated(true);
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, username: string) => {
    console.log('🔄 Hook signUp appelé pour:', email);
    setLoading(true);
    
    try {
      const { data, error } = await auth.signUp(email, password, username);
      
      if (error) {
        console.error('❌ Erreur inscription hook:', error);
        return { data: null, error };
      }

      console.log('✅ Inscription réussie dans le hook');
      return { data, error: null };
    } catch (error: any) {
      console.error('💥 Exception inscription hook:', error);
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    console.log('🔄 Hook signIn appelé pour:', email);
    setLoading(true);
    
    try {
      const { data, error } = await auth.signIn(email, password);
      
      if (error) {
        console.error('❌ Erreur connexion hook:', error);
        return { data: null, error };
      }

      console.log('✅ Connexion réussie dans le hook');
      return { data, error: null };
    } catch (error: any) {
      console.error('💥 Exception connexion hook:', error);
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    console.log('🔄 Hook signOut appelé');
    setLoading(true);
    
    try {
      const { error } = await auth.signOut();
      
      if (error) {
        console.error('❌ Erreur déconnexion hook:', error);
        throw error;
      }

      console.log('✅ Déconnexion réussie dans le hook');
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('💥 Exception déconnexion hook:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<User>) => {
    if (!user) return;

    try {
      const { data, error } = await db.updateUserProfile(user.id, {
        username: updates.username,
        points: updates.points,
        level: updates.level,
        avatar_url: updates.avatar,
      });

      if (error) {
        throw error;
      }

      if (data) {
        setUser(prev => prev ? { ...prev, ...updates } : null);
      }
    } catch (error) {
      console.error('❌ Erreur mise à jour profil:', error);
    }
  };

  return {
    user,
    loading,
    isAuthenticated,
    signUp,
    signIn,
    signOut,
    updateProfile,
  };
};