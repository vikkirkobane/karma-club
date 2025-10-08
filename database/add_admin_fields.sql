-- Add admin fields to profiles table
-- Run this in your Supabase SQL Editor

-- Add is_admin column
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- Add role column
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user';

-- Create index for faster admin queries
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_is_admin ON profiles(is_admin);

-- Make a specific user admin by email
UPDATE profiles 
SET is_admin = TRUE, 
    role = 'admin' 
WHERE email = 'your-email@example.com';

-- View all admin users
SELECT id, username, email, is_admin, role 
FROM profiles 
WHERE is_admin = TRUE OR role = 'admin';
