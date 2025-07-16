/*
  # Création du système d'indices et de récompenses

  1. Nouvelles Tables
    - `clues`
      - `id` (uuid, primary key)
      - `hunt_id` (uuid, référence treasure_hunts)
      - `order_number` (integer)
      - `text` (text)
      - `hint` (text, optionnel)
      - `type` (enum: text, image, qr, riddle, photo)
      - `answer` (text, optionnel)
      - `location_lat` (decimal)
      - `location_lng` (decimal)
      - `points` (integer)
      - `radius` (integer, en mètres)

    - `rewards`
      - `id` (uuid, primary key)
      - `hunt_id` (uuid, référence treasure_hunts)
      - `name` (text)
      - `description` (text)
      - `type` (enum: points, badge, item)
      - `value` (integer)
      - `icon` (text)
      - `rarity` (enum: common, rare, epic, legendary)

  2. Sécurité
    - Enable RLS sur les deux tables
    - Politiques pour lire les indices/récompenses des chasses publiques
*/

-- Enum pour le type d'indice
CREATE TYPE clue_type AS ENUM ('text', 'image', 'qr', 'riddle', 'photo');

-- Enum pour le type de récompense
CREATE TYPE reward_type AS ENUM ('points', 'badge', 'item');

-- Enum pour la rareté
CREATE TYPE rarity_level AS ENUM ('common', 'rare', 'epic', 'legendary');

-- Création de la table des indices
CREATE TABLE IF NOT EXISTS clues (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hunt_id uuid REFERENCES treasure_hunts(id) ON DELETE CASCADE NOT NULL,
  order_number integer NOT NULL,
  text text NOT NULL,
  hint text,
  type clue_type DEFAULT 'text',
  answer text,
  location_lat decimal(10, 8) NOT NULL,
  location_lng decimal(11, 8) NOT NULL,
  points integer DEFAULT 100,
  radius integer DEFAULT 50,
  created_at timestamptz DEFAULT now()
);

-- Création de la table des récompenses
CREATE TABLE IF NOT EXISTS rewards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hunt_id uuid REFERENCES treasure_hunts(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  description text NOT NULL,
  type reward_type DEFAULT 'badge',
  value integer DEFAULT 100,
  icon text DEFAULT '🏆',
  rarity rarity_level DEFAULT 'common',
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE clues ENABLE ROW LEVEL SECURITY;
ALTER TABLE rewards ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour les indices
CREATE POLICY "Clues are viewable for public hunts"
  ON clues
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM treasure_hunts 
      WHERE id = hunt_id 
      AND is_public = true 
      AND status = 'active'
    )
  );

CREATE POLICY "Hunt creators can manage clues"
  ON clues
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM treasure_hunts 
      WHERE id = hunt_id 
      AND created_by = auth.uid()
    )
  );

-- Politiques RLS pour les récompenses
CREATE POLICY "Rewards are viewable for public hunts"
  ON rewards
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM treasure_hunts 
      WHERE id = hunt_id 
      AND is_public = true 
      AND status = 'active'
    )
  );

CREATE POLICY "Hunt creators can manage rewards"
  ON rewards
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM treasure_hunts 
      WHERE id = hunt_id 
      AND created_by = auth.uid()
    )
  );

-- Index pour les performances
CREATE INDEX IF NOT EXISTS idx_clues_hunt_id ON clues(hunt_id);
CREATE INDEX IF NOT EXISTS idx_clues_order ON clues(hunt_id, order_number);
CREATE INDEX IF NOT EXISTS idx_rewards_hunt_id ON rewards(hunt_id);

-- Contrainte pour assurer l'ordre unique des indices par chasse
CREATE UNIQUE INDEX IF NOT EXISTS idx_clues_hunt_order_unique ON clues(hunt_id, order_number);