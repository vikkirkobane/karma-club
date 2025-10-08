import { supabase } from './supabase';

// Community features availability checker
let communityFeaturesAvailable: boolean | null = null;

export async function checkCommunityFeaturesAvailable(): Promise<boolean> {
  if (communityFeaturesAvailable !== null) {
    return communityFeaturesAvailable;
  }

  try {
    const { data, error } = await supabase
      .from('community_posts')
      .select('id')
      .limit(1);
    
    communityFeaturesAvailable = !error;
    return communityFeaturesAvailable;
  } catch (error) {
    communityFeaturesAvailable = false;
    return false;
  }
}

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  country?: string;
  organization?: string;
  avatar_url?: string;
  created_at: string;
}

export interface UserStats {
  user_id: string;
  points: number;
  level: number;
  streak: number;
}

export interface Activity {
  id: number;
  title: string;
  description: string;
  category_id: number;
  points: number;
  is_active: boolean;
}

export interface ActivityCategory {
  id: number;
  name: string;
  description: string;
  icon: string;
}

export interface UserActivity {
  id: number;
  user_id: string;
  activity_id: number;
  completed_at: string;
  media_url?: string;
  description?: string;
  points_earned: number;
}

// User Profile Functions
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }

  return data;
}

export async function updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<boolean> {
  const { error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId);

  if (error) {
    console.error('Error updating user profile:', error);
    return false;
  }

  return true;
}

// User Stats Functions
export async function getUserStats(userId: string): Promise<UserStats | null> {
  const { data, error } = await supabase
    .from('user_stats')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) {
    console.error('Error fetching user stats:', error);
    return null;
  }

  return data;
}

// Activity Functions
export async function getActivities(): Promise<Activity[]> {
  const { data, error } = await supabase
    .from('activities')
    .select('*')
    .eq('is_active', true)
    .order('points', { ascending: false });

  if (error) {
    console.error('Error fetching activities:', error);
    return [];
  }

  return data || [];
}

export async function getActivityCategories(): Promise<ActivityCategory[]> {
  const { data, error } = await supabase
    .from('activity_categories')
    .select('*')
    .order('name');

  if (error) {
    console.error('Error fetching activity categories:', error);
    return [];
  }

  return data || [];
}

// User Activity Functions
export async function getUserActivities(userId: string): Promise<UserActivity[]> {
  const { data, error } = await supabase
    .from('user_activities')
    .select('*, activities(title, points)')
    .eq('user_id', userId)
    .order('completed_at', { ascending: false });

  if (error) {
    console.error('Error fetching user activities:', error);
    return [];
  }

  return data || [];
}

export async function completeActivity(
  userId: string,
  activityId: number,
  description?: string,
  mediaUrl?: string
): Promise<boolean> {
  // First get the activity to know how many points to award
  const { data: activity, error: activityError } = await supabase
    .from('activities')
    .select('points')
    .eq('id', activityId)
    .single();

  if (activityError || !activity) {
    console.error('Error fetching activity:', activityError);
    return false;
  }

  // Insert the completed activity
  const { error } = await supabase
    .from('user_activities')
    .insert({
      user_id: userId,
      activity_id: activityId,
      description,
      media_url: mediaUrl,
      points_earned: activity.points
    });

  if (error) {
    console.error('Error completing activity:', error);
    return false;
  }

  return true;
}

export interface LeaderboardEntry {
  points: number;
  level: number;
  profiles: {
    username: string;
    country: string;
  };
}

// Leaderboard Functions
export async function getLeaderboard(limit: number = 10): Promise<LeaderboardEntry[]> {
  const { data, error } = await supabase
    .from('user_stats')
    .select(`
      points,
      level,
      profiles(username, country)
    `)
    .order('points', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching leaderboard:', error);
    return [];
  }

  return data || [];
}

export interface CommunityPost {
  id: number;
  content: string;
  media_url?: string;
  likes_count: number;
  comments_count: number;
  created_at: string;
  profiles: {
    username: string;
    avatar_url: string;
  };
  user_liked?: boolean;
}

// Community Functions
export async function getCommunityPosts(limit: number = 20, userId?: string): Promise<CommunityPost[]> {
  try {
    const { data, error } = await supabase
      .from('community_posts')
      .select(`
        id,
        content,
        media_url,
        likes_count,
        comments_count,
        created_at,
        profiles(username, avatar_url)
      `)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      // Check if it's a "relation does not exist" error (table doesn't exist)
      if (error.code === 'PGRST116' || error.message.includes('relation') || error.message.includes('does not exist')) {
        console.warn('Community posts table does not exist. Please run the community migration SQL.');
        return [];
      }
      console.error('Error fetching community posts:', error);
      return [];
    }

    // If user is provided, check which posts they have liked
    if (userId && data) {
      const { data: userLikes, error: likesError } = await supabase
        .from('post_likes')
        .select('post_id')
        .eq('user_id', userId);

      if (!likesError && userLikes) {
        const likedPostIds = new Set(userLikes.map(like => like.post_id));
        
        return data.map(post => ({
          ...post,
          user_liked: likedPostIds.has(post.id)
        }));
      }
    }

    // Return posts without user_liked status if no user or error
    return (data || []).map(post => ({
      ...post,
      user_liked: false
    }));
  } catch (error) {
    console.error('Error in getCommunityPosts:', error);
    return [];
  }
}

