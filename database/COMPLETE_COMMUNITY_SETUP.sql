-- COMPLETE COMMUNITY FEATURES Setup for Karma Club
-- Copy and paste this ENTIRE script into your Supabase SQL Editor
-- This includes ALL tables, functions, triggers, and views needed for community features
-- PREREQUISITE: Main database migration should be run first (database-migration.sql)
-- =====================================================================================

-- Ensure profiles table exists (should already exist from main migration)
-- If it doesn't exist, create it
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username VARCHAR(255),
  email VARCHAR(255),
  country VARCHAR(255),
  country_code VARCHAR(10),
  organization VARCHAR(255),
  avatar_url VARCHAR(255),
  is_admin BOOLEAN DEFAULT FALSE,
  role VARCHAR(20) DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS for profiles (safe if already exists)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles (will not conflict if they exist)
DROP POLICY IF EXISTS "Anyone can view profiles" ON public.profiles;
CREATE POLICY "Anyone can view profiles" ON public.profiles
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- 1. Create community_posts table
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

-- Enable RLS for community_posts
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;

-- Create policies for community_posts
DROP POLICY IF EXISTS "Anyone can view community posts" ON public.community_posts;
CREATE POLICY "Anyone can view community posts" ON public.community_posts
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can create posts" ON public.community_posts;
CREATE POLICY "Authenticated users can create posts" ON public.community_posts
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can update own posts" ON public.community_posts;
CREATE POLICY "Users can update own posts" ON public.community_posts
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own posts" ON public.community_posts;
CREATE POLICY "Users can delete own posts" ON public.community_posts
  FOR DELETE USING (auth.uid() = user_id);

-- 2. Create post_likes table
CREATE TABLE IF NOT EXISTS public.post_likes (
  id BIGSERIAL PRIMARY KEY,
  post_id BIGINT REFERENCES public.community_posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(post_id, user_id)
);

-- Enable RLS for post_likes
ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;

-- Create policies for post_likes
DROP POLICY IF EXISTS "Anyone can view post likes" ON public.post_likes;
CREATE POLICY "Anyone can view post likes" ON public.post_likes
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can like posts" ON public.post_likes;
CREATE POLICY "Authenticated users can like posts" ON public.post_likes
  FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can unlike their own likes" ON public.post_likes;
CREATE POLICY "Users can unlike their own likes" ON public.post_likes
  FOR DELETE USING (auth.uid() = user_id);

