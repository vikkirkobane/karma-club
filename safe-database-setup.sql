-- Safe Database Setup for Karma Club
-- This file contains SQL that safely handles existing database elements

-- ===========================================
-- PART 1: Main Database Schema (with safe creation)
-- ===========================================

-- Create profiles table (if it doesn't exist)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username VARCHAR(255),
  email VARCHAR(255),
  country VARCHAR(255),
  organization VARCHAR(255),
  avatar_url VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add missing columns for compatibility with application (only if they don't exist)
DO $$ 
BEGIN
  BEGIN
    ALTER TABLE public.profiles ADD COLUMN country_code VARCHAR(10);
  EXCEPTION
    WHEN duplicate_column THEN
      RAISE NOTICE 'column country_code already exists in profiles';
  END;

  BEGIN
    ALTER TABLE public.profiles ADD COLUMN is_admin BOOLEAN DEFAULT FALSE;
  EXCEPTION
    WHEN duplicate_column THEN
      RAISE NOTICE 'column is_admin already exists in profiles';
  END;

  BEGIN
    ALTER TABLE public.profiles ADD COLUMN role VARCHAR(20) DEFAULT 'user';
  EXCEPTION
    WHEN duplicate_column THEN
      RAISE NOTICE 'column role already exists in profiles';
  END;
END $$;

-- Create user_stats table (if it doesn't exist)
CREATE TABLE IF NOT EXISTS public.user_stats (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  points INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  streak INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create activity_categories table (if it doesn't exist)
CREATE TABLE IF NOT EXISTS public.activity_categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  icon VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create activities table (if it doesn't exist)
CREATE TABLE IF NOT EXISTS public.activities (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category_id INTEGER REFERENCES public.activity_categories(id),
  points INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create user_activities table (if it doesn't exist)
CREATE TABLE IF NOT EXISTS public.user_activities (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_id INTEGER REFERENCES public.activities(id) ON DELETE CASCADE,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  media_url VARCHAR(255),
  description TEXT,
  points_earned INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'pending',
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID REFERENCES auth.users(id),
  review_notes TEXT,
  submission_title VARCHAR(255)
);

-- Insert sample data if needed (avoiding conflicts)
INSERT INTO public.activity_categories (name, description, icon) VALUES
  ('Environment', 'Activities that help protect and improve the environment', '🌱'),
  ('Community', 'Activities that strengthen local communities', '🤝'),
  ('Education', 'Activities that promote learning and knowledge sharing', '📚'),
  ('Health', 'Activities that promote physical and mental wellbeing', '💪'),
  ('Charity', 'Activities that help those in need', '❤️')
ON CONFLICT DO NOTHING;

INSERT INTO public.activities (title, description, category_id, points) VALUES
  ('Plant a Tree', 'Plant a tree in your local area or participate in a tree-planting event', 1, 10),
  ('Beach Cleanup', 'Participate in or organize a beach or park cleanup', 1, 15),
  ('Recycle Electronics', 'Properly dispose of old electronics at a recycling center', 1, 5),
  ('Volunteer at Food Bank', 'Help sort and distribute food at a local food bank', 2, 20),
  ('Mentor Someone', 'Provide guidance and support to someone in your community', 2, 25),
  ('Donate Blood', 'Donate blood to help save lives', 4, 15),
  ('Read to Children', 'Read stories to children at a library or school', 3, 10),
  ('Teach a Skill', 'Share your knowledge by teaching others a valuable skill', 3, 20),
  ('Visit Elderly', 'Spend time with elderly residents at a care facility', 5, 15),
  ('Donate Clothes', 'Donate gently used clothing to those in need', 5, 5)
ON CONFLICT DO NOTHING;

-- Create function to automatically create profile on signup
-- First drop if exists to handle potential conflicts
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, username)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)));
  
  INSERT INTO public.user_stats (user_id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to run the function on new user signup
-- First drop if exists to handle potential conflicts
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ===========================================
-- PART 2: Community Features Schema (safe creation)
-- ===========================================

-- Create community_posts table (if it doesn't exist)
CREATE TABLE IF NOT EXISTS public.community_posts (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  media_url TEXT,
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  is_pinned BOOLEAN DEFAULT FALSE,
  is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create post_likes table (if it doesn't exist)
CREATE TABLE IF NOT EXISTS public.post_likes (
  id BIGSERIAL PRIMARY KEY,
  post_id BIGINT REFERENCES public.community_posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(post_id, user_id)
);

-- Create post_comments table (if it doesn't exist)
CREATE TABLE IF NOT EXISTS public.post_comments (
  id BIGSERIAL PRIMARY KEY,
  post_id BIGINT REFERENCES public.community_posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  parent_comment_id BIGINT REFERENCES public.post_comments(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create post_reports table (if it doesn't exist)
CREATE TABLE IF NOT EXISTS public.post_reports (
  id BIGSERIAL PRIMARY KEY,
  post_id BIGINT REFERENCES public.community_posts(id),
  comment_id BIGINT REFERENCES public.post_comments(id),
  reporter_user_id UUID REFERENCES auth.users(id) NOT NULL,
  reason TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending',
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create community_challenges table (if it doesn't exist)
CREATE TABLE IF NOT EXISTS public.community_challenges (
  id BIGSERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  reward_points INTEGER DEFAULT 0,
  reward_badge VARCHAR(255),
  participants_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create challenge_participants table (if it doesn't exist)
CREATE TABLE IF NOT EXISTS public.challenge_participants (
  id BIGSERIAL PRIMARY KEY,
  challenge_id BIGINT REFERENCES public.community_challenges(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  progress INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT FALSE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Create contact_messages table (if it doesn't exist)
CREATE TABLE IF NOT EXISTS public.contact_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  subject VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'new',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ===========================================
-- PART 3: Row Level Security (safe setup)
-- ===========================================

-- Enable RLS for all tables (only if not already enabled)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenge_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist, then create new ones
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Anyone can view profiles" ON public.profiles;
  DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
  DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
  
  DROP POLICY IF EXISTS "Users can view own stats" ON public.user_stats;
  DROP POLICY IF EXISTS "Users can update own stats" ON public.user_stats;
  DROP POLICY IF EXISTS "Users can insert own stats" ON public.user_stats;
  
  DROP POLICY IF EXISTS "Anyone can view active activities" ON public.activities;
  
  DROP POLICY IF EXISTS "Users can view own activities" ON public.user_activities;
  DROP POLICY IF EXISTS "Users can insert own activities" ON public.user_activities;
  
  DROP POLICY IF EXISTS "Anyone can view community posts" ON public.community_posts;
  DROP POLICY IF EXISTS "Authenticated users can create posts" ON public.community_posts;
  DROP POLICY IF EXISTS "Users can update own posts" ON public.community_posts;
  DROP POLICY IF EXISTS "Users can delete own posts" ON public.community_posts;
  
  DROP POLICY IF EXISTS "Anyone can view post likes" ON public.post_likes;
  DROP POLICY IF EXISTS "Authenticated users can like posts" ON public.post_likes;
  DROP POLICY IF EXISTS "Users can unlike their own likes" ON public.post_likes;
  
  DROP POLICY IF EXISTS "Anyone can view post comments" ON public.post_comments;
  DROP POLICY IF EXISTS "Authenticated users can create comments" ON public.post_comments;
  DROP POLICY IF EXISTS "Users can update own comments" ON public.post_comments;
  DROP POLICY IF EXISTS "Users can delete own comments" ON public.post_comments;
  
  DROP POLICY IF EXISTS "Anyone can view post reports" ON public.post_reports;
  DROP POLICY IF EXISTS "Reporters can create reports" ON public.post_reports;
  DROP POLICY IF EXISTS "Admins can manage reports" ON public.post_reports;
  
  DROP POLICY IF EXISTS "Anyone can view challenges" ON public.community_challenges;
  DROP POLICY IF EXISTS "Authenticated users can join challenges" ON public.community_challenges;
  
  DROP POLICY IF EXISTS "Users can view own challenge participation" ON public.challenge_participants;
  DROP POLICY IF EXISTS "Users can join challenges" ON public.challenge_participants;
  
  DROP POLICY IF EXISTS "Anyone can submit contact messages" ON public.contact_messages;
  DROP POLICY IF EXISTS "Admins can view all contact messages" ON public.contact_messages;
END $$;

-- Profiles policies
CREATE POLICY "Anyone can view profiles" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- User stats policies
CREATE POLICY "Users can view own stats" ON public.user_stats
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own stats" ON public.user_stats
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own stats" ON public.user_stats
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Activity policies
CREATE POLICY "Anyone can view active activities" ON public.activities
  FOR SELECT USING (is_active = true);

-- User activities policies
CREATE POLICY "Users can view own activities" ON public.user_activities
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own activities" ON public.user_activities
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Community posts policies
CREATE POLICY "Anyone can view community posts" ON public.community_posts
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create posts" ON public.community_posts
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update own posts" ON public.community_posts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own posts" ON public.community_posts
  FOR DELETE USING (auth.uid() = user_id);

-- Post likes policies
CREATE POLICY "Anyone can view post likes" ON public.post_likes
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can like posts" ON public.post_likes
  FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = user_id);

CREATE POLICY "Users can unlike their own likes" ON public.post_likes
  FOR DELETE USING (auth.uid() = user_id);

-- Post comments policies
CREATE POLICY "Anyone can view post comments" ON public.post_comments
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create comments" ON public.post_comments
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update own comments" ON public.post_comments
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments" ON public.post_comments
  FOR DELETE USING (auth.uid() = user_id);

-- Post reports policies
CREATE POLICY "Anyone can view post reports" ON public.post_reports
  FOR SELECT USING (auth.uid() = reporter_user_id);

CREATE POLICY "Reporters can create reports" ON public.post_reports
  FOR INSERT WITH CHECK (auth.uid() = reporter_user_id);

CREATE POLICY "Admins can manage reports" ON public.post_reports
  FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true));

-- Community challenges policies
CREATE POLICY "Anyone can view challenges" ON public.community_challenges
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can join challenges" ON public.community_challenges
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Challenge participants policies
CREATE POLICY "Users can view own challenge participation" ON public.challenge_participants
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can join challenges" ON public.challenge_participants
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Contact messages policies
CREATE POLICY "Anyone can submit contact messages" ON public.contact_messages
  FOR INSERT WITH CHECK (auth.role() = 'authenticated' OR auth.role() = 'anon');

CREATE POLICY "Admins can view all contact messages" ON public.contact_messages
  FOR SELECT USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true));

-- ===========================================
-- PART 4: Functions and Triggers (safe creation)
-- ===========================================

-- Drop existing functions if they exist
DROP FUNCTION IF EXISTS update_post_likes_count() CASCADE;
DROP FUNCTION IF EXISTS update_post_comments_count() CASCADE;

-- Functions for automatic like/comment counting
CREATE OR REPLACE FUNCTION update_post_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.community_posts 
    SET likes_count = likes_count + 1 
    WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.community_posts 
    SET likes_count = GREATEST(likes_count - 1, 0) 
    WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_post_comments_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.community_posts 
    SET comments_count = comments_count + 1 
    WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.community_posts 
    SET comments_count = GREATEST(comments_count - 1, 0) 
    WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS post_likes_count_trigger ON public.post_likes;
DROP TRIGGER IF EXISTS post_comments_count_trigger ON public.post_comments;

-- Create triggers
CREATE TRIGGER post_likes_count_trigger
  AFTER INSERT OR DELETE ON public.post_likes
  FOR EACH ROW EXECUTE FUNCTION update_post_likes_count();

CREATE TRIGGER post_comments_count_trigger
  AFTER INSERT OR DELETE ON public.post_comments
  FOR EACH ROW EXECUTE FUNCTION update_post_comments_count();

-- ===========================================
-- PART 5: Permissions (safe grants)
-- ===========================================

GRANT ALL ON public.profiles TO authenticated;
GRANT ALL ON public.user_stats TO authenticated;
GRANT ALL ON public.activities TO authenticated;
GRANT ALL ON public.user_activities TO authenticated;
GRANT ALL ON public.community_posts TO authenticated;
GRANT ALL ON public.post_likes TO authenticated;
GRANT ALL ON public.post_comments TO authenticated;
GRANT ALL ON public.post_reports TO authenticated;
GRANT ALL ON public.community_challenges TO authenticated;
GRANT ALL ON public.challenge_participants TO authenticated;
GRANT ALL ON public.contact_messages TO authenticated;

-- Grant sequence permissions for auto-incrementing IDs
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION update_post_likes_count() TO authenticated;
GRANT EXECUTE ON FUNCTION update_post_comments_count() TO authenticated;
GRANT EXECUTE ON FUNCTION handle_new_user() TO authenticated;

-- Success message
SELECT 
  'Safe database setup completed successfully!' as status,
  'All tables, functions, triggers, and RLS policies have been created or updated safely.' as details,
  'Your Karma Club application is now fully configured!' as message;