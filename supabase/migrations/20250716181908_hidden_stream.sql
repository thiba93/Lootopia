/*
  # Ajouter colonne role avec logique admin

  1. Modifications
    - Ajouter colonne `role` à la table `user_profiles`
    - Définir 'player' comme valeur par défaut
    - Créer une fonction pour assigner automatiquement le rôle 'organizer' si username contient 'admin'
    - Créer un trigger pour appliquer cette logique lors des insertions/mises à jour

  2. Sécurité
    - Maintenir les politiques RLS existantes
    - Permettre aux utilisateurs de voir leur propre rôle
*/

-- Ajouter la colonne role si elle n'existe pas déjà
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'role'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN role text DEFAULT 'player' CHECK (role IN ('player', 'organizer'));
  END IF;
END $$;

-- Fonction pour assigner automatiquement le rôle basé sur le username
CREATE OR REPLACE FUNCTION assign_role_based_on_username()
RETURNS TRIGGER AS $$
BEGIN
  -- Si le username contient "admin" (insensible à la casse), assigner le rôle organizer
  IF LOWER(NEW.username) LIKE '%admin%' THEN
    NEW.role = 'organizer';
  ELSE
    -- Sinon, s'assurer que le rôle est 'player' par défaut
    IF NEW.role IS NULL THEN
      NEW.role = 'player';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Créer le trigger pour les insertions
DROP TRIGGER IF EXISTS assign_role_trigger ON user_profiles;
CREATE TRIGGER assign_role_trigger
  BEFORE INSERT OR UPDATE OF username ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION assign_role_based_on_username();

-- Mettre à jour les utilisateurs existants
UPDATE user_profiles 
SET role = CASE 
  WHEN LOWER(username) LIKE '%admin%' THEN 'organizer'
  ELSE 'player'
END
WHERE role IS NULL OR role = 'player';

-- Créer un index pour optimiser les requêtes sur le rôle
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);