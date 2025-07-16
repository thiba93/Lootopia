/*
  # Création du profil utilisateur et système d'authentification

  1. Nouvelles Tables
    - `user_profiles`
      - `id` (uuid, référence auth.users)
      - `username` (text, unique)
      - `points` (integer, défaut 0)
      - `level` (integer, défaut 1)
      - `avatar_url` (text, optionnel)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Sécurité
    - Enable RLS sur `user_profiles`
    - Politique pour que les utilisateurs puissent lire/modifier leur propre profil
    - Politique pour que tous puissent voir les profils publics (username, level, points)

  3. Fonctions
    - Trigger pour créer automatiquement un profil lors de l'inscription
    - Fonction pour calculer le niveau basé sur les points
*/

-- Création de la table des profils utilisateurs
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username text UNIQUE NOT NULL,
  email text NOT NULL,
  points integer DEFAULT 0,
  level integer DEFAULT 1,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Politiques RLS
CREATE POLICY "Users can read own profile"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Public profiles are viewable by everyone"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (true);

-- Fonction pour calculer le niveau basé sur les points
CREATE OR REPLACE FUNCTION calculate_level(points integer)
RETURNS integer AS $$
BEGIN
  RETURN FLOOR(points / 1000) + 1;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour mettre à jour automatiquement le niveau
CREATE OR REPLACE FUNCTION update_user_level()
RETURNS trigger AS $$
BEGIN
  NEW.level = calculate_level(NEW.points);
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour mettre à jour le niveau automatiquement
CREATE TRIGGER update_user_level_trigger
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_user_level();

-- Fonction pour créer un profil automatiquement lors de l'inscription
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO user_profiles (id, username, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger pour créer le profil automatiquement
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();