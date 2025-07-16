import { useState, useEffect } from 'react';
import { auth, db } from '../lib/supabase';
import { User } from '../types';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    console.log('🔄 Initialisation useAuth...');
    
    // Vérifier s'il y a un utilisateur connecté
    const checkCurrentUser = async () => {
      try {
        const { user: currentUser } = await auth.getCurrentUser();
        if (currentUser) {
          console.log('✅ Utilisateur trouvé au démarrage:', currentUser.id);
          await loadUserProfile(currentUser);
        }
      } catch (error) {
        console.error('❌ Erreur vérification utilisateur:', error);
      }
    };

    checkCurrentUser();

    // Écouter les changements d'authentification
    const { data: { subscription } } = auth.onAuthStateChange(async (event, session) => {
      console.log('🔔 Auth state change:', { event, user: session?.user?.id });
      
      if (event === 'SIGNED_IN' && session?.user) {
        await loadUserProfile(session.user);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setIsAuthenticated(false);
        setLoading(false);
      }
    });

    return () => {
      if (subscription?.unsubscribe) {
        subscription.unsubscribe();
      }
    };
  }, []);

  const loadUserProfile = async (supabaseUser: any) => {
    console.log('🔄 Chargement profil:', supabaseUser.id);
    setLoading(true);
    
    try {
      // Essayer de récupérer le profil
      const { data: profile, error } = await db.getUserProfile(supabaseUser.id);
      
      let userData: User;
      
      if (profile && !error) {
        console.log('✅ Profil trouvé');
        userData = {
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
      } else {
        console.log('📝 Création nouveau profil');
        
        const newProfile = {
          id: supabaseUser.id,
          username: supabaseUser.user_metadata?.username || 
                   supabaseUser.email?.split('@')[0] || 
                   'User',
          email: supabaseUser.email || '',
          points: 0,
          level: 1,
        };

        await db.createUserProfile(newProfile);
        
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

      console.log('✅ Profil chargé:', userData.username);
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
  };

  const signUp = async (email: string, password: string, username: string) => {
    console.log('🔄 Hook signUp:', email);
    setLoading(true);
    
    try {
      const { data, error } = await auth.signUp(email, password, username);
      
      if (error) {
        console.error('❌ Erreur inscription:', error);
        setLoading(false);
        return { data: null, error };
      }

      console.log('✅ Inscription réussie');
      
      // Charger le profil immédiatement après inscription
      if (data.user) {
        await loadUserProfile(data.user);
      }
      
      return { data, error: null };
    } catch (error: any) {
      console.error('💥 Exception inscription:', error);
      setLoading(false);
      return { data: null, error: { message: error.message } };
    }
  };

  const signIn = async (email: string, password: string) => {
    console.log('🔄 Hook signIn:', email);
    setLoading(true);
    
    try {
      const { data, error } = await auth.signIn(email, password);
      
      if (error) {
        console.error('❌ Erreur connexion:', error);
        setLoading(false);
        return { data: null, error };
      }

      console.log('✅ Connexion réussie');
      
      // Charger le profil immédiatement après connexion
      if (data.user) {
        await loadUserProfile(data.user);
      }
      
      return { data, error: null };
    } catch (error: any) {
      console.error('💥 Exception connexion:', error);
      setLoading(false);
      return { data: null, error: { message: error.message } };
    }
  };

  const signOut = async () => {
    console.log('🔄 Hook signOut');
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