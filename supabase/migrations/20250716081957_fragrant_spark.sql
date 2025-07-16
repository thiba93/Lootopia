/*
  # Fix user creation trigger

  This migration fixes the database trigger that automatically creates user profiles
  when new users sign up through Supabase Auth.

  1. Functions
    - Creates or replaces the handle_new_user function
    - Ensures proper error handling and constraints

  2. Triggers  
    - Creates the trigger on auth.users table
    - Automatically creates user_profiles entry on signup

  3. Security
    - Maintains RLS policies
    - Ensures proper permissions
*/

-- Create or replace the function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_profiles (id, username, email, points, level, created_at, updated_at)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    new.email,
    0,
    1,
    now(),
    now()
  );
  RETURN new;
EXCEPTION
  WHEN unique_violation THEN
    -- If user already exists, just return
    RETURN new;
  WHEN OTHERS THEN
    -- Log error but don't fail the auth process
    RAISE WARNING 'Error creating user profile: %', SQLERRM;
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Ensure the function has proper permissions
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO authenticated;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;

-- Make sure the user_profiles table allows inserts from the trigger
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Update RLS policies to allow the trigger to insert
CREATE POLICY "Allow trigger to insert user profiles" ON public.user_profiles
  FOR INSERT
  WITH CHECK (true);

-- Ensure existing policies work correctly
DROP POLICY IF EXISTS "Users can read own profile" ON public.user_profiles;
CREATE POLICY "Users can read own profile" ON public.user_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;  
CREATE POLICY "Users can update own profile" ON public.user_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.user_profiles;
CREATE POLICY "Public profiles are viewable by everyone" ON public.user_profiles
  FOR SELECT
  TO authenticated
  USING (true);