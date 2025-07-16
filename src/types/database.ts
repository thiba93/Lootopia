export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string
          username: string
          email: string
          points: number
          level: number
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username: string
          email: string
          points?: number
          level?: number
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string
          email?: string
          points?: number
          level?: number
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      treasure_hunts: {
        Row: {
          id: string
          title: string
          description: string
          difficulty: 'easy' | 'medium' | 'hard'
          category: string
          location_lat: number
          location_lng: number
          location_address: string
          duration: number
          max_participants: number
          participants_count: number
          created_by: string | null
          status: 'draft' | 'active' | 'completed'
          image_url: string | null
          rating: number
          is_public: boolean
          tags: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          difficulty?: 'easy' | 'medium' | 'hard'
          category: string
          location_lat: number
          location_lng: number
          location_address: string
          duration?: number
          max_participants?: number
          participants_count?: number
          created_by?: string | null
          status?: 'draft' | 'active' | 'completed'
          image_url?: string | null
          rating?: number
          is_public?: boolean
          tags?: string[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          difficulty?: 'easy' | 'medium' | 'hard'
          category?: string
          location_lat?: number
          location_lng?: number
          location_address?: string
          duration?: number
          max_participants?: number
          participants_count?: number
          created_by?: string | null
          status?: 'draft' | 'active' | 'completed'
          image_url?: string | null
          rating?: number
          is_public?: boolean
          tags?: string[]
          created_at?: string
          updated_at?: string
        }
      }
      clues: {
        Row: {
          id: string
          hunt_id: string
          order_number: number
          text: string
          hint: string | null
          type: 'text' | 'image' | 'qr' | 'riddle' | 'photo'
          answer: string | null
          location_lat: number
          location_lng: number
          points: number
          radius: number
          created_at: string
        }
        Insert: {
          id?: string
          hunt_id: string
          order_number: number
          text: string
          hint?: string | null
          type?: 'text' | 'image' | 'qr' | 'riddle' | 'photo'
          answer?: string | null
          location_lat: number
          location_lng: number
          points?: number
          radius?: number
          created_at?: string
        }
        Update: {
          id?: string
          hunt_id?: string
          order_number?: number
          text?: string
          hint?: string | null
          type?: 'text' | 'image' | 'qr' | 'riddle' | 'photo'
          answer?: string | null
          location_lat?: number
          location_lng?: number
          points?: number
          radius?: number
          created_at?: string
        }
      }
      rewards: {
        Row: {
          id: string
          hunt_id: string
          name: string
          description: string
          type: 'points' | 'badge' | 'item'
          value: number
          icon: string
          rarity: 'common' | 'rare' | 'epic' | 'legendary'
          created_at: string
        }
        Insert: {
          id?: string
          hunt_id: string
          name: string
          description: string
          type?: 'points' | 'badge' | 'item'
          value?: number
          icon?: string
          rarity?: 'common' | 'rare' | 'epic' | 'legendary'
          created_at?: string
        }
        Update: {
          id?: string
          hunt_id?: string
          name?: string
          description?: string
          type?: 'points' | 'badge' | 'item'
          value?: number
          icon?: string
          rarity?: 'common' | 'rare' | 'epic' | 'legendary'
          created_at?: string
        }
      }
      game_sessions: {
        Row: {
          id: string
          hunt_id: string
          user_id: string
          started_at: string
          completed_at: string | null
          current_clue_index: number
          score: number
          status: 'active' | 'completed' | 'abandoned'
          completed_clues: string[]
          time_spent: number
          hints_used: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          hunt_id: string
          user_id: string
          started_at?: string
          completed_at?: string | null
          current_clue_index?: number
          score?: number
          status?: 'active' | 'completed' | 'abandoned'
          completed_clues?: string[]
          time_spent?: number
          hints_used?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          hunt_id?: string
          user_id?: string
          started_at?: string
          completed_at?: string | null
          current_clue_index?: number
          score?: number
          status?: 'active' | 'completed' | 'abandoned'
          completed_clues?: string[]
          time_spent?: number
          hints_used?: number
          created_at?: string
          updated_at?: string
        }
      }
      achievements: {
        Row: {
          id: string
          name: string
          description: string
          icon: string
          points: number
          rarity: 'common' | 'rare' | 'epic' | 'legendary'
          condition_type: string
          condition_value: Json
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description: string
          icon?: string
          points?: number
          rarity?: 'common' | 'rare' | 'epic' | 'legendary'
          condition_type: string
          condition_value?: Json
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          icon?: string
          points?: number
          rarity?: 'common' | 'rare' | 'epic' | 'legendary'
          condition_type?: string
          condition_value?: Json
          created_at?: string
        }
      }
      user_achievements: {
        Row: {
          id: string
          user_id: string
          achievement_id: string
          unlocked_at: string
        }
        Insert: {
          id?: string
          user_id: string
          achievement_id: string
          unlocked_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          achievement_id?: string
          unlocked_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: string
          title: string
          message: string
          is_read: boolean
          data: Json
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: string
          title: string
          message: string
          is_read?: boolean
          data?: Json
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: string
          title?: string
          message?: string
          is_read?: boolean
          data?: Json
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_level: {
        Args: {
          points: number
        }
        Returns: number
      }
    }
    Enums: {
      clue_type: 'text' | 'image' | 'qr' | 'riddle' | 'photo'
      difficulty_level: 'easy' | 'medium' | 'hard'
      hunt_status: 'draft' | 'active' | 'completed'
      rarity_level: 'common' | 'rare' | 'epic' | 'legendary'
      reward_type: 'points' | 'badge' | 'item'
      session_status: 'active' | 'completed' | 'abandoned'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}