import { supabase } from './supabase';

export const getUserProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    throw error;
  }

  return data;
};

export const getActivities = async () => {
  const { data, error } = await supabase.from('activities').select('*');

  if (error) {
    throw error;
  }

  return data;
};

export const getLeaderboard = async () => {
  const { data, error } = await supabase
    .from('user_stats')
    .select('user_id, points, level, users(username, country, organization)')
    .order('points', { ascending: false });

  if (error) {
    throw error;
  }

  return data;
};

export interface ActivitySubmission {
  activityId: string;
  title: string;
  description: string;
  mediaUrl?: string;
}

// Define return type for successful submission
interface ActivitySubmissionResult {
  id: string;
  user_id: string;
  activity_id: number;
  description: string;
  media_url?: string;
  completed_at: string;
}

export const submitActivity = async (userId: string, submission: ActivitySubmission): Promise<ActivitySubmissionResult | { success: true }> => {
  console.log('submitActivity called with:', { userId, submission });
  
  const numericActivityId = activityIdMap[submission.activityId];
  console.log('Activity ID mapping:', { 
    stringId: submission.activityId, 
    numericId: numericActivityId 
  });
  
  if (!numericActivityId) {
    console.error('Available activity IDs:', Object.keys(activityIdMap));
    throw new Error(`Unknown activity ID: ${submission.activityId}`);
  }

  console.log('Attempting to insert activity to database...');
  
  // Set timeout promise
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => reject(new Error('Database insertion timeout')), 10000); // 10 second timeout
  });

  // Database insertion promise
  const insertPromise = supabase
    .from('user_activities')
    .insert([{
      user_id: userId,
      activity_id: numericActivityId,
      description: submission.description,
      media_url: submission.mediaUrl,
      completed_at: new Date().toISOString()
    }])
    .select()
    .single();

  // Wait for either the insertion to complete or the timeout
  const insertResult = await Promise.race([insertPromise, timeoutPromise]) as any;

  // If Promise.race returned an error (timeout), this will throw
  // If it's the actual result from the database call:
  if (insertResult.error) {
    console.error('Database insertion error:', insertResult.error);
    throw insertResult.error;
  }

  console.log('Activity submitted successfully:', insertResult.data);
  return insertResult.data as ActivitySubmissionResult;
};

export const updateUserPoints = async (userId: string, pointsToAdd: number) => {
  // Direct update approach since RPC function doesn't exist in database
  try {
    // First, get current stats or create them if they don't exist
    const { data: currentStats, error: fetchError } = await supabase
      .from('user_stats')
      .select('points')
      .eq('user_id', userId)
      .maybeSingle();

    if (fetchError && fetchError.code !== 'PGRST116') {
      throw fetchError;
    }

    // If no stats exist, create them
    if (!currentStats) {
      const { data: newStats, error: insertError } = await supabase
        .from('user_stats')
        .insert({ 
          user_id: userId, 
          points: pointsToAdd,
          level: Math.max(1, Math.floor(pointsToAdd / 100) + 1),
          streak: 0
        })
        .select()
        .single();

      if (insertError) {
        throw insertError;
      }

      return newStats;
    }

    // Update existing stats
    const newPoints = (currentStats.points || 0) + pointsToAdd;
    const newLevel = Math.max(1, Math.floor(newPoints / 100) + 1);
    
    const { data: updatedData, error: updateError } = await supabase
      .from('user_stats')
      .update({ 
        points: newPoints,
        level: newLevel
      })
      .eq('user_id', userId)
      .select()
      .single();

    if (updateError) {
      throw updateError;
    }

    return updatedData;
  } catch (error) {
    console.error('Error updating user points:', error);
    throw error;
  }
};

export const getUserCompletedActivities = async (userId: string) => {
  const { data, error } = await supabase
    .from('user_activities')
    .select(`
      *,
      activities:activity_id (
        title,
        description,
        points
      )
    `)
    .eq('user_id', userId)
    .order('completed_at', { ascending: false });

  if (error) {
    throw error;
  }

  // Add string ID mapping to the results
  return data.map(activity => ({
    ...activity,
    string_activity_id: reverseActivityIdMap[activity.activity_id] || `unknown-${activity.activity_id}`
  }));
};