export async function createCommunityPost(userId: string, content: string, mediaUrl?: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('community_posts')
      .insert({
        user_id: userId,
        content: content,
        media_url: mediaUrl
      });

    if (error) {
      // Check if it's a "relation does not exist" error (table doesn't exist)
      if (error.code === 'PGRST116' || error.message.includes('relation') || error.message.includes('does not exist')) {
        console.warn('Community posts table does not exist. Please run the community migration SQL.');
        return false;
      }
      console.error('Error creating community post:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error creating community post:', error);
    return false;
  }
}

export async function togglePostLike(userId: string, postId: number): Promise<boolean> {
  try {
    // Use the PostgreSQL function for safe like toggling
    const { data, error } = await supabase
      .rpc('toggle_post_like', {
        p_user_id: userId,
        p_post_id: postId
      });

    if (error) {
      // Check if it's a function doesn't exist error
      if (error.code === 'PGRST116' || error.code === '42883' || error.message.includes('function') || error.message.includes('does not exist')) {
        console.warn('Community features not available. Please run the community migration SQL.');
        return false;
      }
      console.error('Error toggling like:', error);
      return false;
    }

    // data will be true if liked, false if unliked, null if error
    return data !== null;
  } catch (error) {
    console.error('Error in togglePostLike:', error);
    
    // Fallback to the original method if the function doesn't exist
    try {
      // Check if user already liked this post
      const { data: existingLike, error: checkError } = await supabase
        .from('post_likes')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', userId)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        console.error('Error checking existing like:', checkError);
        return false;
      }

      if (existingLike) {
        // Unlike the post
        const { error } = await supabase
          .from('post_likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', userId);

        if (error) {
          console.error('Error removing like:', error);
          return false;
        }
      } else {
        // Like the post
        const { error } = await supabase
          .from('post_likes')
          .insert({
            post_id: postId,
            user_id: userId
          });

        if (error) {
          console.error('Error adding like:', error);
          return false;
        }
      }

      return true;
    } catch (fallbackError) {
      console.error('Fallback method also failed:', fallbackError);
      return false;
    }
  }
}

export interface Comment {
  id: string;
  content: string;
  created_at: string;
  profiles: {
    username: string;
    avatar_url: string;
  };
}

export async function getPostComments(postId: number): Promise<Comment[]> {
  try {
    const { data, error } = await supabase
      .from('post_comments')
      .select(`
        id,
        content,
        created_at,
        profiles(username, avatar_url)
      `)
      .eq('post_id', postId)
      .order('created_at', { ascending: true });

    if (error) {
      // Check if it's a "relation does not exist" error (table doesn't exist)
      if (error.code === 'PGRST116' || error.message.includes('relation') || error.message.includes('does not exist')) {
        console.warn('Comment table does not exist. Please run the community migration SQL.');
        return [];
      }
      console.error('Error fetching comments:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getPostComments:', error);
    return [];
  }
}

export async function createComment(userId: string, postId: number, content: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('post_comments')
      .insert({
        post_id: postId,
        user_id: userId,
        content: content
      });

    if (error) {
      // Check if it's a "relation does not exist" error (table doesn't exist)
      if (error.code === 'PGRST116' || error.message.includes('relation') || error.message.includes('does not exist')) {
        console.warn('Comment table does not exist. Please run the community migration SQL.');
        return false;
      }
      console.error('Error creating comment:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in createComment:', error);
    return false;
  }
}

// Get community stats for the dashboard
export async function getCommunityStats(): Promise<{
  activeMembers: number;
  actsShared: number;
  totalComments: number;
  badgesEarned: number;
}> {
  try {
    const { data, error } = await supabase
      .from('community_stats')
      .select('*')
      .single();

    if (error) {
      // If view doesn't exist, return mock data
      console.warn('Community stats view not available. Using default values.');
      return {
        activeMembers: 1247,
        actsShared: 15432,
        totalComments: 3891,
        badgesEarned: 892
      };
    }

    return {
      activeMembers: data.active_members || 0,
      actsShared: data.acts_shared || 0,
      totalComments: data.total_comments || 0,
      badgesEarned: data.badges_earned || 0
    };
  } catch (error) {
    console.error('Error fetching community stats:', error);
    // Return fallback mock data
    return {
      activeMembers: 1247,
      actsShared: 15432,
      totalComments: 3891,
      badgesEarned: 892
    };
  }
}