-- 3. Create post_comments table
CREATE TABLE IF NOT EXISTS public.post_comments (
  id BIGSERIAL PRIMARY KEY,
  post_id BIGINT REFERENCES public.community_posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  parent_comment_id BIGINT REFERENCES public.post_comments(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS for post_comments
ALTER TABLE public.post_comments ENABLE ROW LEVEL SECURITY;

-- Create policies for post_comments
DROP POLICY IF EXISTS "Anyone can view post comments" ON public.post_comments;
CREATE POLICY "Anyone can view post comments" ON public.post_comments
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can create comments" ON public.post_comments;
CREATE POLICY "Authenticated users can create comments" ON public.post_comments
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can update own comments" ON public.post_comments;
CREATE POLICY "Users can update own comments" ON public.post_comments
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own comments" ON public.post_comments;
CREATE POLICY "Users can delete own comments" ON public.post_comments
  FOR DELETE USING (auth.uid() = user_id);

-- 4. Create post_reports table for content moderation
CREATE TABLE IF NOT EXISTS public.post_reports (
  id BIGSERIAL PRIMARY KEY,
  post_id BIGINT REFERENCES public.community_posts(id) ON DELETE CASCADE,
  comment_id BIGINT REFERENCES public.post_comments(id) ON DELETE CASCADE,
  reporter_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  reason TEXT NOT NULL,
  description TEXT,
  status VARCHAR(20) DEFAULT 'pending',
  reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT report_target_check CHECK (
    (post_id IS NOT NULL AND comment_id IS NULL) OR 
    (post_id IS NULL AND comment_id IS NOT NULL)
  )
);

-- Enable RLS for post_reports
ALTER TABLE public.post_reports ENABLE ROW LEVEL SECURITY;

-- Create policies for post_reports
DROP POLICY IF EXISTS "Users can view own reports" ON public.post_reports;
CREATE POLICY "Users can view own reports" ON public.post_reports
  FOR SELECT USING (auth.uid() = reporter_user_id);

DROP POLICY IF EXISTS "Authenticated users can create reports" ON public.post_reports;
CREATE POLICY "Authenticated users can create reports" ON public.post_reports
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 5. Create community_challenges table
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
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS for community_challenges
ALTER TABLE public.community_challenges ENABLE ROW LEVEL SECURITY;

-- Create policies for community_challenges
DROP POLICY IF EXISTS "Anyone can view active challenges" ON public.community_challenges;
CREATE POLICY "Anyone can view active challenges" ON public.community_challenges
  FOR SELECT USING (is_active = true);

-- 6. Create challenge_participants table
CREATE TABLE IF NOT EXISTS public.challenge_participants (
  id BIGSERIAL PRIMARY KEY,
  challenge_id BIGINT REFERENCES public.community_challenges(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  progress INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT FALSE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(challenge_id, user_id)
);

-- Enable RLS for challenge_participants
ALTER TABLE public.challenge_participants ENABLE ROW LEVEL SECURITY;

-- Create policies for challenge_participants
DROP POLICY IF EXISTS "Users can view own participation" ON public.challenge_participants;
CREATE POLICY "Users can view own participation" ON public.challenge_participants
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Authenticated users can join challenges" ON public.challenge_participants;
CREATE POLICY "Authenticated users can join challenges" ON public.challenge_participants
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can update own participation" ON public.challenge_participants;
CREATE POLICY "Users can update own participation" ON public.challenge_participants
  FOR UPDATE USING (auth.uid() = user_id);

-- 7. Functions for automatic like/comment counting
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

-- Function to safely toggle post likes (prevents double-likes)
CREATE OR REPLACE FUNCTION toggle_post_like(p_user_id UUID, p_post_id BIGINT)
RETURNS BOOLEAN AS $$
DECLARE
  like_exists BOOLEAN;
BEGIN
  -- Check if like already exists
  SELECT EXISTS(
    SELECT 1 FROM public.post_likes 
    WHERE user_id = p_user_id AND post_id = p_post_id
  ) INTO like_exists;
  
  IF like_exists THEN
    -- Remove the like
    DELETE FROM public.post_likes 
    WHERE user_id = p_user_id AND post_id = p_post_id;
    RETURN FALSE; -- Indicates unliked
  ELSE
    -- Add the like (with conflict handling)
    INSERT INTO public.post_likes (user_id, post_id) 
    VALUES (p_user_id, p_post_id)
    ON CONFLICT (post_id, user_id) DO NOTHING;
    RETURN TRUE; -- Indicates liked
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    RETURN NULL; -- Error occurred
END;
$$ LANGUAGE plpgsql;

-- Create triggers
DROP TRIGGER IF EXISTS post_likes_count_trigger ON public.post_likes;
CREATE TRIGGER post_likes_count_trigger
  AFTER INSERT OR DELETE ON public.post_likes
  FOR EACH ROW EXECUTE FUNCTION update_post_likes_count();

DROP TRIGGER IF EXISTS post_comments_count_trigger ON public.post_comments;
CREATE TRIGGER post_comments_count_trigger
  AFTER INSERT OR DELETE ON public.post_comments
  FOR EACH ROW EXECUTE FUNCTION update_post_comments_count();

-- 8. Function to update challenge participants count
CREATE OR REPLACE FUNCTION update_challenge_participants_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.community_challenges 
    SET participants_count = participants_count + 1 
    WHERE id = NEW.challenge_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.community_challenges 
    SET participants_count = GREATEST(participants_count - 1, 0) 
    WHERE id = OLD.challenge_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for challenge participants
DROP TRIGGER IF EXISTS challenge_participants_count_trigger ON public.challenge_participants;
CREATE TRIGGER challenge_participants_count_trigger
  AFTER INSERT OR DELETE ON public.challenge_participants
  FOR EACH ROW EXECUTE FUNCTION update_challenge_participants_count();

-- 9. Insert sample community challenge
INSERT INTO public.community_challenges (
  title,
  description,
  start_date,
  end_date,
  reward_points,
  reward_badge,
  is_active
) VALUES (
  'January Kindness Challenge',
  'Complete 31 acts of kindness in 31 days! Join thousands of members spreading positivity this month.',
  '2025-01-01 00:00:00+00',
  '2025-01-31 23:59:59+00',
  500,
  'kindness-champion',
  true
) ON CONFLICT DO NOTHING;

-- 10. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_community_posts_created_at ON public.community_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_community_posts_user_id ON public.community_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_post_likes_post_id ON public.post_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_post_likes_user_id ON public.post_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_post_comments_post_id ON public.post_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_post_comments_user_id ON public.post_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_challenge_participants_challenge_id ON public.challenge_participants(challenge_id);
CREATE INDEX IF NOT EXISTS idx_challenge_participants_user_id ON public.challenge_participants(user_id);

-- 11. Create view for community stats (used by the app)
CREATE OR REPLACE VIEW public.community_stats AS
SELECT 
  (SELECT COUNT(*) FROM public.profiles) as active_members,
  (SELECT COUNT(*) FROM public.community_posts) as acts_shared,
  (SELECT COUNT(*) FROM public.post_comments) as total_comments,
  (SELECT COUNT(DISTINCT user_id) FROM public.user_stats WHERE points > 0) as badges_earned;

-- Allow anyone to view community stats
GRANT SELECT ON public.community_stats TO anon, authenticated;

-- 12. Grant necessary permissions
GRANT ALL ON public.community_posts TO authenticated;
GRANT ALL ON public.post_likes TO authenticated;  
GRANT ALL ON public.post_comments TO authenticated;
GRANT ALL ON public.post_reports TO authenticated;
GRANT ALL ON public.community_challenges TO authenticated;
GRANT ALL ON public.challenge_participants TO authenticated;

-- Grant sequence permissions for auto-incrementing IDs
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION toggle_post_like(UUID, BIGINT) TO authenticated;
GRANT EXECUTE ON FUNCTION update_post_likes_count() TO authenticated;
GRANT EXECUTE ON FUNCTION update_post_comments_count() TO authenticated;
GRANT EXECUTE ON FUNCTION update_challenge_participants_count() TO authenticated;

-- Success message
SELECT 
  'Community features setup completed successfully!' as status,
  'All tables, functions, triggers, and views have been created.' as details,
  'Your Karma Club community features are now fully functional!' as message;