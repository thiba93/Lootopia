import { useState, useEffect, useCallback } from 'react';
import { auth, db } from '../lib/supabase';
import { User } from '../types';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [initialized, setInitialized] = useState(false);

  // Fonction pour charger le profil utilisateur
  const loadUserProfile = useCallback(async (supabaseUser: any) => {
    if (!supabaseUser?.id) return;
    
    console.log('🔄 Chargement profil utilisateur:', supabaseUser.id);
    setLoading(true);
    
    try {
      // Essayer de récupérer le profil existant
      const { data: profile, error } = await db.getUserProfile(supabaseUser.id);
      
      let userData: User;
      
      if (profile && !error) {
        console.log('✅ Profil existant trouvé');
        
        // Charger les achievements
        let achievements: any[] = [];
        try {
          const { data: userAchievements } = await db.getUserAchievements(supabaseUser.id);
          if (userAchievements) {
            achievements = userAchievements.map((ua: any) => ({
              id: ua.achievements.id,
              name: ua.achievements.name,
              description: ua.achievements.description,
              icon: ua.achievements.icon,
              points: ua.achievements.points,
              rarity: ua.achievements.rarity,
              unlockedAt: ua.unlocked_at
            }));
          }
        } catch (achievementError) {
          console.warn('⚠️ Erreur chargement achievements:', achievementError);
        }
        
        userData = {
          id: profile.id,
          username: profile.username,
          email: profile.email,
          points: profile.points || 0,
          level: profile.level || 1,
          avatar: profile.avatar_url,
          createdAt: profile.created_at,
          achievements,
          completedHunts: [],
          createdHunts: [],
        };
      } else {
        console.log('📝 Création nouveau profil utilisateur');
        
        const newProfile = {
          id: supabaseUser.id,
          username: supabaseUser.user_metadata?.username || 
                   supabaseUser.email?.split('@')[0] || 
                   'User',
          email: supabaseUser.email || '',
          points: 0,
          level: 1,
        };

        const { error: createError } = await db.createUserProfile(newProfile);
        
        if (createError) {
          console.error('❌ Erreur création profil:', createError);
        } else {
          console.log('✅ Profil créé avec succès');
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
      console.error('❌ Erreur chargement profil:', error);
      
      // Créer un utilisateur de fallback
      const fallbackUser: User = {
        id: supabaseUser.id,
        username: supabaseUser.user_metadata?.username || 'User',
        email: supabaseUser.email || '',
        points: 0,
        level: 1,
        achievements: [],
        createdAt: new Date().toISOString(),
        completedHunts: [],
        createdHunts: [],
      };
      
      setUser(fallbackUser);
      setIsAuthenticated(true);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initialisation une seule fois
  useEffect(() => {
    if (initialized) return;
    
    console.log('🔄 Initialisation de l\'authentification...');
    
    let authSubscription: any = null;
    
    const initAuth = async () => {
      try {
        // Vérifier s'il y a un utilisateur connecté
        const { user: currentUser } = await auth.getCurrentUser();
        if (currentUser) {
          console.log('✅ Utilisateur trouvé au démarrage:', currentUser.id);
          await loadUserProfile(currentUser);
        }

        // Écouter les changements d'authentification
        authSubscription = auth.onAuthStateChange(async (event, session) => {
          console.log('🔔 Changement d\'état auth:', { event, userId: session?.user?.id });
          
          if (event === 'SIGNED_IN' && session?.user) {
            console.log('✅ Utilisateur connecté, chargement du profil...');
            await loadUserProfile(session.user);
          } else if (event === 'SIGNED_OUT') {
            console.log('👋 Utilisateur déconnecté');
            setUser(null);
            setIsAuthenticated(false);
            setLoading(false);
          }
        });
      } catch (error) {
        console.error('❌ Erreur initialisation auth:', error);
      } finally {
        setInitialized(true);
      }
    };

    initAuth();

    return () => {
      if (authSubscription?.data?.subscription?.unsubscribe) {
        authSubscription.data.subscription.unsubscribe();
      }
    };
  }, [initialized, loadUserProfile]);

  const signUp = async (email: string, password: string, username: string) => {
    console.log('🔄 Tentative d\'inscription:', { email, username });
    setLoading(true);
    
    try {
      const { data, error } = await auth.signUp(email, password, username);
      
      if (error) {
        console.error('❌ Erreur inscription:', error);
        return { data: null, error };
      }

      console.log('✅ Inscription réussie');
      return { data, error: null };
    } catch (error: any) {
      console.error('💥 Exception inscription:', error);
      return { data: null, error: { message: error.message } };
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    console.log('🔄 Tentative de connexion:', email);
    setLoading(true);
    
    try {
      const { data, error } = await auth.signIn(email, password);
      
      if (error) {
        console.error('❌ Erreur connexion:', error);
        return { data: null, error };
      }

      console.log('✅ Connexion réussie');
      return { data, error: null };
    } catch (error: any) {
      console.error('💥 Exception connexion:', error);
      return { data: null, error: { message: error.message } };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    console.log('🔄 Déconnexion...');
    setLoading(true);
    
    try {
      const { error } = await auth.signOut();
      
      if (error) {
        console.error('❌ Erreur déconnexion:', error);
        throw error;
      }

      console.log('✅ Déconnexion réussie');
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('💥 Exception déconnexion:', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    loading,
    isAuthenticated,
    signUp,
    signIn,
    signOut,
  };
};