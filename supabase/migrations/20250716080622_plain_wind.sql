/*
  # Création du système de sessions de jeu et d'achievements

  1. Nouvelles Tables
    - `game_sessions`
      - `id` (uuid, primary key)
      - `hunt_id` (uuid, référence treasure_hunts)
      - `user_id` (uuid, référence user_profiles)
      - `started_at` (timestamp)
      - `completed_at` (timestamp, optionnel)
      - `current_clue_index` (integer)
      - `score` (integer)
      - `status` (enum: active, completed, abandoned)
      - `completed_clues` (uuid[])
      - `time_spent` (integer, en secondes)
      - `hints_used` (integer)

    - `achievements`
      - `id` (uuid, primary key)
      - `name` (text)
      - `description` (text)
      - `icon` (text)
      - `points` (integer)
      - `rarity` (enum)
      - `condition_type` (text)
      - `condition_value` (jsonb)

    - `user_achievements`
      - `id` (uuid, primary key)
      - `user_id` (uuid, référence user_profiles)
      - `achievement_id` (uuid, référence achievements)
      - `unlocked_at` (timestamp)

  2. Sécurité
    - Enable RLS sur toutes les tables
    - Politiques appropriées pour chaque table
*/

-- Enum pour le statut de session
CREATE TYPE session_status AS ENUM ('active', 'completed', 'abandoned');

-- Création de la table des sessions de jeu
CREATE TABLE IF NOT EXISTS game_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hunt_id uuid REFERENCES treasure_hunts(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  started_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  current_clue_index integer DEFAULT 0,
  score integer DEFAULT 0,
  status session_status DEFAULT 'active',
  completed_clues uuid[] DEFAULT '{}',
  time_spent integer DEFAULT 0,
  hints_used integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Création de la table des achievements
CREATE TABLE IF NOT EXISTS achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  icon text DEFAULT '🏆',
  points integer DEFAULT 100,
  rarity rarity_level DEFAULT 'common',
  condition_type text NOT NULL,
  condition_value jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Création de la table de liaison user-achievements
CREATE TABLE IF NOT EXISTS user_achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  achievement_id uuid REFERENCES achievements(id) ON DELETE CASCADE NOT NULL,
  unlocked_at timestamptz DEFAULT now(),
  UNIQUE(user_id, achievement_id)
);

-- Création de la table des notifications
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  type text NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  is_read boolean DEFAULT false,
  data jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE game_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour les sessions de jeu
CREATE POLICY "Users can read own game sessions"
  ON game_sessions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own game sessions"
  ON game_sessions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own game sessions"
  ON game_sessions
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Politiques RLS pour les achievements
CREATE POLICY "Achievements are viewable by everyone"
  ON achievements
  FOR SELECT
  TO authenticated
  USING (true);

-- Politiques RLS pour les user_achievements
CREATE POLICY "Users can read own achievements"
  ON user_achievements
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can unlock achievements"
  ON user_achievements
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Politiques RLS pour les notifications
CREATE POLICY "Users can read own notifications"
  ON notifications
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON notifications
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Index pour les performances
CREATE INDEX IF NOT EXISTS idx_game_sessions_user_id ON game_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_game_sessions_hunt_id ON game_sessions(hunt_id);
CREATE INDEX IF NOT EXISTS idx_game_sessions_status ON game_sessions(status);
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(user_id, is_read);

-- Contrainte pour éviter les sessions multiples actives
CREATE UNIQUE INDEX IF NOT EXISTS idx_active_session_unique 
ON game_sessions(user_id, hunt_id) 
WHERE status = 'active';