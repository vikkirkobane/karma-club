-- Complete Database Schema Update for Karma Club
-- Run this in your Supabase SQL Editor to ensure all tables and columns match the application expectations

-- 1. First, update the profiles table schema to match the application code
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS country_code VARCHAR(10),
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'user',
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;

-- 2. Update the RLS policies for the profiles table
-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;

-- Create policies that match what the application expects
CREATE POLICY "Anyone can view profiles" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- 3. Update the trigger function to handle new columns
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, username, country, organization, avatar_url, is_admin, role)
  VALUES (
    NEW.id, 
    NEW.email, 
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'country',
    NEW.raw_user_meta_data->>'organization',
    NEW.raw_user_meta_data->>'avatar_url',
    COALESCE((NEW.raw_user_meta_data->>'is_admin')::boolean, FALSE),
    COALESCE(NEW.raw_user_meta_data->>'role', 'user')
  );
  
  INSERT INTO public.user_stats (user_id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 5. Create test admin user for demo purposes
-- This will create a user with the demo credentials (demo@karmaclub.org / demo123)
-- Uncomment the following section if you need a test user in your database

/*
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  invited_at,
  confirmation_token,
  confirmation_sent_at,
  recovery_token,
  email_change_token_new,
  email_change,
  email_change_sent_at,
  last_sign_in_at,
  created_at,
  updated_at,
  phone,
  phone_confirmed_at,
  phone_change,
  phone_change_token,
  phone_change_sent_at,
  email_change_token_current,
  email_change_confirm_status,
  banned_until,
  reauthentication_token,
  reauthentication_sent_at
) 
SELECT 
  '00000000-0000-0000-0000-000000000000'::uuid,
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'demo@karmaclub.org',
  crypt('demo123', gen_salt('bf')),
  NOW(),
  NULL,
  '',
  NULL,
  '',
  '',
  '',
  NULL,
  NULL,
  NOW(),
  NOW(),
  NULL,
  NULL,
  '',
  '',
  NULL,
  '',
  0,
  NULL,
  '',
  NULL
WHERE NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'demo@karmaclub.org');
  
-- Insert corresponding profile for demo user
WITH user_data AS (
  SELECT id FROM auth.users WHERE email = 'demo@karmaclub.org' LIMIT 1
)
INSERT INTO public.profiles (id, email, username, country, country_code, organization, avatar_url, is_admin, role)
SELECT 
  ud.id,
  'demo@karmaclub.org',
  'Demo User',
  'United States',
  'US',
  'Karma Club Demo',
  '/placeholder.svg',
  true,
  'admin'
FROM user_data ud
ON CONFLICT (id) DO UPDATE SET
  username = EXCLUDED.username,
  country = EXCLUDED.country,
  country_code = EXCLUDED.country_code,
  organization = EXCLUDED.organization,
  avatar_url = EXCLUDED.avatar_url,
  is_admin = EXCLUDED.is_admin,
  role = EXCLUDED.role;
*/

-- 6. Grant necessary permissions for all tables
GRANT ALL ON public.profiles TO authenticated;
GRANT ALL ON public.user_stats TO authenticated;
GRANT ALL ON public.activities TO authenticated;
GRANT ALL ON public.user_activities TO authenticated;
GRANT ALL ON public.activity_categories TO authenticated;

-- 7. Ensure the trigger function has proper permissions
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO authenticated;

-- Success message
SELECT 'Database schema updated successfully!' as status,
       'All tables now have the required columns for the application to function properly.' as details;