-- Karma Club Database Migration
-- This file has been successfully applied to your Supabase database
-- Keep this file for reference or future database resets

-- 1. Create profiles table that syncs with auth.users
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

-- Enable RLS for profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- 2. Create user_stats table
CREATE TABLE IF NOT EXISTS public.user_stats (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  points INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  streak INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS for user_stats
ALTER TABLE public.user_stats ENABLE ROW LEVEL SECURITY;

-- Create policies for user_stats
CREATE POLICY "Users can view own stats" ON public.user_stats
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own stats" ON public.user_stats
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own stats" ON public.user_stats
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow viewing stats for leaderboard (without personal info)
CREATE POLICY "Public can view stats for leaderboard" ON public.user_stats
  FOR SELECT USING (true);

-- 3. Create activity_categories table
CREATE TABLE IF NOT EXISTS public.activity_categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  icon VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS for activity_categories
ALTER TABLE public.activity_categories ENABLE ROW LEVEL SECURITY;

-- Create policy for activity_categories
CREATE POLICY "Anyone can view categories" ON public.activity_categories
  FOR SELECT USING (true);

-- 4. Create activities table
CREATE TABLE IF NOT EXISTS public.activities (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category_id INTEGER REFERENCES public.activity_categories(id),
  points INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS for activities
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;

-- Create policy for activities
CREATE POLICY "Anyone can view active activities" ON public.activities
  FOR SELECT USING (is_active = true);

-- 5. Create user_activities table (completed activities)
CREATE TABLE IF NOT EXISTS public.user_activities (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_id INTEGER REFERENCES public.activities(id) ON DELETE CASCADE,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  media_url VARCHAR(255),
  description TEXT,
  points_earned INTEGER DEFAULT 0
);

-- Enable RLS for user_activities
ALTER TABLE public.user_activities ENABLE ROW LEVEL SECURITY;

-- Create policies for user_activities
CREATE POLICY "Users can view own activities" ON public.user_activities
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own activities" ON public.user_activities
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Public can view activities for leaderboard" ON public.user_activities
  FOR SELECT USING (true);

-- 6. Insert sample activity categories
INSERT INTO public.activity_categories (name, description, icon) VALUES
  ('Environment', 'Activities that help protect and improve the environment', '🌱'),
  ('Community', 'Activities that strengthen local communities', '🤝'),
  ('Education', 'Activities that promote learning and knowledge sharing', '📚'),
  ('Health', 'Activities that promote physical and mental wellbeing', '💪'),
  ('Charity', 'Activities that help those in need', '❤️')
ON CONFLICT DO NOTHING;

-- 7. Insert sample activities
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

-- 8. Create function to automatically create profile on signup
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

-- 9. Create trigger to run the function on new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 10. Create function to update user stats when activity is completed
CREATE OR REPLACE FUNCTION public.update_user_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Update points and potentially level
  UPDATE public.user_stats 
  SET 
    points = points + NEW.points_earned,
    level = CASE 
      WHEN points + NEW.points_earned >= 100 THEN GREATEST(level, 2)
      WHEN points + NEW.points_earned >= 250 THEN GREATEST(level, 3)
      WHEN points + NEW.points_earned >= 500 THEN GREATEST(level, 4)
      WHEN points + NEW.points_earned >= 1000 THEN GREATEST(level, 5)
      ELSE level
    END,
    updated_at = CURRENT_TIMESTAMP
  WHERE user_id = NEW.user_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 11. Create trigger to update stats when activity is completed
DROP TRIGGER IF EXISTS on_activity_completed ON public.user_activities;
CREATE TRIGGER on_activity_completed
  AFTER INSERT ON public.user_activities
  FOR EACH ROW EXECUTE FUNCTION public.update_user_stats();

-- 12. Create community_posts table for social sharing
CREATE TABLE IF NOT EXISTS public.community_posts (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  media_url VARCHAR(255),
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS for community_posts
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;

-- Create policies for community_posts
CREATE POLICY "Anyone can view community posts" ON public.community_posts
  FOR SELECT USING (true);

CREATE POLICY "Users can insert own posts" ON public.community_posts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own posts" ON public.community_posts
  FOR UPDATE USING (auth.uid() = user_id);

-- 13. Create post_likes table
CREATE TABLE IF NOT EXISTS public.post_likes (
  id SERIAL PRIMARY KEY,
  post_id INTEGER REFERENCES public.community_posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(post_id, user_id)
);

-- Enable RLS for post_likes
ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;

-- Create policies for post_likes
CREATE POLICY "Anyone can view post likes" ON public.post_likes
  FOR SELECT USING (true);

CREATE POLICY "Users can manage own likes" ON public.post_likes
  FOR ALL USING (auth.uid() = user_id);

-- 14. Create post_comments table
CREATE TABLE IF NOT EXISTS public.post_comments (
  id SERIAL PRIMARY KEY,
  post_id INTEGER REFERENCES public.community_posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS for post_comments
ALTER TABLE public.post_comments ENABLE ROW LEVEL SECURITY;

-- Create policies for post_comments
CREATE POLICY "Anyone can view comments" ON public.post_comments
  FOR SELECT USING (true);

CREATE POLICY "Users can insert own comments" ON public.post_comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own comments" ON public.post_comments
  FOR UPDATE USING (auth.uid() = user_id);

-- 15. Create functions to update counts
CREATE OR REPLACE FUNCTION public.update_post_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.community_posts 
    SET likes_count = likes_count + 1 
    WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.community_posts 
    SET likes_count = likes_count - 1 
    WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.update_post_comments_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.community_posts 
    SET comments_count = comments_count + 1 
    WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.community_posts 
    SET comments_count = comments_count - 1 
    WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 16. Create triggers to automatically update counts
DROP TRIGGER IF EXISTS on_post_like_change ON public.post_likes;
CREATE TRIGGER on_post_like_change
  AFTER INSERT OR DELETE ON public.post_likes
  FOR EACH ROW EXECUTE FUNCTION public.update_post_likes_count();

DROP TRIGGER IF EXISTS on_post_comment_change ON public.post_comments;
CREATE TRIGGER on_post_comment_change
  AFTER INSERT OR DELETE ON public.post_comments
  FOR EACH ROW EXECUTE FUNCTION public.update_post_comments_count();

-- Success message
SELECT 'Database migration completed successfully! 🎉' as status;