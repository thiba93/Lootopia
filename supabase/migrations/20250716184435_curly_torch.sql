/*
  # Correction des politiques RLS pour permettre la connexion de tous les utilisateurs

  1. Problème identifié
    - Les politiques RLS empêchent la création/lecture des profils non-admin
    - Le trigger assign_role_based_on_username peut causer des conflits
    
  2. Solutions
    - Corriger les politiques RLS pour permettre l'accès à tous
    - Simplifier le trigger de rôle
    - Assurer la création automatique des profils
*/

-- Supprimer les anciennes politiques restrictives
DROP POLICY IF EXISTS "Users can read own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Allow trigger to insert user profiles" ON user_profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON user_profiles;

-- Créer des politiques plus permissives
CREATE POLICY "Enable read access for authenticated users" ON user_profiles
    FOR SELECT USING (auth.uid() = id OR auth.uid() IS NOT NULL);

CREATE POLICY "Enable insert for authenticated users" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Enable update for own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = id);

-- Fonction améliorée pour assigner les rôles
CREATE OR REPLACE FUNCTION assign_role_based_on_username()
RETURNS TRIGGER AS $$
BEGIN
    -- Assigner le rôle basé sur le username
    IF LOWER(NEW.username) LIKE '%admin%' THEN
        NEW.role = 'organizer';
    ELSE
        NEW.role = 'player';
    END IF;
    
    -- S'assurer que les valeurs par défaut sont définies
    IF NEW.points IS NULL THEN
        NEW.points = 0;
    END IF;
    
    IF NEW.level IS NULL THEN
        NEW.level = 1;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recréer le trigger
DROP TRIGGER IF EXISTS assign_role_trigger ON user_profiles;
CREATE TRIGGER assign_role_trigger
    BEFORE INSERT OR UPDATE OF username ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION assign_role_based_on_username();

-- Fonction pour gérer la création automatique des profils
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profiles (id, username, email, role, points, level)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
        NEW.email,
        CASE 
            WHEN LOWER(COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1))) LIKE '%admin%' 
            THEN 'organizer'::text
            ELSE 'player'::text
        END,
        0,
        1
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        username = COALESCE(EXCLUDED.username, user_profiles.username);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Créer le trigger pour les nouveaux utilisateurs
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Mettre à jour les utilisateurs existants sans profil
INSERT INTO user_profiles (id, username, email, role, points, level)
SELECT 
    au.id,
    COALESCE(au.raw_user_meta_data->>'username', split_part(au.email, '@', 1)),
    au.email,
    CASE 
        WHEN LOWER(COALESCE(au.raw_user_meta_data->>'username', split_part(au.email, '@', 1))) LIKE '%admin%' 
        THEN 'organizer'::text
        ELSE 'player'::text
    END,
    0,
    1
FROM auth.users au
LEFT JOIN user_profiles up ON au.id = up.id
WHERE up.id IS NULL
ON CONFLICT (id) DO NOTHING;