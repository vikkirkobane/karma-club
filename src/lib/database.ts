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
  country_code?: string;
  organization?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
  is_admin: boolean;
  role: string;
}

export interface UserStats {
  user_id: string;
  points: number;
  level: number;
  streak: number;
  created_at: string;
  updated_at: string;
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
  status?: string; // pending, approved, rejected
  reviewed_at?: string;
  reviewed_by?: string;
  review_notes?: string;
  submission_title?: string;
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
  mediaUrl?: string,
  submissionTitle?: string
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
      points_earned: activity.points,
      status: 'pending', // Default status is pending for admin review
      submission_title: submissionTitle
    });

  if (error) {
    console.error('Error completing activity:', error);
    return false;
  }

  return true;
}

// Function to get user activities with their status (for admin review)
export async function getUserActivitiesWithStatus(userId: string): Promise<UserActivity[]> {
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

// Function to get pending activities for admin review
export async function getPendingActivities(): Promise<UserActivity[]> {
  const { data, error } = await supabase
    .from('user_activities')
    .select('*, profiles(username, email), activities(title, points)')
    .eq('status', 'pending')
    .order('completed_at', { ascending: false });

  if (error) {
    console.error('Error fetching pending activities:', error);
    return [];
  }

  return data || [];
}

// Function to update activity status (for admin review)
export async function updateActivityStatus(
  activityId: number, 
  status: 'pending' | 'approved' | 'rejected', 
  reviewedBy?: string,
  reviewNotes?: string
): Promise<boolean> {
  const updates: {
    status: string;
    reviewed_at?: string;
    reviewed_by?: string;
    review_notes?: string;
  } = {
    status: status,
    reviewed_at: new Date().toISOString()
  };

  if (reviewedBy) {
    updates.reviewed_by = reviewedBy;
  }
  if (reviewNotes) {
    updates.review_notes = reviewNotes;
  }

  const { error } = await supabase
    .from('user_activities')
    .update(updates)
    .eq('id', activityId);

  if (error) {
    console.error('Error updating activity status:', error);
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
// Community Challenge Interfaces
export interface CommunityChallenge {
  id: number;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  reward_points: number;
  reward_badge?: string;
  participants_count: number;
  is_active: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface ChallengeParticipant {
  id: number;
  challenge_id: number;
  user_id: string;
  progress: number;
  completed: boolean;
  joined_at: string;
  completed_at?: string;
}

// Community Challenge Functions
export async function getActiveChallenges(): Promise<CommunityChallenge[]> {
  try {
    const { data, error } = await supabase
      .from('community_challenges')
      .select('*')
      .eq('is_active', true)
      .order('start_date', { ascending: false });

    if (error) {
      // Check if it's a "relation does not exist" error
      if (error.code === 'PGRST116' || error.message.includes('relation') || error.message.includes('does not exist')) {
        console.warn('Community challenges table does not exist. Please run the community migration SQL.');
        return [];
      }
      console.error('Error fetching active challenges:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getActiveChallenges:', error);
    return [];
  }
}

export async function joinChallenge(userId: string, challengeId: number): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('challenge_participants')
      .insert({
        challenge_id: challengeId,
        user_id: userId
      });

    if (error) {
      console.error('Error joining challenge:', error);
      return false;
    }

    // Update participants count in the challenge - try RPC function if it exists
    try {
      await supabase.rpc('update_challenge_participants_count');
    } catch (rpcError) {
      console.warn('Challenge participants count update function not available:', rpcError);
      // This is okay - the count will be calculated on read or updated by triggers
    }

    return true;
  } catch (error) {
    console.error('Error in joinChallenge:', error);
    return false;
  }
}

export async function getChallengeParticipants(challengeId: number): Promise<ChallengeParticipant[]> {
  try {
    const { data, error } = await supabase
      .from('challenge_participants')
      .select('*')
      .eq('challenge_id', challengeId);

    if (error) {
      // Check if it's a "relation does not exist" error
      if (error.code === 'PGRST116' || error.message.includes('relation') || error.message.includes('does not exist')) {
        console.warn('Challenge participants table does not exist. Please run the community migration SQL.');
        return [];
      }
      console.error('Error fetching challenge participants:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getChallengeParticipants:', error);
    return [];
  }
}

export async function getUserChallengeParticipation(userId: string): Promise<ChallengeParticipant[]> {
  try {
    const { data, error } = await supabase
      .from('challenge_participants')
      .select('*, community_challenges(title, end_date)')
      .eq('user_id', userId);

    if (error) {
      // Check if it's a "relation does not exist" error
      if (error.code === 'PGRST116' || error.message.includes('relation') || error.message.includes('does not exist')) {
        console.warn('Challenge participants table does not exist. Please run the community migration SQL.');
        return [];
      }
      console.error('Error fetching user challenge participation:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getUserChallengeParticipation:', error);
    return [];
  }
}

// Contact Message Interface
export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status?: string; // new, read, replied
  created_at: string;
  updated_at: string;
}

// Contact Message Functions
export async function submitContactMessage(message: Omit<ContactMessage, 'id' | 'status' | 'created_at' | 'updated_at'>): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('contact_messages')
      .insert({
        name: message.name,
        email: message.email,
        subject: message.subject,
        message: message.message
      });

    if (error) {
      console.error('Error submitting contact message:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in submitContactMessage:', error);
    return false;
  }
}

// Post Report Interface
export interface PostReport {
  id: number;
  post_id?: number;
  comment_id?: number;
  reporter_user_id: string;
  reason: string;
  description?: string;
  status: string; // pending, reviewed, resolved
  reviewed_by?: string;
  reviewed_at?: string;
  created_at: string;
}

// Post Report Functions
export async function reportPost(
  reporterUserId: string, 
  postId: number, 
  reason: string, 
  description?: string
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('post_reports')
      .insert({
        post_id: postId,
        reporter_user_id: reporterUserId,
        reason: reason,
        description: description
      });

    if (error) {
      console.error('Error reporting post:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in reportPost:', error);
    return false;
  }
}

export async function reportComment(
  reporterUserId: string, 
  commentId: number, 
  reason: string, 
  description?: string
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('post_reports')
      .insert({
        comment_id: commentId,
        reporter_user_id: reporterUserId,
        reason: reason,
        description: description
      });

    if (error) {
      console.error('Error reporting comment:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in reportComment:', error);
    return false;
  }
}

export async function getReportsForAdmin(userId: string): Promise<PostReport[]> {
  try {
    const { data, error } = await supabase
      .from('post_reports')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching reports:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getReportsForAdmin:', error);
    return [];
  }
}

export async function updateReportStatus(reportId: number, status: string, reviewedBy?: string): Promise<boolean> {
  try {
    const updates: { status: string; reviewed_at?: string; reviewed_by?: string } = {
      status: status,
      reviewed_at: new Date().toISOString()
    };

    if (reviewedBy) {
      updates.reviewed_by = reviewedBy;
    }

    const { error } = await supabase
      .from('post_reports')
      .update(updates)
      .eq('id', reportId);

    if (error) {
      console.error('Error updating report status:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in updateReportStatus:', error);
    return false;
  }
}

export async function getCommunityStats(): Promise<{
  activeMembers: number;
  actsShared: number;
  totalComments: number;
  badgesEarned: number;
}> {
  try {
    // First, try to get stats from the community_stats view if it exists
    const { data, error } = await supabase
      .from('community_stats')
      .select('*')
      .single();

    if (error) {
      // If the view doesn't exist, calculate stats from the actual data tables
      console.warn('Community stats view not available. Calculating from tables.');
      
      // Calculate active members from profiles
      const { count: activeMembers, error: membersError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });
      
      // Calculate acts shared from community_posts
      const { count: actsShared, error: actsError } = await supabase
        .from('community_posts')
        .select('*', { count: 'exact', head: true });
      
      // Calculate total comments from post_comments
      const { count: totalComments, error: commentsError } = await supabase
        .from('post_comments')
        .select('*', { count: 'exact', head: true });
      
      // Return calculated stats or defaults if there are errors
      return {
        activeMembers: activeMembers || 0,
        actsShared: actsShared || 0,
        totalComments: totalComments || 0,
        // For badges earned, we'll return a default since there's no direct equivalent
        badgesEarned: 892
      };
    }

    return {
      activeMembers: data.active_members || data.activeMembers || 0,
      actsShared: data.acts_shared || data.actsShared || 0,
      totalComments: data.total_comments || data.totalComments || 0,
      badgesEarned: data.badges_earned || data.badgesEarned || 0
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