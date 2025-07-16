/*
  # Création du système de chasses au trésor

  1. Nouvelles Tables
    - `treasure_hunts`
      - `id` (uuid, primary key)
      - `title` (text)
      - `description` (text)
      - `difficulty` (enum: easy, medium, hard)
      - `category` (text)
      - `location_lat` (decimal)
      - `location_lng` (decimal)
      - `location_address` (text)
      - `duration` (integer, en minutes)
      - `max_participants` (integer)
      - `participants_count` (integer, défaut 0)
      - `created_by` (uuid, référence user_profiles)
      - `status` (enum: draft, active, completed)
      - `image_url` (text)
      - `rating` (decimal, défaut 0)
      - `is_public` (boolean, défaut true)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Sécurité
    - Enable RLS sur `treasure_hunts`
    - Politique pour que tous puissent voir les chasses publiques
    - Politique pour que les créateurs puissent modifier leurs chasses
*/

-- Enum pour la difficulté
CREATE TYPE difficulty_level AS ENUM ('easy', 'medium', 'hard');

-- Enum pour le statut
CREATE TYPE hunt_status AS ENUM ('draft', 'active', 'completed');

-- Création de la table des chasses au trésor
CREATE TABLE IF NOT EXISTS treasure_hunts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  difficulty difficulty_level DEFAULT 'medium',
  category text NOT NULL,
  location_lat decimal(10, 8) NOT NULL,
  location_lng decimal(11, 8) NOT NULL,
  location_address text NOT NULL,
  duration integer DEFAULT 60,
  max_participants integer DEFAULT 50,
  participants_count integer DEFAULT 0,
  created_by uuid REFERENCES user_profiles(id) ON DELETE CASCADE,
  status hunt_status DEFAULT 'active',
  image_url text,
  rating decimal(3, 2) DEFAULT 0,
  is_public boolean DEFAULT true,
  tags text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE treasure_hunts ENABLE ROW LEVEL SECURITY;

-- Politiques RLS
CREATE POLICY "Public hunts are viewable by everyone"
  ON treasure_hunts
  FOR SELECT
  TO authenticated
  USING (is_public = true AND status = 'active');

CREATE POLICY "Users can create hunts"
  ON treasure_hunts
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update own hunts"
  ON treasure_hunts
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by);

CREATE POLICY "Users can delete own hunts"
  ON treasure_hunts
  FOR DELETE
  TO authenticated
  USING (auth.uid() = created_by);

-- Index pour les performances
CREATE INDEX IF NOT EXISTS idx_treasure_hunts_status ON treasure_hunts(status);
CREATE INDEX IF NOT EXISTS idx_treasure_hunts_difficulty ON treasure_hunts(difficulty);
CREATE INDEX IF NOT EXISTS idx_treasure_hunts_category ON treasure_hunts(category);
CREATE INDEX IF NOT EXISTS idx_treasure_hunts_created_by ON treasure_hunts(created_by);