export const checkActivityCompletion = async (userId: string, activityId: string) => {
  const numericId = activityIdMap[activityId];
  if (!numericId) {
    return false;
  }

  const { data, error } = await supabase
    .from('user_activities')
    .select('id')
    .eq('user_id', userId)
    .eq('activity_id', numericId)
    .limit(1);

  if (error) {
    throw error;
  }

  return data && data.length > 0;
};

// Admin functions for managing submissions
export const getActivitySubmissions = async (filters?: {
  status?: 'pending' | 'approved' | 'rejected';
  userId?: string;
  activityId?: string;
}) => {
  let query = supabase
    .from('user_activities')
    .select(`
      *,
      profiles:user_id (
        username,
        avatar_url,
        country
      ),
      activities:activity_id (
        title,
        description,
        points
      )
    `)
    .order('completed_at', { ascending: false });

  // Apply filters if provided
  if (filters?.status) {
    query = query.eq('status', filters.status);
  }
  if (filters?.userId) {
    query = query.eq('user_id', filters.userId);
  }
  if (filters?.activityId) {
    query = query.eq('activity_id', filters.activityId);
  }

  const { data, error } = await query;
  
  if (error) {
    throw error;
  }

  return data;
};

export const updateSubmissionStatus = async (
  submissionId: string,
  status: 'approved' | 'rejected',
  reviewNotes?: string,
  reviewerId?: string
) => {
  const { data, error } = await supabase
    .from('user_activities')
    .update({
      status,
      reviewed_at: new Date().toISOString(),
      reviewed_by: reviewerId,
      review_notes: reviewNotes
    })
    .eq('id', submissionId)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
};

// Create a reverse mapping from numeric IDs to string IDs
const createActivityIdMappings = () => {
  const stringToNumeric: { [key: string]: number } = {
    // Daily activities (1-10)
    'daily-1': 1, 'daily-2': 2, 'daily-3': 3, 'daily-4': 4, 'daily-5': 5, 'daily-6': 6,
    'daily-7': 7, 'daily-8': 8, 'daily-9': 9, 'daily-10': 10,
    
    // Volunteer activities (11-20) - Updated range
    'volunteer-1': 11, 'volunteer-2': 12, 'volunteer-3': 13, 'volunteer-4': 14, 'volunteer-5': 15,
    'volunteer-6': 16, 'volunteer-7': 17, 'volunteer-8': 18, 'volunteer-9': 19, 'volunteer-10': 20,
    
    // Engagement activities (21-30) - Updated range
    'engagement-1': 21, 'engagement-2': 22, 'engagement-3': 23, 'engagement-4': 24, 'engagement-5': 25,
    'engagement-6': 26, 'engagement-7': 27, 'engagement-8': 28, 'engagement-9': 29, 'engagement-10': 30,
    
    // Support activities (31-40) - Updated range
    'support-1': 31, 'support-2': 32, 'support-3': 33, 'support-4': 34, 'support-5': 35,
    'support-6': 36, 'support-7': 37, 'support-8': 38, 'support-9': 39, 'support-10': 40,
  };

  const numericToString: { [key: number]: string } = {};
  Object.entries(stringToNumeric).forEach(([str, num]) => {
    numericToString[num] = str;
  });

  return { stringToNumeric, numericToString };
};

const { stringToNumeric: activityIdMap, numericToString: reverseActivityIdMap } = createActivityIdMappings();

export const getSubmissionStats = async () => {
  const { data, error } = await supabase
    .from('user_activities')
    .select('status');

  if (error) {
    throw error;
  }

  const stats = {
    total: data.length,
    pending: data.filter(item => item.status === 'pending').length,
    approved: data.filter(item => item.status === 'approved').length,
    rejected: data.filter(item => item.status === 'rejected').length,
  };

  return stats;
};


