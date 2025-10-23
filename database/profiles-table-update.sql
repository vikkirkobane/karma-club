-- Update the profiles table to include missing columns expected by the application
-- This SQL file addresses common schema mismatches that cause authentication errors

-- Add missing columns to the profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS country_code VARCHAR(10),
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'user',
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;

-- Update the RLS policies for the profiles table to match the community setup
-- This allows proper access patterns expected by the application

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

-- Create new policies that allow broader access as needed by the application
CREATE POLICY "Anyone can view profiles" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Update the trigger function to include the new columns
-- First drop the existing trigger and function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, username, country_code, is_admin, role)
  VALUES (NEW.id, NEW.email, 
          COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
          NEW.raw_user_meta_data->>'country_code',
          COALESCE(NEW.raw_user_meta_data->>'is_admin', 'false')::boolean,
          COALESCE(NEW.raw_user_meta_data->>'role', 'user'));
  
  INSERT INTO public.user_stats (user_id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create a demo user for testing (optional)
-- Uncomment the following lines to create a test user with admin privileges
/*
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at) 
VALUES (
  gen_random_uuid(),
  'demo@karmaclub.org',
  crypt('demo123', gen_salt('bf')), -- This encrypts the password 'demo123'
  NOW()
) ON CONFLICT (email) DO NOTHING;

-- Insert the corresponding profile
WITH user_data AS (
  SELECT id FROM auth.users WHERE email = 'demo@karmaclub.org'
)
INSERT INTO public.profiles (id, email, username, country, country_code, organization, is_admin, role)
SELECT 
  id, 
  'demo@karmaclub.org',
  'Demo User',
  'United States',
  'US',
  'Karma Club',
  true,
  'admin'
FROM user_data
ON CONFLICT (id) DO UPDATE SET
  username = EXCLUDED.username,
  country = EXCLUDED.country,
  country_code = EXCLUDED.country_code,
  organization = EXCLUDED.organization,
  is_admin = EXCLUDED.is_admin,
  role = EXCLUDED.role;
*/