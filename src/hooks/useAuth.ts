import { useState, useEffect } from 'react';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { auth, db } from '../lib/supabase';
import { User } from '../types';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { user: supabaseUser } = await auth.getCurrentUser();
        if (supabaseUser) {
          await loadUserProfile(supabaseUser);
        }
      } catch (error) {
        console.error('Error getting initial session:', error);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        await loadUserProfile(session.user);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setIsAuthenticated(false);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadUserProfile = async (supabaseUser: SupabaseUser) => {
    try {
      const { data: profile, error } = await db.getUserProfile(supabaseUser.id);
      
      if (error) {
        console.error('Error loading user profile:', error);
        return;
      }

      if (profile) {
        // Get user achievements
        const { data: userAchievements } = await db.getUserAchievements(supabaseUser.id);
        
        const userData: User = {
          id: profile.id,
          username: profile.username,
          email: profile.email,
          points: profile.points,
          level: profile.level,
          avatar: profile.avatar_url,
          createdAt: profile.created_at,
          achievements: userAchievements?.map(ua => ({
            id: ua.achievements.id,
            name: ua.achievements.name,
            description: ua.achievements.description,
            icon: ua.achievements.icon,
            points: ua.achievements.points,
            rarity: ua.achievements.rarity,
            unlockedAt: ua.unlocked_at,
          })) || [],
          completedHunts: [], // Will be loaded separately if needed
          createdHunts: [], // Will be loaded separately if needed
        };

        setUser(userData);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
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