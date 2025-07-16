import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/database';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log('🔍 Supabase Config:', {
  url: supabaseUrl ? 'Present' : 'Missing',
  key: supabaseAnonKey ? 'Present' : 'Missing',
  urlValue: supabaseUrl
});

// Créer le client Supabase
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    flowType: 'implicit'
  }
});

export const isSupabaseAvailable = !!(supabaseUrl && supabaseAnonKey);

// Export db object with database operations
export const db = {
  // Game Sessions
  async getGameSession(userId: string, huntId: string) {
    const { data, error } = await supabase
      .from('game_sessions')
      .select('*')
      .eq('user_id', userId)
      .eq('hunt_id', huntId)
      .eq('status', 'active')
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  async createGameSession(userId: string, huntId: string) {
    const { data, error } = await supabase
      .from('game_sessions')
      .insert({
        user_id: userId,
        hunt_id: huntId,
        status: 'active',
        current_clue_index: 0,
        score: 0
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateGameSession(sessionId: string, updates: any) {
    const { data, error } = await supabase
      .from('game_sessions')
      .update(updates)
      .eq('id', sessionId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Treasure Hunts
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
    
    if (error) throw error;
    return data || [];
  },

  async createTreasureHunt(huntData: any) {
    const { data, error } = await supabase
      .from('treasure_hunts')
      .insert(huntData)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
};