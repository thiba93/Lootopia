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
    let timeoutId: NodeJS.Timeout;

    const initializeAuth = async () => {
      try {
        // Set a maximum loading time of 10 seconds
        timeoutId = setTimeout(() => {
          if (mounted) {
            console.warn('Auth initialization timeout - proceeding without auth');
            setLoading(false);
          }
        }, 10000);

        // Get initial session with timeout
        const sessionPromise = supabase.auth.getSession();
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Session timeout')), 5000)
        );

        const { data: { session }, error } = await Promise.race([
          sessionPromise,
          timeoutPromise
        ]) as any;
        
        if (error) {
          console.error('Error getting session:', error);
          if (mounted) {
            setLoading(false);
          }
          return;
        }

        if (session?.user && mounted) {
          await loadUserProfile(session.user);
        } else if (mounted) {
          setLoading(false);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        if (mounted) {
          setLoading(false);
        }
      } finally {
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
      }
    };

    // Initialize auth
    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      try {
        if (event === 'SIGNED_IN' && session?.user) {
          await loadUserProfile(session.user);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setIsAuthenticated(false);
          setLoading(false);
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error('Error in auth state change:', error);
        if (mounted) {
          setLoading(false);
        }
      }
    });

    return () => {
      mounted = false;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      subscription.unsubscribe();
    };
  }, []);

  const loadUserProfile = async (supabaseUser: SupabaseUser) => {
    try {
      const { data: profile, error } = await db.getUserProfile(supabaseUser.id);
      
      if (error) {
        console.error('Error loading user profile:', error);
        // Continue without profile data
        const basicUser: User = {
          id: supabaseUser.id,
          username: supabaseUser.user_metadata?.username || supabaseUser.email?.split('@')[0] || 'User',
          email: supabaseUser.email || '',
          points: 0,
          level: 1,
          achievements: [],
          createdAt: supabaseUser.created_at || new Date().toISOString(),
          completedHunts: [],
          createdHunts: [],
        };
        
        setUser(basicUser);
        setIsAuthenticated(true);
        setLoading(false);
        return;
      }

      if (profile) {
        // Get user achievements with error handling
        let userAchievements: any[] = [];
        try {
          const { data: achievements } = await db.getUserAchievements(supabaseUser.id);
          userAchievements = achievements || [];
        } catch (error) {
          console.error('Error loading achievements:', error);
        }
        
        const userData: User = {
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

        setUser(userData);
        setIsAuthenticated(true);
      } else {
        // Profile doesn't exist, create basic user
        const basicUser: User = {
          id: supabaseUser.id,
          username: supabaseUser.user_metadata?.username || supabaseUser.email?.split('@')[0] || 'User',
          email: supabaseUser.email || '',
          points: 0,
          level: 1,
          achievements: [],
          createdAt: supabaseUser.created_at || new Date().toISOString(),
          completedHunts: [],
          createdHunts: [],
        };
        
        setUser(basicUser);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
      // Create fallback user
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
      
      setUser(fallbackUser);
      setIsAuthenticated(true);
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, username: string) => {
    try {
      setLoading(true);
      const { data, error } = await auth.signUp(email, password, username);
      
      if (error) {
        throw error;
      }

      return { data, error: null };
    } catch (error: any) {
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { data, error } = await auth.signIn(email, password);
      
      if (error) {
        throw error;
      }

      return { data, error: null };
    } catch (error: any) {
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      const { error } = await auth.signOut();
      
      if (error) {
        throw error;
      }

      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Error signing out:', error);
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
      console.error('Error updating profile:', error);
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